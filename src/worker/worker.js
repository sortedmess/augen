export default {
  async fetch(request, env, ctx) {
    const allowedOrigin = this.getCorsOrigin(request);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    
    try {
      // Vision API endpoint - Groq Llama 4 Scout
      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await this.handleVisionRequest(request, env);
      }

      // Voice transcription endpoint - Groq Whisper
      if (url.pathname === '/api/transcribe' && request.method === 'POST') {
        return await this.handleTranscriptionRequest(request, env);
      }

      // Voice query endpoint
      if (url.pathname === '/api/voice-query' && request.method === 'POST') {
        return await this.handleVoiceQueryRequest(request, env);
      }

      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        });
      }

      return new Response('Endpoint not found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
        }
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }
  },

  getCorsOrigin(request) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://augen.ignacio.tech',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      return origin;
    }
    
    return 'https://augen.ignacio.tech';
  },

  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Basic prompt injection protection
    const dangerous = [
      'ignore previous', 'ignore all', 'forget', 'system:', 'assistant:',
      'override', 'bypass', 'admin', 'root', 'execute', '\\n\\n'
    ];
    
    let sanitized = input.toLowerCase();
    for (const phrase of dangerous) {
      if (sanitized.includes(phrase)) {
        console.warn(`Potentially dangerous input detected: ${phrase}`);
        // For now, just log. Could implement more sophisticated filtering
      }
    }
    
    return input.length > 1000 ? input.substring(0, 1000) : input;
  },

  async handleVisionRequest(request, env) {
    const allowedOrigin = this.getCorsOrigin(request);
    const { image, fullDescription = false, language = 'en', customPrompt = null } = await request.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }

    // Get language name for the prompt
    const languageNames = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French', 
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi'
    };
    
    const languageName = languageNames[language] || 'English';
    
    let prompt;
    
    if (customPrompt) {
      // Use custom prompt for voice queries (sanitized)
      const sanitizedCustomPrompt = this.sanitizeInput(customPrompt);
      prompt = language === 'en' 
        ? sanitizedCustomPrompt
        : `${sanitizedCustomPrompt}\n\nCRITICAL: You MUST respond entirely in ${languageName} language. Do not use English. All descriptions, explanations, and text must be in ${languageName} only.`;
    } else {
      // Use standard prompts for regular image analysis
      const basePrompt = fullDescription 
        ? "Describe this image in complete detail. If it contains text (like a menu, sign, or document), read all the text clearly and completely. If it's a scene, describe everything you see in detail. Be thorough and comprehensive as this will be read aloud to a visually impaired person."
        : "Provide a concise summary of this image. If it contains text (like a menu, sign, or document), give me the key information and main points only. If it's a scene, describe the most important elements. Keep it brief but informative for a visually impaired person.";
      
      prompt = language === 'en' 
        ? basePrompt
        : `${basePrompt}\n\nCRITICAL: You MUST respond entirely in ${languageName} language. Do not use English. All descriptions, explanations, and text must be in ${languageName} only.`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
        max_completion_tokens: fullDescription ? 1500 : 500,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq Vision API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Vision analysis failed',
        details: errorText 
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || 'No description available';

    return new Response(JSON.stringify({ description }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  },

  async handleTranscriptionRequest(request, env) {
    const allowedOrigin = this.getCorsOrigin(request);
    
    try {
      const formData = await request.formData();
      const audioFile = formData.get('file');
      const model = formData.get('model') || 'whisper-large-v3-turbo';
      const language = formData.get('language') || 'en';
      const temperature = parseFloat(formData.get('temperature') || '0.0');

      if (!audioFile) {
        return new Response(JSON.stringify({ error: 'Audio file required' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        });
      }

      // Convert the audio to a format suitable for Groq API
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

      const groqFormData = new FormData();
      groqFormData.append('file', audioBlob, 'recording.webm');
      groqFormData.append('model', model);
      groqFormData.append('language', language);
      groqFormData.append('temperature', temperature.toString());

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: groqFormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq Transcription API error:', errorText);
        return new Response(JSON.stringify({ 
          error: 'Transcription failed',
          details: errorText 
        }), {
          status: response.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        });
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({ 
        text: data.text || data.transcript || '',
        language: data.language || language
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });

    } catch (error) {
      console.error('Transcription handler error:', error);
      return new Response(JSON.stringify({ 
        error: 'Transcription processing failed',
        details: error.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }
  },

  async handleVoiceQueryRequest(request, env) {
    const allowedOrigin = this.getCorsOrigin(request);
    
    try {
      const { query, language = 'en' } = await request.json();
      
      if (!query) {
        return new Response(JSON.stringify({ error: 'Query required' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        });
      }

      // Sanitize the input to prevent prompt injection
      const sanitizedQuery = this.sanitizeInput(query);

      // Get language name for the prompt
      const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French', 
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi'
      };
      
      const languageName = languageNames[language] || 'English';
      
      // Create a contextual prompt for voice queries without images
      const systemPrompt = language === 'en' 
        ? `You are Augen, an AI vision assistant. The user has asked a voice question but no image is currently being analyzed. Respond helpfully to their query and if they're asking about visual content, politely explain that you need an image to analyze. Be concise and helpful.`
        : `You are Augen, an AI vision assistant. The user has asked a voice question but no image is currently being analyzed. Respond helpfully to their query and if they're asking about visual content, politely explain that you need an image to analyze. Be concise and helpful.\n\nCRITICAL: You MUST respond entirely in ${languageName} language. Do not use English.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: sanitizedQuery
            }
          ],
          max_completion_tokens: 300,
          temperature: 0.3,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq Voice Query API error:', errorText);
        return new Response(JSON.stringify({ 
          error: 'Voice query processing failed',
          details: errorText 
        }), {
          status: response.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        });
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || 'I could not process your request.';

      return new Response(JSON.stringify({ response: responseText }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });

    } catch (error) {
      console.error('Voice query handler error:', error);
      return new Response(JSON.stringify({ 
        error: 'Voice query processing failed',
        details: error.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }
  }
};