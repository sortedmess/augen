# Security Policy

## Supported Versions

Currently supported versions for security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.0-beta | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🚨 For Critical Security Issues

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email security details to:
- **Email**: ignacioeloyola@gmail.com
- **Subject**: `[SECURITY] Augen Vulnerability Report`

### What to Include

Please provide as much information as possible:

1. **Description** of the vulnerability
2. **Steps to reproduce** the security issue
3. **Potential impact** of the vulnerability
4. **Suggested fix** if you have one
5. **Your contact information** for follow-up


## Security Measures

### Current Security Features

- **Input Sanitization**: All user inputs are sanitized to prevent injection attacks
- **CORS Protection**: Proper Cross-Origin Resource Sharing configuration
- **API Security**: Secure API key management via Cloudflare Workers secrets
- **No Data Storage**: Images are processed temporarily and not stored
- **HTTPS Only**: All communications encrypted in transit

### Privacy Protection

- **No User Tracking**: No analytics or user behavior tracking
- **Local Processing**: Where possible, processing happens client-side
- **Temporary Data**: Image data is discarded after processing
- **No Personal Info**: No collection of personal information

### Third-Party Dependencies

- **Groq API**: Used for AI processing (image analysis, voice transcription)
- **Cloudflare Workers**: Serverless runtime for API endpoints
- **Browser APIs**: Camera, Speech Synthesis, Web Audio APIs

## Security Best Practices for Contributors

### Code Security
- Validate all user inputs
- Use parameterized queries if database operations are added
- Implement proper error handling without information disclosure
- Follow OWASP security guidelines

### API Security
- Never commit API keys or secrets
- Use environment variables for sensitive configuration
- Implement proper authentication for new endpoints
- Rate limiting for API endpoints

### Client-Side Security
- Sanitize all user-generated content
- Use Content Security Policy (CSP)
- Avoid eval() and similar dynamic code execution
- Validate file uploads properly

## Vulnerability Disclosure Process

1. **Receipt**: We acknowledge receipt of your report
2. **Investigation**: We investigate and validate the issue
3. **Fix Development**: We develop and test a fix
4. **Disclosure**: We coordinate disclosure with you
5. **Release**: We release the security update
6. **Recognition**: We acknowledge your contribution (with permission)

## Security Updates

Security updates will be:
- Released as soon as possible after validation
- Announced in release notes
- Tagged with security labels
- Communicated to users through appropriate channels

## Contact

For security-related questions or concerns:
- **Security Issues**: Use the email above
- **General Security Questions**: Create a GitHub discussion with `security` label

Thank you for helping keep Augen and its users safe!
