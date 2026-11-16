# Dimsee Integration Examples

This directory provides minimal, production-ready examples demonstrating how to integrate Dimsee authentication into popular modern React frameworks.

---

## Available Examples

### 1. `examples/vite-react`
A lightning-fast Single Page Application built with **Vite** and **React 18**:
- Demonstrates wrapping your application in `AuthProvider`.
- Uses `AuthForm` with custom themes (`modern`, `glass`, `sunset`, `terminal`, etc.).
- Displays `AuthStatus` and authenticated user profile with `LogoutButton`.
- Demonstrates making authenticated API calls with credentials automatically attached.

**To run:**
```bash
cd examples/vite-react
npm install
npm run dev
```

### 2. `examples/nextjs`
A full-stack **Next.js (App Router)** application:
- Demonstrates server/client component boundary setup with Dimsee client components (`'use client'`).
- Shows custom session hydration and protected page routing.
- Demonstrates SSR-friendly authentication rendering.

**To run:**
```bash
cd examples/nextjs
npm install
npm run dev
```

---

## Backend Requirements

Both examples expect a running Dimsee backend instance at `http://localhost:5000`:
```javascript
const express = require('express');
const { createAuthBackend } = require('dimsee');

const app = createAuthBackend({
  corsOrigin: 'http://localhost:5173', // or your client port
  enableOAuth: true,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key'
});

app.listen(5000, () => console.log('Dimsee backend listening on port 5000'));
```
