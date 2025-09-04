# Augen Deployment Guide - Cloudflare Worker + Groq

## Setup Instructions

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
# or
npm install wrangler --save-dev
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Get Groq API Key
1. Go to [Groq Console](https://console.groq.com)
2. Sign up/login
3. Get your API key from the dashboard
4. Copy the API key

### 4. Configure Your Domain
Create a local configuration file for your actual domain:
```bash
# Copy the template
cp wrangler.toml wrangler.toml.local

# Edit wrangler.toml.local and replace 'youractualdomain.com' with your real domain
```

Example `wrangler.toml.local`:
```toml
routes = [
  { pattern = "mysite.com/api/*", zone_name = "mysite.com" }
]
```

### 5. Set Environment Variables
```bash
# Set your Groq API key securely
wrangler secret put GROQ_API_KEY --env production
# Paste your API key when prompted

# For development
wrangler secret put GROQ_API_KEY --env development
```

### 6. Deploy the Worker
```bash
# Deploy to production using your local config
wrangler deploy --config wrangler.toml.local --env production

# Or deploy to development
wrangler deploy --config wrangler.toml.local --env development

# Alternative: Use npm scripts (update package.json first)
npm run deploy
```

### 7. Test the Deployment
Visit your domain and test:
- Health check: `https://yourdomain.com/api/health`
- The main app should work without any additional setup

## API Endpoints Created

### `/api/analyze` (POST)
- **Purpose**: Image analysis with Llama 4 Scout
- **Input**: `{ "image": "base64_string", "fullDescription": boolean }`
- **Output**: `{ "description": "text description" }`

### TTS Integration
- **Native TTS**: Uses browser's built-in speech synthesis
- **No API needed**: Works offline with speechSynthesis API
- **Multilingual**: Supports 12+ languages automatically

### `/api/health` (GET)
- **Purpose**: Health check
- **Output**: `{ "status": "ok", "timestamp": number }`

## Cost Estimation

### Groq Pricing:
- **Ultra-fast inference**: Llama 4 Scout with low latency
- **Competitive pricing**: Check Groq console for current rates
- **No TTS costs**: Native browser speech synthesis

### Cloudflare Workers:
- **Free tier**: 100,000 requests/day
- **Paid tier**: $5/month for 10M requests

## Troubleshooting

### Worker not responding:
```bash
# Check worker logs
wrangler tail --env production
```

### API key issues:
```bash
# List secrets
wrangler secret list --env production

# Update secret
wrangler secret put GROQ_API_KEY --env production
```

### Domain routing issues:
1. Make sure your domain is added to Cloudflare
2. Check that the zone_name matches exactly
3. DNS should be proxied (orange cloud) in Cloudflare dashboard

## Security Features

- ✅ API key stored securely in Cloudflare Workers environment
- ✅ CORS headers configured for your domain
- ✅ No API keys exposed in frontend code
- ✅ Request validation and error handling
- ✅ Rate limiting via Cloudflare's built-in protection

## Next Steps

1. Deploy the worker
2. Test with your domain
3. Your app will automatically work with secure API calls
4. Monitor usage in Cloudflare and Deepinfra dashboards

The frontend will automatically use `/api/*` endpoints on your domain instead of direct API calls!