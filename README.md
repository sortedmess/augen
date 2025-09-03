# Augen - AI Vision Assistant for Accessibility

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

**Augen** is an AI-powered vision assistant designed specifically for visually impaired users. Take a picture and hear what's in it - from reading menus and signs to describing scenes and documents.

## ✨ Features

### 🎯 **Core Functionality**
- **Single tap** → Quick summary of key information
- **Double tap** → Complete detailed description  
- **Smart detection** → Automatically optimizes for documents, menus, or scenes
- **Instant feedback** → Audio and haptic confirmation

### 🔊 **Multiple Output Modes**
- **Native TTS** → Browser speech synthesis - works offline, no API needed
- **Morse code** → Audio beeps and vibration patterns for deaf-blind users
- **Universal compatibility** → Works on all modern devices and browsers

### ♿ **Maximum Accessibility**
- **Ultra-high contrast** → Yellow/black theme for maximum visibility
- **Massive fonts** → Up to 140px titles, scalable interface
- **Motor-friendly** → Large touch targets, haptic feedback, reduced animations
- **Screen reader optimized** → Full ARIA support, semantic HTML
- **Keyboard accessible** → Full navigation without mouse/touch

### 🛡️ **Privacy & Security**
- **No data collection** → Images processed temporarily only
- **Secure API** → Keys stored safely in Cloudflare Workers
- **Open source** → Fully auditable code
- **No tracking** → Complete user privacy
- **Fast inference** → Groq API for ultra-low latency responses

## 🚀 Quick Start

### For Users
1. **Visit the app** → [Deploy to any static hosting like GitHub Pages]
2. **Grant camera permission** → When prompted
3. **Tap the big button** → Single tap for summary, double tap for details
4. **Listen** → AI describes what it sees

### For Developers
```bash
# Clone the repository
git clone https://github.com/yourusername/augen.git
cd augen

# The app is ready to use!
# Frontend deployed at: https://augen.ignacio.tech
# API restricted to official domain for security

# Optional: Deploy your own API worker
npm install
npm run deploy
```

## 🏗️ Architecture

### Frontend
- **Vanilla JavaScript** → No frameworks, maximum compatibility
- **Static hosting** → Deploy anywhere (GitHub Pages, Netlify, Vercel)
- **Mobile-first** → Optimized for touch devices
- **High contrast CSS** → WCAG 2.1 AA compliant

### Backend
- **Cloudflare Workers** → Serverless, global edge deployment
- **Shared API service** → No setup required for contributors
- **Groq APIs** → Ultra-fast AI inference
  - **Vision**: Google Gemma-3-27b-it  
  - **TTS**: Native browser speech synthesis (offline, no API cost)

### APIs (Ready to Use)
- `POST https://augen-api.ignacioeloyola.workers.dev/api/analyze`
- `GET https://augen-api.ignacioeloyola.workers.dev/api/health`

*Note: TTS now uses native browser speech synthesis - no API endpoint needed*

## 💰 Cost-Effective & Accessible

- **Even cheaper** → No TTS API costs, uses free native browser speech
- **~90% cheaper vision API** than OpenAI equivalents
- **Free demo API** → Shared service for testing and demos
- **Ultra-low cost deployment** → ~1€/month for vision API only
- **No setup barriers** → Just clone and deploy frontend
- **Optional self-hosting** → Deploy your own worker if needed

## 🎨 Use Cases

### 📋 **Documents & Text**
- Restaurant menus
- Street signs  
- Product labels
- Documents and papers
- Handwritten notes

### 🌍 **Scene Description**
- Navigation assistance
- Object identification
- People and activities
- Environmental awareness
- Safety assessment

### ⚙️ **Customizable**
- Morse code output for deaf-blind users
- Haptic feedback patterns
- Summary vs detailed descriptions
- Multiple language support (coming soon)

## 🔧 Development

### Project Structure
```
augen/
├── src/
│   ├── frontend/
│   │   ├── pages/
│   │   │   ├── index.html      # Main app interface
│   │   │   ├── about.html      # About page
│   │   │   ├── help.html       # Help documentation
│   │   │   └── contact.html    # Contact information
│   │   ├── js/
│   │   │   └── script.js       # Client-side logic
│   │   └── css/
│   │       └── style.css       # High-contrast styling
│   └── worker/
│       └── worker.js           # Cloudflare Worker (vision API proxy)
├── wrangler.toml               # Cloudflare configuration
└── deploy-guide.md             # Deployment instructions
```

### Local Development
```bash
# Serve frontend locally (from src/frontend/pages)
cd src/frontend/pages
python3 -m http.server 8000

# Or serve from project root
python3 -m http.server 8000
# Then visit: http://localhost:8000/src/frontend/pages/

# Test the shared API
curl https://augen-api.ignacioeloyola.workers.dev/api/health

# Optional: Deploy your own API worker
npm install
npm run deploy
```

## 🤝 Contributing

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

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Accessibility community** → For feedback and testing
- **Groq** → For ultra-fast vision AI inference with Llama 4 Scout
- **Cloudflare** → For global serverless infrastructure
- **Browser vendors** → For excellent native TTS support
- **Contributors** → Demo API is shared freely for community benefit
- **Open source community** → For tools and inspiration

## 📞 Support

- **Documentation** → [Help page](help.html)
- **Issues** → [GitHub Issues](https://github.com/yourusername/augen/issues)
- **Discussions** → [GitHub Discussions](https://github.com/yourusername/augen/discussions)

---

**Built with ❤️ for accessibility**

*Augen means "eyes" in German - helping everyone see the world through AI.*