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
- **High-quality TTS** → Natural voice synthesis via Kokoro-82M
- **Morse code** → Audio beeps and vibration patterns for deaf-blind users
- **Browser fallback** → Works even when services are unavailable

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
- **Shared demo API** → Free for community use (rate limited for fair use)

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
- **Deepinfra APIs** → Cost-effective AI services
  - **Vision**: Google Gemma-3-27b-it  
  - **TTS**: Hexgrad Kokoro-82M

### APIs (Ready to Use)
- `POST https://augen-api.ignacioeloyola.workers.dev/api/analyze`
- `POST https://augen-api.ignacioeloyola.workers.dev/api/tts`  
- `GET https://augen-api.ignacioeloyola.workers.dev/api/health`

## 💰 Cost-Effective & Accessible

- **~90% cheaper** than OpenAI equivalents
- **Free demo API** → Shared service for testing and demos
- **Low cost deployment** → ~2€/month covers community usage
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
├── index.html          # Main app interface
├── script.js          # Client-side logic
├── style.css          # High-contrast styling
├── worker.js          # Cloudflare Worker (API proxy)
├── wrangler.toml      # Cloudflare configuration
├── about.html         # About page
├── help.html          # Help documentation
├── contact.html       # Contact information
└── deploy-guide.md    # Deployment instructions
```

### Local Development
```bash
# Serve frontend locally
python3 -m http.server 8000

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
- **Deepinfra** → For cost-effective AI services (~2€/month!)
- **Cloudflare** → For global serverless infrastructure
- **Contributors** → Demo API is shared freely for community benefit
- **Open source community** → For tools and inspiration

## 📞 Support

- **Documentation** → [Help page](help.html)
- **Issues** → [GitHub Issues](https://github.com/yourusername/augen/issues)
- **Discussions** → [GitHub Discussions](https://github.com/yourusername/augen/discussions)

---

**Built with ❤️ for accessibility**

*Augen means "eyes" in German - helping everyone see the world through AI.*