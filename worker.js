export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    
    try {
      // Vision API endpoint - Gemma-3-27b-it
      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await this.handleVisionRequest(request, env);
      }
      
      // Text-to-Speech endpoint - Kokoro-82M
      if (url.pathname === '/api/tts' && request.method === 'POST') {
        return await this.handleTTSRequest(request, env);
      }

      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
          },
        });
      }

      return new Response('Endpoint not found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }
  },

  async handleVisionRequest(request, env) {
    const { image, fullDescription = false } = await request.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }

    const prompt = fullDescription 
      ? "Describe this image in complete detail. If it contains text (like a menu, sign, or document), read all the text clearly and completely. If it's a scene, describe everything you see in detail. Be thorough and comprehensive as this will be read aloud to a visually impaired person."
      : "Provide a concise summary of this image. If it contains text (like a menu, sign, or document), give me the key information and main points only. If it's a scene, describe the most important elements. Keep it brief but informative for a visually impaired person.";

    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPINFRA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: fullDescription ? 1500 : 500,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepinfra Vision API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Vision analysis failed',
        details: errorText 
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || 'No description available';

    return new Response(JSON.stringify({ description }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },

  async handleTTSRequest(request, env) {
    const { text, voice = 'default' } = await request.json();
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }

    const response = await fetch('https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPINFRA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        output_format: "mp3",
        preset_voice: ["af_bella"],
        speed: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepinfra TTS API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'Text-to-speech failed',
        status: response.status,
        details: errorText 
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }

    let data;
    try {
      // Parse the JSON response and extract audio data
      data = await response.json();
      console.log('TTS API response structure:', Object.keys(data));
    } catch (parseError) {
      console.error('Failed to parse TTS response as JSON:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from TTS service',
        details: parseError.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }
    
    if (!data.audio) {
      console.error('No audio field in response:', data);
      return new Response(JSON.stringify({ 
        error: 'No audio data received from TTS service',
        responseData: data
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }
    
    // Check if audio is a URL instead of base64 data
    if (typeof data.audio === 'string' && data.audio.startsWith('http')) {
      // Audio is a URL, fetch it and return
      const audioResponse = await fetch(data.audio);
      if (!audioResponse.ok) {
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch audio from URL',
          audioUrl: data.audio
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
          },
        });
      }
      
      const audioData = await audioResponse.arrayBuffer();
      return new Response(audioData, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    // Handle data URL format (data:audio/mp3;base64,...)
    if (data.audio.startsWith('data:')) {
      const base64Start = data.audio.indexOf(',') + 1;
      const base64Data = data.audio.substring(base64Start);
      
      try {
        const binaryString = atob(base64Data);
        const audioBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          audioBuffer[i] = binaryString.charCodeAt(i);
        }
        
        return new Response(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (conversionError) {
        console.error('Failed to convert data URL base64:', conversionError);
        return new Response(JSON.stringify({ 
          error: 'Failed to process audio data URL',
          details: conversionError.message
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
          },
        });
      }
    }
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
};