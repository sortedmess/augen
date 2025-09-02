# Contributing to Augen

Thank you for your interest in contributing to Augen! This project is built for the accessibility community, and we welcome contributions that help make AI vision assistance better for everyone.

## 🎯 Project Mission

Augen aims to provide **maximum accessibility** for visually impaired users through:
- Ultra-high contrast design
- Screen reader optimization  
- Motor accessibility features
- Multiple output modes (speech, morse code)
- Zero-barrier deployment

## 🤝 How to Contribute

### Areas We Need Help

#### 🔧 **Technical Contributions**
- **Accessibility improvements** → Better screen reader support, keyboard navigation
- **Performance optimization** → Faster image processing, reduced bandwidth
- **Mobile enhancements** → Better touch interactions, camera handling
- **Browser compatibility** → Testing across different browsers and devices

#### ♿ **Accessibility Testing**
- **Screen readers** → NVDA, JAWS, VoiceOver, TalkBack testing
- **Voice control** → Dragon, Voice Control, Voice Access compatibility  
- **Switch navigation** → Testing with assistive devices
- **Motor limitations** → Large button usability, reduced precision needs

#### 🌍 **Internationalization**
- **Multi-language support** → Interface translations
- **Regional voice options** → Different TTS voices and accents
- **Cultural adaptations** → Region-specific accessibility patterns

#### 📚 **Documentation**
- **User guides** → Step-by-step tutorials for different disabilities
- **Technical docs** → API documentation, deployment guides
- **Accessibility guides** → Best practices for vision assistance tools

## 🚀 Getting Started

### Prerequisites
- Basic understanding of web accessibility (WCAG guidelines)
- Access to screen reader software for testing
- Camera-enabled device for testing image capture

### Development Setup
```bash
# 1. Fork and clone the repository
git clone https://github.com/yourusername/augen.git
cd augen

# 2. Test the current version
python3 -m http.server 8000
# Visit: http://localhost:8000

# 3. Make your changes
# Edit HTML, CSS, or JavaScript files

# 4. Test with screen readers
# Use NVDA (Windows), VoiceOver (Mac), or Orca (Linux)
```

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