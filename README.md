# Augen

**AI-Powered Vision Assistant for Accessibility**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue.svg)](https://augen.ignacio.tech)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/Version-1.0.0--beta-green.svg)](./package.json)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

A comprehensive accessibility-focused vision assistant featuring voice interaction, multilingual support, and intelligent image analysis. Built with modern web technologies and designed for users with visual impairments.

## Features

### Core Functionality
- **Three-Mode UX System**: Chat Mode, Image Mode, and Voice+Image Mode
- **AI-Powered Vision**: Advanced image analysis using Groq Llama Scout 4
- **Voice Interaction**: Real-time transcription and bidirectional voice chat
- **Text-to-Speech**: High-quality TTS with stop controls and number formatting
- **Multilingual Support**: 12 languages with automatic browser detection

### Multilingual Support
- English, Spanish, French, German, Italian, Portuguese
- Russian, Japanese, Korean, Chinese, Arabic, Hindi
- Auto-detection from browser language preferences
- Complete UI internationalization (i18n)

### Accessibility Features
- Screen reader optimized interface
- High contrast mode support
- Material Design accessibility standards
- Voice-first interaction design
- Keyboard navigation support

### Technical Features
- **Backend**: Cloudflare Workers with Groq API integration
- **Frontend**: Vanilla JavaScript with Material Design
- **Voice Processing**: Groq Whisper for transcription
- **Security**: Input sanitization and CORS protection
- **Performance**: Intelligent image compression and caching

## Quick Start

### Prerequisites
- Node.js (v18 or later)
- Cloudflare account
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sortedmess/augen.git
   cd augen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   npm run setup
   # This copies wrangler.toml.local to wrangler.toml
   ```

4. **Configure your Groq API key**
   ```bash
   npx wrangler secret put GROQ_API_KEY -e production
   ```

5. **Deploy the worker**
   ```bash
   npm run deploy:worker
   ```

6. **Start local development**
   ```bash
   npm run serve
   ```

Visit `http://localhost:8080` to see the application running locally.

## Architecture

### Frontend
- **Vanilla JavaScript** → No frameworks, maximum compatibility
- **Static hosting** → Deploy anywhere (GitHub Pages, Netlify, Vercel)
- **Mobile-first** → Optimized for touch devices
- **High contrast CSS** → WCAG 2.1 AA compliant

### Backend
- **Cloudflare Workers** → Serverless, global edge deployment
- **Groq API integration** → Deploy your own worker with your Groq API key
- **Groq APIs** → Ultra-fast AI inference
  - **Vision**: Llama Scout 4
  - **Voice**: Whisper for transcription
  - **TTS**: Native browser speech synthesis (offline, no API cost)

### API Endpoints (Deploy Your Own)
After deploying your own Cloudflare Worker, you'll have:
- `POST /api/analyze` - Vision analysis endpoint
- `POST /api/transcribe` - Voice transcription endpoint
- `POST /api/voice-query` - Voice chat endpoint
- `GET /api/health` - Health check endpoint

*Note: You need to deploy your own worker with your Groq API key for production use*

## Cost-Effective & Accessible

- **No TTS API costs** → Uses free native browser speech synthesis
- **~90% cheaper vision API** than OpenAI GPT-5 with competitive performance that beats GPT-4o
- **Live demo available** → See the full app in action at the demo site
- **Groq API required** → Deploy your own Cloudflare Worker with your Groq API key
- **Open source** → Full code available for customization and deployment

## Use Cases

### Documents & Text
- Restaurant menus
- Street signs
- Product labels
- Documents and papers
- Handwritten notes

### Scene Description
- Navigation assistance
- Object identification
- People and activities
- Environmental awareness
- Safety assessment

### Customizable
- Morse code output for deaf-blind users
- Haptic feedback patterns
- Summary vs detailed descriptions
- Multiple language support

## Development

### Project Structure
```
augen/
├── assets/
│   ├── css/style.css          # Material Design styling
│   └── js/script.js           # Main application logic
├── src/
│   └── worker/
│       └── worker.js          # Cloudflare Workers backend
├── index.html                 # Main application interface
├── wrangler.toml             # Cloudflare Workers config
└── package.json              # Project metadata
```

### Local Development
```bash
# Start local server
npm run serve

# Start worker development
npm run dev

# Deploy to production
npm run deploy
```

## Contributing

We welcome contributions! This project is built for the accessibility community.

### Areas for Contribution
- **Accessibility improvements** → Better screen reader support, motor accessibility
- **Language support** → Multi-language interface and descriptions
- **Voice options** → Different TTS voices and speeds
- **Performance** → Faster processing, offline capabilities
- **Documentation** → Better guides, tutorials, examples

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test accessibility with screen readers
5. Submit a pull request

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation** → [Help page](help.html)
- **Issues** → [GitHub Issues](https://github.com/sortedmess/augen/issues)
- **Discussions** → [GitHub Discussions](https://github.com/sortedmess/augen/discussions)

---

**Built for accessibility**

*Augen means "eyes" in German - helping everyone see the world through AI.*