# Cloudflare Pages Deployment Guide

## Current Structure (Optimized for Cloudflare Pages)

The project has been reorganized for optimal Cloudflare Pages deployment:

```
augen/
├── index.html              # Main page (root level)
├── about.html              # About page (root level) 
├── help.html               # Help page (root level)
├── contact.html            # Contact page (root level)
├── assets/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       └── script.js       # Main application logic
├── src/
│   └── worker/
│       └── worker.js       # Cloudflare Worker code
└── [other files...]
```

## Cloudflare Pages Configuration

### Build Settings
- **Build command**: Leave empty (no build process needed)
- **Build output directory**: `/` (root directory)
- **Root directory**: Leave empty (uses repository root)

### Environment Variables
Set these in your Cloudflare Pages dashboard:
- `DEEPINFRA_API_KEY`: Your DeepInfra API key
- Any other required environment variables

## Deployment Steps

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Click "Create a project"
   - Connect your GitHub repository
   - Select the `augen` repository

2. **Configure Build Settings**
   - Build command: (leave empty)
   - Build output directory: `/`
   - Root directory: (leave empty)

3. **Set Environment Variables**
   - Go to Settings > Environment variables
   - Add your API keys and configuration

4. **Deploy**
   - Click "Save and Deploy"
   - Your site will be available at `your-project.pages.dev`

## Custom Domain (Optional)
- Go to Custom domains in your Cloudflare Pages project
- Add your domain name
- Update DNS records as instructed

## Worker Integration
The Cloudflare Worker handles API calls and should be deployed separately:
- Use `wrangler deploy` in the project root
- Update the API endpoint in `assets/js/script.js` if needed

## File Structure Notes
- HTML files are at root level for direct access
- Assets are organized in `assets/` directory
- Worker code remains in `src/worker/` for separate deployment
- This structure avoids build complexity while maintaining organization

## Troubleshooting

### Common Issues:
1. **404 errors**: Ensure HTML files are at root level
2. **Asset not found**: Check file paths in HTML (should use `assets/css/` and `assets/js/`)
3. **Worker errors**: Deploy worker separately and update endpoint URLs

### Testing Locally:
```bash
# Start a local server to test
python3 -m http.server 8000
# Visit http://localhost:8000
```

The structure is now optimized for Cloudflare Pages with minimal configuration needed.