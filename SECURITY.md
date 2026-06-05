# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability, please do NOT open a public issue.

Instead, contact us directly via GitHub private message or email.

We will respond within 48 hours and work on a fix promptly.

## Known Limitations (Current Version)

This is a local-network application. Before deploying to the internet:

- Passwords are stored as plain text → upgrade to bcrypt
- No HTTPS → add SSL certificate
- No rate limiting → add request throttling
- No JWT sessions → implement proper session management
