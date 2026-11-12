# Security Policy

Dimsee handles authentication - credentials, sessions, and tokens - so security
is a first-class concern, not an afterthought. This document covers how to
report issues and what Dimsee does and does not protect against.

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 0.6.x   | active           |
| < 0.6   | please upgrade   |

Security fixes land on the latest minor; please upgrade before reporting against
an old release.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, use GitHub's private advisory flow:
**[Report a vulnerability](https://github.com/sidd190/dimsee/security/advisories/new)**
- or email the maintainer directly.

When reporting, include:

- A description of the issue and its impact
- Steps to reproduce (a minimal repro is ideal)
- Affected version(s) and environment
- Any suggested remediation

**Response targets:** acknowledgement within 72 hours, an initial assessment
within 7 days, and a coordinated fix + disclosure timeline agreed with you. We'll
credit reporters in the release notes unless you prefer to stay anonymous.

## Security model - what Dimsee protects

Dimsee aims to give a MERN app a secure-by-default auth baseline:

- **Password storage:** hashed with bcrypt - plaintext passwords are never stored.
- **Sessions:** cookie-based, `httpOnly`, server-side session store (`connect-mongo`),
  `secure` + `sameSite` enforced in production.
- **Tokens:** short-lived access JWTs with refresh-token rotation and reuse
  detection.
- **Brute force:** rate limiting on the auth endpoints.
- **Transport:** designed to run behind HTTPS in production.

## Known limitations & your responsibilities

Dimsee is a building block, not a turnkey security guarantee. You are responsible
for:

- **Secrets:** set strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET` (distinct
  values). Never ship the defaults to production.
- **HTTPS:** terminate TLS in front of the backend; cookies are only `secure`
  when `NODE_ENV=production`.
- **CORS:** set `corsOrigin` to your exact frontend origin.
- **Environment:** keep `.env` out of version control and rotate leaked secrets.
- **Dependencies:** run `npm audit` and keep Dimsee and its deps current.

Features such as email verification, MFA, and CSRF tokens are on the roadmap and
tracked as hardening issues - see the security track in the contributor backlog.

## Disclosure

We follow coordinated disclosure: once a fix is released, we publish a security
advisory describing the issue, affected versions, and remediation.
