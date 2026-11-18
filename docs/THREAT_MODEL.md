# Dimsee Security Posture & Threat Model

This document outlines the security architecture, threat model, and defense-in-depth posture implemented by Dimsee for modern MERN and full-stack web applications.

---

## 1. Asset & Boundary Identification

Dimsee protects the following critical security assets:
- **User Credentials**: Passwords stored at rest in MongoDB.
- **Session Tokens**: Short-lived JWT access tokens and long-lived refresh tokens.
- **User Identity Data**: PII including username, email, and OAuth provider IDs (`googleId`, `githubId`).
- **OAuth Callback Integrity**: Prevention of CSRF and token interception during third-party sign-in.

---

## 2. Threat Analysis & Mitigations

### A. Brute-Force & Credential Stuffing
- **Threat**: Attackers submitting automated dictionary attacks against `/signin`, `/signup`, or `/refresh-token`.
- **Mitigation**:
  - `express-rate-limit` enforces rate limiting on all authentication entry points.
  - Constant-time verification on `/signin` to prevent user enumeration.

### B. Access Token vs. Refresh Token Masquerading
- **Threat**: If `jwtSecret` and `jwtRefreshSecret` share the same signing key, an attacker holding a refresh token can pass it directly to `authMiddleware` to access protected APIs.
- **Mitigation**:
  - Strict separation of secrets: `jwtSecret` is used solely for access tokens, and `jwtRefreshSecret` is used solely for refresh tokens.
  - Runtime validation in `createAuthBackend` refuses to start in `production` if both secrets are identical or match known defaults.

### C. Refresh Token Theft & Replay Attacks
- **Threat**: An adversary intercepts a user's refresh token and attempts to obtain continuous access tokens.
- **Mitigation**:
  - **Token Rotation**: Every call to `POST /refresh-token` issues a brand new refresh token and stores it in the database.
  - **Automatic Reuse Detection**: If an old or invalid refresh token is presented, the stored token in DB is immediately revoked (`user.refreshToken = null`), logging out the user across all devices and blocking stolen credentials.

### D. Credential Modification & Stale Session Invalidation
- **Threat**: A compromised account sets a new password, but the attacker's existing refresh tokens remain valid.
- **Mitigation**:
  - Invoking `POST /set-password` automatically revokes and rotates active refresh tokens.
  - Re-issues fresh cookies exclusively to the authenticated requester.

### E. Open Redirect Vulnerabilities
- **Threat**: Attackers construct malicious OAuth initiation links (e.g., `?redirectUrl=https://attacker.com/evil`) to steal authorization codes.
- **Mitigation**:
  - `resolveOAuthRedirect` enforces strict URL origin checking against `authConfig.corsOrigin`. External domains, malformed protocols, and user:pass URLs are rejected.

### F. Cookie Hijacking & Cross-Site Scripting (XSS)
- **Threat**: Malicious scripts running in the browser steal tokens from `localStorage`.
- **Mitigation**:
  - All tokens are delivered via `httpOnly`, `secure` (in production), and `sameSite: strict` (in production) cookies.
  - JavaScript in the browser cannot read raw token strings, neutralizing script-based token exfiltration.

---

## 3. Cryptographic Standards
- **Password Hashing**: `bcryptjs` with salt rounds = 10.
- **Token Signatures**: HMAC SHA-256 (`HS256`) with distinct high-entropy secrets.
- **Token Expiry**: Default access token TTL of 15 minutes (`15m`); refresh token TTL of 7 days (`7d`).
