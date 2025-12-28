# Security Policy

## Reporting Security Issues

**Please do not open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability, please email security@oldflick.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

We will acknowledge your report within 48 hours and provide updates every 5 days.

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|-----------------|
| 2.0.x   | Current | ✅ Yes |
| 1.x.x   | Legacy | ❌ No |

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use `.env.example` for documentation
- Rotate secrets regularly
- Use different credentials for dev/staging/production

### Database
- Always use parameterized queries (avoid SQL injection)
- Implement proper access controls
- Encrypt sensitive data at rest
- Use connection pooling with Neon
- Enable SSL/TLS for database connections

### API
- Validate all user inputs
- Implement rate limiting
- Use HTTPS only in production
- Implement proper authentication/authorization
- Log security-relevant events
- Sanitize error messages to avoid information leakage

### Frontend
- Use Content Security Policy headers
- Sanitize user-generated content
- Keep dependencies updated
- Use HTTPS for all external resources
- Implement CSRF protection for form submissions

### Dependencies
- Keep all packages updated
- Review security advisories: `npm audit`
- Use lock files (package-lock.json)
- Minimize dependencies when possible
- Audit dependencies periodically

## Known Vulnerabilities

None currently known.

## Security Checklist for Production

- [ ] Set NODE_ENV=production
- [ ] Use strong, randomly generated secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS headers
- [ ] Implement rate limiting
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Use environment-specific credentials
- [ ] Enable security monitoring
- [ ] Review and approve all dependencies
- [ ] Implement proper logging
- [ ] Test authentication flows
- [ ] Review API endpoints for authorization
- [ ] Configure Content Security Policy
- [ ] Set up error tracking (e.g., Sentry)

## Third-Party Services

This application integrates with:
- **Stripe**: Payment processing (PCI DSS compliant)
- **Bunny.NET**: CDN and video streaming
- **Neon**: PostgreSQL database hosting
- **Supabase**: Legacy authentication (not currently used)

All services are configured with:
- Separate credentials per environment
- Regular credential rotation
- Minimal required permissions
- Activity logging and monitoring

## Incident Response

1. **Acknowledge**: Report received within 48 hours
2. **Assess**: Evaluate impact and severity
3. **Remediate**: Develop and test fix
4. **Release**: Deploy patch promptly
5. **Disclose**: Inform affected users if necessary
6. **Document**: Post-incident analysis

## Compliance

This application aims to comply with:
- OWASP Top 10
- GDPR (when applicable)
- Data protection regulations
- PCI DSS (for payment processing)

## Questions?

For security questions or concerns not related to vulnerabilities:
- Check the [CONTRIBUTING.md](CONTRIBUTING.md) guide
- Review documentation in `/docs`
- Open a discussion on GitHub

---

Last Updated: December 28, 2025
