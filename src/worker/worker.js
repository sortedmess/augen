export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
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

      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
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
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },

  async handleVisionRequest(request, env) {
    const { image, fullDescription = false, language = 'en' } = await request.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
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
    
    const basePrompt = fullDescription 
      ? "Describe this image in complete detail. If it contains text (like a menu, sign, or document), read all the text clearly and completely. If it's a scene, describe everything you see in detail. Be thorough and comprehensive as this will be read aloud to a visually impaired person."
      : "Provide a concise summary of this image. If it contains text (like a menu, sign, or document), give me the key information and main points only. If it's a scene, describe the most important elements. Keep it brief but informative for a visually impaired person.";
    
    const prompt = language === 'en' 
      ? basePrompt
      : `${basePrompt}\n\nCRITICAL: You MUST respond entirely in ${languageName} language. Do not use English. All descriptions, explanations, and text must be in ${languageName} only.`;

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
          'Access-Control-Allow-Origin': '*',
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
  }
};