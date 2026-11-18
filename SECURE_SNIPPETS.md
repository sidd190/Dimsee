# Dimsee – Vetted Secure Snippets

> This file is machine-readable and AI-assistant-friendly.  
> Every snippet below is **secure by construction** — copy it verbatim and you will be on the safe path.  
> Insecure alternatives are explicitly marked with `❌ NEVER` so code-generation models learn what to avoid.

---

## Table of Contents

1. [Minimal Secure Backend](#1-minimal-secure-backend)
2. [Backend with OAuth](#2-backend-with-oauth)
3. [Protecting Custom Routes](#3-protecting-custom-routes)
4. [AuthProvider – Environment-Driven API URL](#4-authprovider--environment-driven-api-url)
5. [AuthForm with Full Callbacks](#5-authform-with-full-callbacks)
6. [AuthStatus – Gate Entire App](#6-authstatus--gate-entire-app)
7. [Controlled Mode Switch (Sign-in / Sign-up Toggle)](#7-controlled-mode-switch)
8. [Next.js Integrated API Route](#8-nextjs-integrated-api-route)
9. [Canonical .env.example](#9-canonical-envexample)
10. [Rate Limiting on Auth Endpoints](#10-rate-limiting-on-auth-endpoints)

---

## 1. Minimal Secure Backend

```javascript
// server.js
require('dotenv').config();
const { createAuthBackend } = require('dimsee/backend');

// Guard: crash early if any required secret is missing
if (!process.env.MONGO_URI)   throw new Error('MONGO_URI env var is required');
if (!process.env.JWT_SECRET)  throw new Error('JWT_SECRET env var is required');
if (!process.env.CORS_ORIGIN) throw new Error('CORS_ORIGIN env var is required');
if (process.env.JWT_SECRET.length < 32)
  throw new Error('JWT_SECRET must be at least 32 characters');

const app = createAuthBackend({
  mongoUri:     process.env.MONGO_URI,
  jwtSecret:    process.env.JWT_SECRET,
  corsOrigin:   process.env.CORS_ORIGIN,
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

app.listen(Number(process.env.PORT) || 5000,
  () => console.log(`Auth server ready`));
```

**What makes it secure:**
- All secrets come from env vars — nothing is hardcoded
- Startup guard clauses prevent a misconfigured server from running silently
- `cookieMaxAge` is explicit (no magic default)

**Generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 2. Backend with OAuth

```javascript
// server.js
require('dotenv').config();
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri:    process.env.MONGO_URI,
  jwtSecret:   process.env.JWT_SECRET,
  corsOrigin:  process.env.CORS_ORIGIN,
  enableOAuth: true,
  oauth: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  process.env.GITHUB_CALLBACK_URL,
    },
  },
});

app.listen(Number(process.env.PORT) || 5000);
```

**What makes it secure:**
- Callback URLs are in env vars — matches your OAuth provider console entry exactly
- Each provider has its own scoped client credentials
- `enableOAuth: false` by default — opt-in only

---

## 3. Protecting Custom Routes

```javascript
const { createAuthBackend, authMiddleware } = require('dimsee/backend');
const app = createAuthBackend({ /* ... */ });

// ✅ Every protected route must include authMiddleware
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ❌ NEVER rely only on frontend guards — always verify server-side
// ❌ NEVER skip authMiddleware on sensitive endpoints
```

---

## 4. AuthProvider – Environment-Driven API URL

```jsx
import { AuthProvider } from 'dimsee/frontend';

const API_URL =
  import.meta.env.VITE_API_URL       ||  // Vite
  process.env.REACT_APP_API_URL      ||  // CRA
  process.env.NEXT_PUBLIC_API_URL;       // Next.js

if (!API_URL) throw new Error('API URL env var is not set');

export default function App() {
  return (
    <AuthProvider apiUrl={API_URL}>
      {/* app content */}
    </AuthProvider>
  );
}
```

**Security rule:** In production, `API_URL` must start with `https://`.

---

## 5. AuthForm with Full Callbacks

```jsx
import { AuthForm } from 'dimsee/frontend';

export default function LoginPage({ onDone }) {
  return (
    <AuthForm
      mode="signin"
      design="modern"
      onSuccess={() => onDone()}                            // redirect or close modal
      onError={(err) => console.error('[Auth]', err)}       // never swallow silently
    />
  );
}
```

**Security note:** Dimsee uses HTTP-only cookies for session tokens. Do **not** store tokens in `localStorage` — it is vulnerable to XSS.

---

## 6. AuthStatus – Gate Entire App

```jsx
import { AuthProvider, AuthStatus } from 'dimsee/frontend';

export default function App() {
  return (
    <AuthProvider apiUrl={import.meta.env.VITE_API_URL}>
      <AuthStatus showUserInfo showSetPassword formDesign="modern">
        <Dashboard /> {/* only rendered after server confirms auth */}
      </AuthStatus>
    </AuthProvider>
  );
}
```

**Security note:** `AuthStatus` calls `/api/auth/me` on every load — revoked sessions are detected immediately.

---

## 7. Controlled Mode Switch

```jsx
import { useState } from 'react';
import { AuthForm } from 'dimsee/frontend';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin');
  return (
    <AuthForm
      mode={mode}
      onModeChange={setMode}
      design="minimal"
      onSuccess={onClose}
      onError={(err) => console.error('[Auth]', err)}
    />
  );
}
```

---

## 8. Next.js Integrated API Route

```javascript
// pages/api/auth/[...slug].js
import { createAuthBackend } from 'dimsee/backend';

const authApp = createAuthBackend({
  mongoUri:   process.env.MONGO_URI,
  jwtSecret:  process.env.JWT_SECRET,
  corsOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const config = { api: { bodyParser: false } };

export default function handler(req, res) {
  req.url = req.url.replace('/api/auth', '');
  return authApp(req, res);
}
```

**Security note:** `MONGO_URI` and `JWT_SECRET` must **not** have the `NEXT_PUBLIC_` prefix — that exposes them to the browser bundle.

---

## 9. Canonical .env.example

```bash
MONGO_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
SESSION_SECRET=<another-random-64-hex-string>
CORS_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=/api/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=/api/auth/github/callback
```

---

## 10. Rate Limiting on Auth Endpoints

```javascript
// server.js
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({ /* ... */ });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/auth/signin',       authLimiter);
app.use('/api/auth/signup',       authLimiter);
app.use('/api/auth/set-password', authLimiter);

// If behind a reverse proxy (Nginx, Cloudflare):
// app.set('trust proxy', 1);

app.listen(Number(process.env.PORT) || 5000);
```

---

*All snippets verified against Dimsee v0.6.x. For the latest API, see [README.md](README.md).*
