# Contributing to Augen 👁️‍🗨️

Thank you for your interest in contributing to Augen! This project is built for the accessibility community, and we welcome contributions from developers, accessibility experts, and users alike.

## 🎯 Project Mission

Augen is an AI-powered vision assistant designed specifically for users with visual impairments. Our goal is to create an accessible, multilingual, and user-friendly tool that helps people understand their visual environment through AI-powered image analysis and voice interaction.

## 🤝 Ways to Contribute

### 🐛 Bug Reports
- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include detailed steps to reproduce
- Mention your browser, device, and operating system
- Test with screen readers if possible

### ✨ Feature Requests
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain how it improves accessibility
- Consider impact on different user groups
- Provide use cases and examples

### 🛠️ Code Contributions
- Fork the repository
- Create a feature branch: `git checkout -b feature/amazing-feature`
- Follow our coding standards
- Test with accessibility tools
- Submit a pull request

### ♿ Accessibility Testing
- Test with screen readers (NVDA, JAWS, VoiceOver, TalkBack)
- Verify keyboard navigation
- Check color contrast and font sizes
- Test with voice control software
- Provide feedback on motor accessibility

### 🌐 Localization
- Help translate the interface to new languages
- Improve existing translations
- Test voice synthesis in different languages
- Verify cultural appropriateness of content

## 🏗️ Development Setup

### Prerequisites
- Node.js (v18 or later)
- Git
- A text editor or IDE
- Modern web browser for testing

### Local Setup
```bash
# Clone your fork
git clone https://github.com/sortedmess/augen.git
cd augen

# Install dependencies
npm install

# Start local development server
npm run serve

# Visit http://localhost:8080
```

### Testing with API
The project uses a shared Groq API for development. For production deployment, you'll need your own Groq API key.

### Testing Requirements

#### ✅ **Accessibility Checklist**
Before submitting any UI changes:

- [ ] **Screen reader compatible** → Test with at least one screen reader
- [ ] **Keyboard navigable** → All functions work without mouse
- [ ] **High contrast maintained** → Yellow/black color scheme preserved
- [ ] **Large touch targets** → Minimum 44px as per WCAG guidelines
- [ ] **Focus indicators** → Clear visual focus states
- [ ] **ARIA labels** → Proper semantic markup

#### 🧪 **Functional Testing**
- [ ] **Image capture works** → Camera permission and file upload
- [ ] **API connectivity** → Health check passes
- [ ] **Audio output** → TTS or morse code functions
- [ ] **Settings persistence** → Preferences saved across sessions
- [ ] **Error handling** → Graceful fallbacks for failures

### Code Style Guidelines

#### **HTML**
- Use semantic HTML5 elements
- Include proper ARIA attributes
- Maintain logical heading hierarchy
- Add `alt` text for all images

#### **CSS**
- Maintain high contrast ratios (minimum 7:1)
- Use relative units (`rem`, `em`) for scalability
- Include focus styles for all interactive elements
- Test with browser zoom up to 200%

#### **JavaScript**
- Handle all errors gracefully
- Provide fallback for failed API calls
- Announce state changes to screen readers
- Support keyboard-only navigation

## 🐛 Reporting Issues

### Bug Reports
Use the **Bug Report** template and include:
- **Device/browser** → What you're using
- **Steps to reproduce** → Clear instructions
- **Expected behavior** → What should happen
- **Actual behavior** → What actually happens
- **Accessibility impact** → How it affects disabled users

### Accessibility Issues
Use the **Accessibility Issue** template and include:
- **Assistive technology** → Screen reader, voice control, etc.
- **Barrier description** → What prevents access
- **WCAG guideline** → Which standard is violated
- **Suggested solution** → Ideas for improvement

## 🔄 Pull Request Process

### 1. **Before You Start**
- Check existing issues and PRs to avoid duplication
- Discuss major changes in an issue first
- Fork the repository and create a feature branch

### 2. **Development**
- Follow the code style guidelines
- Write descriptive commit messages
- Test accessibility thoroughly
- Update documentation if needed

### 3. **Pull Request**
- Use the PR template
- Include before/after screenshots for UI changes
- List accessibility tests performed
- Reference related issues

### 4. **Review Process**
- Maintainers will review for accessibility compliance
- Screen reader testing may be requested
- Changes may be suggested for better inclusivity
- Final approval required before merge

## 🌟 Recognition

Contributors who help improve accessibility will be:
- Listed in the README acknowledgments
- Credited in release notes
- Invited to join the accessibility advisory group

## 📞 Getting Help

- **Questions** → Use GitHub Discussions
- **Real-time help** → Open an issue with `question` label
- **Accessibility guidance** → Tag issues with `accessibility`

## 🎖️ Code of Conduct

### Our Standards
- **Inclusive language** → Welcome all contributors
- **Accessibility first** → Always consider disabled users
- **Respectful communication** → Patient and kind interactions
- **Learning mindset** → Help others understand accessibility

### Unacceptable Behavior
- Dismissing accessibility concerns
- Mocking disabilities or assistive technologies
- Prioritizing aesthetics over accessibility
- Harassment of any form

## 🚀 Vision for the Future

Together, we're building more than just an app - we're creating:
- **Universal access** to AI-powered vision assistance
- **Open standards** for accessible AI interfaces
- **Community knowledge** about disability and technology
- **Barrier-free** deployment for everyone worldwide

Every contribution, no matter how small, helps someone see the world through AI. Thank you for being part of this mission! 🌟

---

*"The best way to find out if you can trust somebody is to trust them."* - Let's trust that together we can make AI accessible to everyone.