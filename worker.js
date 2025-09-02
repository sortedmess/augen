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
        input: text,
        voice: voice,
        speed: 0.9,
        format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepinfra TTS API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Text-to-speech failed',
        details: errorText 
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        },
      });
    }

    // Return the audio data
    const audioData = await response.arrayBuffer();
    
    return new Response(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': 'https://augen.ignacio.tech',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
};