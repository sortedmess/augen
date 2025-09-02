# Shared Demo API - Usage Guidelines

## 🎯 **Demo API Service**

The shared API at `https://augen-api.ignacioeloyola.workers.dev` is provided free for:
- **Official app** at https://augen.ignacio.tech
- **Restricted access** for security (CORS-limited to official domain)
- **Community testing** via the official deployment
- **Accessibility research** and education

## 📊 **Usage Limits**

### Fair Use Policy
- **Rate limited** to prevent abuse
- **Reasonable usage** for testing and demos
- **No commercial usage** without permission
- **Community benefit** is the goal

### Current Capacity
- Powered by Deepinfra APIs (~2€/month budget)
- Shared among all community users
- May have service interruptions during high usage

## 🚀 **Deploying Your Own API**

For production use or higher limits:

```bash
# 1. Get your own Deepinfra API key
# Visit: https://deepinfra.com

# 2. Clone and deploy
git clone https://github.com/yourusername/augen.git
cd augen
npm install

# 3. Set your API key
npx wrangler secret put DEEPINFRA_API_KEY

# 4. Deploy your worker
npm run deploy

# 5. Update script.js with your worker URL
// Change this line in script.js:
this.apiBaseUrl = 'https://your-worker.workers.dev/api';
```

## 🛡️ **Privacy & Security**

### What We Don't Store
- ❌ **No images saved** - Processed and discarded immediately
- ❌ **No user data** - No tracking or analytics  
- ❌ **No logs kept** - Privacy by design
- ❌ **No personal info** - Anonymous usage only

### What Gets Processed
- ✅ **Images** - Sent to Deepinfra for analysis, then deleted
- ✅ **Text descriptions** - Generated and returned via TTS
- ✅ **API calls** - Standard Cloudflare logging only

## 🤝 **Community Guidelines**

### Appropriate Usage
- ✅ **Testing the app** - Try all features freely
- ✅ **Contributing code** - Use for development  
- ✅ **Educational demos** - Show accessibility features
- ✅ **Accessibility research** - Academic and non-profit use

### Please Don't
- ❌ **Spam requests** - Respect rate limits
- ❌ **Commercial usage** - Deploy your own for business
- ❌ **Abuse the service** - Keep it fair for everyone
- ❌ **Share inappropriate content** - Keep it family-friendly

## 📈 **Service Status**

- **Current Status**: Active and maintained
- **Budget**: ~2€/month (sustainable for demo usage)
- **Uptime**: Best effort, no SLA guarantees
- **Support**: Community-driven, no guaranteed response time

## 🆘 **If You Need More**

### High Usage Scenarios
If you need higher limits:
1. **Deploy your own worker** (recommended)
2. **Contact via GitHub Issues** to discuss
3. **Contribute to hosting costs** if you want to help
4. **Use for educational purposes** with prior notice

### Commercial Usage
For commercial applications:
- **Deploy your own API** (full instructions provided)
- **Deepinfra costs** are very reasonable (~$0.01 per 100 requests)
- **Full control** over your data and usage
- **No dependencies** on shared infrastructure

## 💡 **Contributing Back**

Help keep the demo API running:
- 🐛 **Report bugs** - Help improve the service
- 📝 **Improve docs** - Make it easier for others
- 💰 **Sponsor hosting** - Keep the demo alive
- 🌟 **Star the repo** - Show your support

---

**Thank you for being part of the Augen accessibility community! 🌟**

*The shared demo API exists to remove barriers and make AI accessibility tools available to everyone.*