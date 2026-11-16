# Dimsee Migration Guide

This document outlines breaking changes, deprecations, and upgrade steps between minor and major versions of Dimsee.

---

## Migrating from v0.6.x to v0.7.0 (Revival Release)

### 1. Centralized Cookie Options & Security Flags
- **Previous behavior**: Cookies were set with ad-hoc options and `/signin` set `authToken` redundantly.
- **New behavior**: `getCookieOptions()` centralizes security attributes:
  - `httpOnly: true` is enforced on both `authToken` and `refreshToken`.
  - `secure: true` in production (`process.env.NODE_ENV === 'production'`).
  - `sameSite: 'strict'` in production, `'lax'` in development.
- **Action Required**: If your client was relying on reading tokens directly via JavaScript (`document.cookie`), migrate to using HttpOnly cookies with `credentials: 'include'` on `fetch`, or consume tokens from response JSON payload.

### 2. Strict Zod Schema Validation on Authentication Endpoints
- **Previous behavior**: Input validation was loose and error responses differed between routes.
- **New behavior**: `POST /api/auth/signup` and `POST /api/auth/signin` are strictly validated with Zod:
  - Username: 3 to 20 characters, alphanumeric and underscores only (`^[a-zA-Z0-9_]+$`).
  - Email: Valid RFC 5322 format via Zod `.email()`.
  - Password: Minimum 6 characters with uppercase, lowercase, and numeric complexity.
- **Action Required**: Client forms should validate against these rules before submission to ensure consistent UX. Error payloads now reliably return `{ success: false, message: 'Validation failed', errors: [{ field: string, message: string }] }`.

### 3. Removal of Import-Time Passport Side Effects
- **Previous behavior**: `require('./backend/config/passport')` automatically triggered `dotenv.config()` and strategy registrations.
- **New behavior**: Passport strategy configuration is isolated inside factory functions (`configureOAuthStrategies`) and no longer pollutes `process.env` or outputs unneeded console logs.
- **Action Required**: Ensure environment variables (`JWT_SECRET`, `GOOGLE_CLIENT_ID`, etc.) are loaded prior to invoking `createAuthBackend(config)`.

### 4. Rate Limiting Coverage
- **Previous behavior**: Only `/signup` and `/signin` had basic rate limiting.
- **New behavior**: Rate limiting covers `/refresh-token` and `/set-password` to prevent brute-force token enumeration and credential manipulation.

---

## Migrating from v0.5.x to v0.6.0

### 1. Dual Token Architecture (Access + Refresh Tokens)
- Dimsee shifted from standalone long-lived JWTs to short-lived `authToken` (15m default) paired with rotatable `refreshToken` (7d default).
- Consumers should call `POST /api/auth/refresh-token` when receiving 401 Unauthorized from protected backend endpoints.

### 2. Unified Backend Factory
- Dimsee standardizes backend mounting via `createAuthBackend(config)` rather than directly importing raw Express router instances.
- Example:
  ```javascript
  const express = require('express');
  const { createAuthBackend } = require('dimsee');

  const app = express();
  const authApp = createAuthBackend({
    jwtSecret: process.env.JWT_SECRET,
    enableOAuth: true
  });
  app.use(authApp);
  ```

---

## Need Assistance?

If you encounter issues during migration, please open an issue on the [Dimsee GitHub repository](https://github.com/sidd190/Dimsee/issues) or consult our [Discord Community](https://discord.gg/dimsee).
