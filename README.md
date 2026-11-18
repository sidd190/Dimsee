# Dimsee: Full-Stack Authentication for the MERN Stack

[![NPM Version](https://img.shields.io/npm/v/dimsee.svg)](https://www.npmjs.com/package/dimsee)
[![NPM Downloads](https://img.shields.io/npm/dm/dimsee.svg)](https://www.npmjs.com/package/dimsee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Dimsee** is a drop-in authentication package for MERN applications. It pairs a configurable Express backend with a themeable React frontend, so you can add signup, login, OAuth, sessions, and protected routes without wiring auth from scratch.

Stand up a secure backend with a single `createAuthBackend()` call, drop an `<AuthForm />` into your React app, and you have working authentication in minutes. See [CONTRIBUTING.md](CONTRIBUTING.md) to get involved and [SECURITY.md](SECURITY.md) for the security policy.

## Features

### Backend
-   **Local Authentication:** Standard email/password signup and signin.
-   **OAuth 2.0:** Support for Google and GitHub.
-   **Session Management:** Secure, cookie-based sessions using JWT and `express-session`.
-   **Secure Passwords:** Password hashing with `bcryptjs`.
-   **Easy Configuration:** Simple to configure via a single config object.
-   **Route Protection:** Middleware to protect your API routes.

### Frontend
-   **React Component:** A single `AuthForm` component for all your auth needs.
-   **Multiple Modes:** Supports both 'signin' and 'signup' modes.
-   **Themable Designs:** Comes with three built-in themes: `modern`, `minimal`, and `colorful`.
-   **OAuth Integration:** Buttons for Google/GitHub login that activate based on backend configuration.
-   **Customizable:** Easily extend and style with your own CSS.
-   **Callbacks:** `onSuccess` and `onError` callbacks for handling auth events.

> For copy-paste secure setup code, jump to [Secure Snippets](#secure-snippets) or see [SECURE_SNIPPETS.md](SECURE_SNIPPETS.md).

## Table of Contents
- [Getting Started](#getting-started)
- [Framework Guides](#framework-guides)
  - [Create React App / Vite](#create-react-app--vite)
  - [Next.js](#nextjs)
- [Frontend: `AuthForm` Component](#frontend-authform-component)
- [Frontend Components: `AuthStatus` vs. `AuthForm`](#frontend-components-authstatus-vs-authform)
- [Backend: `createAuthBackend`](#backend-createauthbackend)
- [Backend API Reference](#backend-api-reference)
- [Customization and Contributing](#customization-and-contributing)
- [Secure Snippets](#secure-snippets) _(see also [SECURE_SNIPPETS.md](SECURE_SNIPPETS.md))_
- [Deployment and Troubleshooting](#deployment-and-troubleshooting)
- [Use Cases](#use-cases)
- [License](#license)


## Getting Started

### Installation

```bash
npm install dimsee
```

### Basic Usage

Here is a quick example of how to set up a basic authentication system with Dimsee by running a **standalone backend server**.

**Backend (`server.js`) : **
```javascript
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: 'http://localhost:3000', // Your frontend URL
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Frontend (`App.js`):**
```jsx
import {AuthProvider} from 'dimsee/frontend';
import {AuthForm} from 'dimsee/frontend';

function App() {
  return (
    <AuthProvider apiUrl="http://localhost:5000/api/auth">
      <div className="App">
        <AuthForm
          design="modern"
          onSuccess={(data) => console.log('Auth Success:', data)}
          onError={(error) => console.error('Auth Error:', error)}
        />
      </div>
    </AuthProvider>
  );
}
```

## Framework Guides

Learn how to integrate Dimsee with popular React frameworks.

### Create React App / Vite

For projects bootstrapped with **Create React App** or **Vite**, the setup is straightforward. You run the Dimsee backend as a separate server and connect your frontend to it.

1.  **Set up the Backend**: Use the code from the [Basic Usage](#basic-usage) section to create your `server.js`.
2.  **Environment Variables**: In your CRA/Vite project root, create a `.env` file.
    -   **Vite**: `VITE_API_URL=http://localhost:5000/api/auth`
    -   **Create React App**: `REACT_APP_API_URL=http://localhost:5000/api/auth`
3.  **Configure `AuthProvider`**: In your main `App.js` or `main.jsx`, wrap your app with `AuthProvider` and pass the API URL from your environment variables.

    ```jsx
    // Example for Vite
    <AuthProvider apiUrl={import.meta.env.VITE_API_URL}>
      <App />
    </AuthProvider>
    ```

### Next.js

With Next.js, you have two primary options for the backend:

1.  **(Recommended)** Run a [standalone backend server](#basic-usage) just like with CRA/Vite. This is the simplest and most scalable approach.
2.  **(Advanced)** Integrate the backend directly into Next.js API Routes.

#### Option 2: Integrated API Route

If you prefer an all-in-one setup, you can run the Dimsee backend inside a catch-all API route.

1.  **Create API Route**: Create a file at `pages/api/auth/[...slug].js` (or `app/api/auth/[...slug]/route.js` for App Router).

    ```javascript
    // file: pages/api/auth/[...slug].js
    import { createAuthBackend } from 'dimsee/backend';

    // Initialize the backend once
    const authApp = createAuthBackend({
        mongoUri: process.env.MONGO_URI,
        jwtSecret: process.env.JWT_SECRET,
        corsOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    // Disable Next.js's default body parser for this route
    export const config = {
        api: {
            bodyParser: false,
        },
    };

    export default function handler(req, res) {
        // Rewrite the URL to remove the `/api/auth` prefix
        req.url = req.url.replace('/api/auth', '');
        // Let the Dimsee Express app handle the request
        return authApp(req, res);
    }
    ```

2.  **Configure Frontend**: In your `_app.js` (or `layout.js` for App Router), wrap your application with the `AuthProvider`. The `apiUrl` now points to your internal API route.

    ```jsx
    // file: pages/_app.js
    import {AuthProvider} from 'dimsee/frontend';

    function MyApp({ Component, pageProps }) {
      return (
        <AuthProvider apiUrl="/api/auth">
          <Component {...pageProps} />
        </AuthProvider>
      );
    }

    export default MyApp;
    ```

3.  **Use Client Components**: Any component that uses `AuthForm` or `AuthStatus` must be a Client Component. Add `'use client';` to the top of the file if you are using the Next.js App Router.

## Frontend: `AuthForm` Component

The `AuthForm` component is the core of the Dimsee frontend. It is a highly configurable React component that handles user interaction for both signing in and signing up.

### Props

| Prop          | Type       | Default                      | Description                                                                                              |
|---------------|------------|------------------------------|----------------------------------------------------------------------------------------------------------|
| `mode`        | `string`   | `'signin'`                   | Determines if the form is in `'signin'` or `'signup'` mode.                                              |
| `design`      | `string`   | `'modern'`                   | The visual theme of the form. Options: `'modern'`, `'minimal'`, `'colorful'`.                             |
| `onSuccess`   | `function` | `undefined`                  | Callback function executed on successful authentication. Receives response data.                           |
| `onError`     | `function` | `undefined`                  | Callback function executed on authentication failure. Receives the error object.                         |
| `className`   | `string`   | `''`                         | Additional CSS classes to apply to the component's root element for custom styling.                      |
| `oAuthConfig` | `object`   | `null`                       | An object to dynamically configure OAuth providers on the frontend.                                      |
| `redirectUrl` | `string`   | `null`                       | Destination after successful OAuth login. Accepts relative paths or HTTP(S) URLs on the backend's configured `corsOrigin`; defaults to `corsOrigin`. External origins are rejected. |
| `onModeChange`| `function` | `undefined`                  | A function to make the form a controlled component, managing the `mode` from a parent component.         |

---

## Frontend Components: `AuthStatus` vs. `AuthForm`

Dimsee provides two key frontend components: `AuthStatus` and `AuthForm`. Understanding their differences is key to using the package effectively.

-   **`AuthForm`** is a low-level component focused on one thing: displaying a sign-in or sign-up form.
-   **`AuthStatus`** is a high-level component that acts as a "controller." It checks if a user is logged in and, based on that status, decides what to render: the `AuthForm`, a logout button, or your application's content.

### Use Case Comparison

| Scenario                                | Recommended Component | Why?                                                                                                              |
|-----------------------------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------|
| A dedicated `/login` page               | `AuthForm`            | You just need to show the form, as the user is guaranteed to be unauthenticated on this page.                     |
| A popup modal for login/signup          | `AuthForm`            | You control when the modal appears, so you just need the form itself inside the modal.                            |
| A simple drop-in for an entire app      | `AuthStatus`          | It will handle everything automatically: show the login form if logged out, and your app content if logged in.      |
| A header that shows "Login" or "Logout" | `AuthStatus`          | It can automatically switch between showing a login prompt (`AuthForm`) and a `LogoutButton` based on auth state. |

### Using `AuthStatus`

`AuthStatus` is the easiest way to get started. It wraps your authenticated application content and handles the entire authentication flow.

#### Basic Example: Protecting App Content

If a user is not logged in, `AuthStatus` will render the `AuthForm`. Once they log in, it will render the content passed to it as `children`.

```jsx
import { AuthStatus } from 'dimsee/frontend';

function App() {
  return (
    <AuthProvider apiUrl="http://localhost:5000/api/auth">
      <AuthStatus>
        {/* This content will only be shown to authenticated users */}
        <div>
          <h1>Welcome to the App!</h1>
          <p>This is a protected area.</p>
        </div>
      </AuthStatus>
    </AuthProvider>
  );
}
```

#### Advanced Example: Showing User Info and Set Password Button

`AuthStatus` also automatically includes the `LogoutButton` and can conditionally show the `SetPasswordButton` for users who signed up with an OAuth provider.

```jsx
import { AuthStatus } from 'dimsee/frontend';

function App() {
  return (
    <AuthProvider apiUrl="http://localhost:5000/api/auth">
      <AuthStatus
        showUserInfo={true}          // Shows username next to logout button
        showSetPassword={true}       // Shows a "Set Password" button if needed
        logoutDesign="minimal"
      >
        {/* Your protected app content here */}
      </AuthStatus>
    </AuthProvider>
  );
}
```

### `AuthStatus` Props

| Prop                       | Type      | Default     | Description                                                                              |
|----------------------------|-----------|-------------|------------------------------------------------------------------------------------------|
| `showForm`                 | `boolean` | `true`      | If `true`, renders `AuthForm` when the user is not authenticated.                          |
| `formMode`                 | `string`  | `'signin'`  | The default mode for the nested `AuthForm`.                                              |
| `formDesign`               | `string`  | `'modern'`  | The design theme for the nested `AuthForm`.                                              |
| `logoutDesign`             | `string`  | `'modern'`  | The design theme for the `LogoutButton`.                                                 |
| `showUserInfo`             | `boolean` | `true`      | If `true`, displays the user's name next to the logout button.                             |
| `showSetPassword`          | `boolean` | `false`     | If `true`, displays a `SetPasswordButton` for authenticated users without a password.      |
| `children`                 | `node`    | `undefined` | The content to display when the user is authenticated.                                   |
| `unauthenticatedComponent` | `node`    | `undefined` | A custom component to show instead of `AuthForm` when the user is not authenticated.     |

For more granular control over logout and set password button positioning and styling, refer to their individual component files.

`SetPasswordButton` accepts `showPrompt` (default `true`): the button opens a password modal. Set `showPrompt={false}` to display the password form inline immediately. It renders only for authenticated users who do not already have a password.

Signup requests must include `username`, `email`, `password`, and `confirmPassword`. Usernames must contain 3–20 letters, digits, or underscores. Passwords must contain at least six characters, including an uppercase letter, a lowercase letter, and a digit, and confirmation must match. These rules are now enforced by the backend; API clients that previously omitted confirmation or used weaker passwords must update. Signin requires nonempty email and password strings, without applying the new signup email-format or password-complexity checks to existing accounts.

## Backend: `createAuthBackend`

The `createAuthBackend` function sets up and returns a fully configured Express application with all the necessary middleware and routes for authentication.

### Configuration Options

| Option        | Type     | Default                           | Description                                                                 |
|---------------|----------|-----------------------------------|-----------------------------------------------------------------------------|
| `mongoUri`    | `string` | `'mongodb://localhost:27017/mern-auth'` | The connection string for your MongoDB database.                          |
| `jwtSecret`   | `string` | `'your-secret-key-...'`           | A secret key for signing JWTs. **Change this in production.**               |
| `corsOrigin`  | `string` | `'http://localhost:5173'`         | The origin to allow for CORS requests (your frontend URL).                  |
| `cookieMaxAge`| `number` | `604800000` (7 days)              | The max age for the authentication cookie in milliseconds.                  |
| `enableOAuth` | `boolean`| `false`                           | A flag to enable or disable OAuth functionality.                            |
| `oauth`       | `object` | `{}`                              | An object containing credentials for OAuth providers (Google, GitHub).      |

### Protecting Routes

The package also exports an `authMiddleware` that you can use to protect your own API routes.

```javascript
const { createAuthBackend, authMiddleware } = require('dimsee/backend');
const app = createAuthBackend(...);

app.get('/api/my-protected-route', authMiddleware, (req, res) => {
  // This will only be accessible to authenticated users
  res.json({ message: 'You have accessed a protected route!' });
});
```

## Backend API Reference

The backend exposes the following API endpoints under the `/api/auth` prefix.

| Method | Endpoint               | Description                                           |
|--------|------------------------|-------------------------------------------------------|
| `POST` | `/signup`              | Register a new user.                                  |
| `POST` | `/signin`              | Log in an existing user.                              |
| `POST` | `/signout`             | Log out the current user.                             |
| `GET`  | `/me`                  | Get the profile of the currently authenticated user.  |
| `GET`  | `/oauth-status`        | Check which OAuth providers are enabled.              |
| `GET`  | `/google`              | Initiate Google OAuth login.                          |
| `GET`  | `/google/callback`     | Callback URL for Google OAuth.                        |
| `GET`  | `/github`              | Initiate GitHub OAuth login.                          |
| `GET`  | `/github/callback`     | Callback URL for GitHub OAuth.                        |
| `POST` | `/set-password`        | Allow an OAuth user to set a password.                |

## Customization and Contributing

We welcome contributions and custom implementations!

### Customizing Styles

You can override the component's default styles by targeting the CSS classes outlined in the `CUSTOMIZATION.md` file. For best results, make your CSS selectors more specific than the library's.

**Example: Overriding input focus color**
```css
/* Make selector more specific to win */
body .auth-container.modern .form-input:focus {
  border-color: #ff8a00;
  box-shadow: 0 0 0 3px rgba(255, 138, 0, 0.3);
}
```

### Contributing a New Theme

Have you built a great-looking theme? We'd love to include it!

1.  **Fork the repository** and create a new branch.
2.  **Add your CSS** to `frontend/src/components/AuthForm.css`. Wrap all your styles in a unique theme class (e.g., `.auth-container.my-theme`).
3.  **Test your theme** thoroughly in both `signin` and `signup` modes, including error states and different screen sizes.
4.  **Submit a pull request** with a screenshot of your theme in action.

### Reporting Issues

If you encounter a bug or have a feature request, please [open an issue](https://github.com/sidd190/dimsee/issues) on our GitHub repository. Provide as much detail as possible, including:
-   A clear description of the issue.
-   Steps to reproduce it.
-   Any relevant error messages or console logs.
-   Your environment details (Node.js version, browser, etc.).

## Secure Snippets

This section provides **vetted, copy-paste-ready code snippets** that follow security best practices by construction. Each snippet is safe to use as-is; anti-patterns are explicitly called out so AI assistants and developers always reproduce the secure path.

> **Why this matters:** Authentication bugs are among the most common and dangerous security flaws. These snippets eliminate the guesswork.

### Quick Reference

| Snippet | What It Secures |
|---------|----------------|
| [Backend – Minimal Secure Setup](#1-backend--minimal-secure-setup) | Strong secrets, env vars, `NODE_ENV` |
| [Backend – With OAuth (Google + GitHub)](#2-backend--with-oauth-google--github) | Callback URL pinning, scoped secrets |
| [Backend – Protecting Custom Routes](#3-backend--protecting-custom-routes) | Middleware-based route guards |
| [Frontend – AuthProvider with HTTPS API URL](#4-frontend--authprovider-with-https-api-url) | No hardcoded localhost in production |
| [Frontend – AuthForm with Callbacks](#5-frontend--authform-with-callbacks) | Error boundaries, no silent failures |
| [Frontend – AuthStatus: Gate Entire App](#6-frontend--authstatus-gate-entire-app) | Server-verified session, no client-only guards |
| [Frontend – Controlled Mode Switch](#7-frontend--controlled-mode-switch) | Prevent race conditions on mode toggle |
| [Next.js – Integrated API Route](#8-nextjs--integrated-api-route) | Body parser disabled, env-only config |
| [Environment Variables – .env.example](#9-environment-variables--envexample) | Canonical list; no secrets in source |
| [Rate Limiting – Hardening Endpoints](#10-rate-limiting--hardening-endpoints) | Brute-force protection on auth routes |

---

### 1. Backend – Minimal Secure Setup

```javascript
// server.js
// ✅ SECURE: All sensitive values come from environment variables.
// ❌ NEVER hardcode mongoUri, jwtSecret, or corsOrigin in source code.

require('dotenv').config(); // npm install dotenv
const { createAuthBackend } = require('dimsee/backend');

if (!process.env.MONGO_URI)   throw new Error('MONGO_URI env var is required');
if (!process.env.JWT_SECRET)  throw new Error('JWT_SECRET env var is required');
if (!process.env.CORS_ORIGIN) throw new Error('CORS_ORIGIN env var is required');
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters for production use');
}

const app = createAuthBackend({
  mongoUri:    process.env.MONGO_URI,
  jwtSecret:   process.env.JWT_SECRET,
  corsOrigin:  process.env.CORS_ORIGIN,     // e.g. 'https://www.your-app.com'
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms (explicit, not magic)
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));
```

> **Security notes:**
> - Startup-time guard clauses (`throw new Error`) crash early if any secret is missing, preventing a misconfigured server from silently accepting requests.
> - `corsOrigin` must be your **exact** production frontend URL — no wildcards, no trailing slashes.
> - Generate a strong `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

### 2. Backend – With OAuth (Google + GitHub)

```javascript
// server.js
require('dotenv').config();
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri:   process.env.MONGO_URI,
  jwtSecret:  process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
  enableOAuth: true,
  oauth: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // ✅ Use an absolute URL that matches your OAuth console exactly.
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      // e.g. 'https://api.your-app.com/api/auth/google/callback'
    },
    github: {
      clientId:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  process.env.GITHUB_CALLBACK_URL,
      // e.g. 'https://api.your-app.com/api/auth/github/callback'
    },
  },
});

app.listen(Number(process.env.PORT) || 5000);
```

> **Security notes:**
> - Store **callback URLs** in env vars too — this avoids a mismatch between your code and your OAuth provider console.
> - Each OAuth provider's "Authorized redirect URIs" must list **exactly** the value of `callbackURL`. Even a trailing slash difference causes failures.
> - Never commit `.env` — add it to `.gitignore`. Use `.env.example` (no real values) for onboarding.

---

### 3. Backend – Protecting Custom Routes

```javascript
// server.js
const { createAuthBackend, authMiddleware } = require('dimsee/backend');

const app = createAuthBackend({ /* ... */ });

// ✅ SECURE: authMiddleware verifies the JWT on every request.
// ❌ NEVER rely solely on frontend route guards — the server must verify.
app.get('/api/profile', authMiddleware, (req, res) => {
  // req.user is populated by authMiddleware after JWT verification.
  res.json({ user: req.user });
});

app.get('/api/admin/data', authMiddleware, (req, res) => {
  // Add role checks here if needed (e.g. req.user.role === 'admin').
  res.json({ data: 'sensitive admin payload' });
});

// ✅ Public routes need no middleware:
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
```

> **Security notes:**
> - **Every** protected endpoint must include `authMiddleware` — there is no "default protected" mode.
> - Frontend route guards (e.g. React Router `<PrivateRoute>`) are UX helpers only; server-side checks are the real security boundary.

---

### 4. Frontend – AuthProvider with HTTPS API URL

```jsx
// App.jsx (or main.jsx / _app.js)
import { AuthProvider } from 'dimsee/frontend';

// ✅ SECURE: API URL comes from environment variables.
// ❌ NEVER hardcode 'http://localhost:5000' in production builds.
const API_URL = import.meta.env.VITE_API_URL           // Vite
             || process.env.REACT_APP_API_URL           // Create React App
             || process.env.NEXT_PUBLIC_API_URL;        // Next.js

if (!API_URL) {
  throw new Error('API URL env var is not set. Check your .env file.');
}

function App() {
  return (
    <AuthProvider apiUrl={API_URL}>
      {/* rest of your app */}
    </AuthProvider>
  );
}

export default App;
```

> **Security notes:**
> - In production, `API_URL` must start with `https://`. HTTP leaks tokens in transit.
> - The backend's `corsOrigin` and the frontend's `API_URL` host must agree — a mismatch causes CORS errors.

---

### 5. Frontend – AuthForm with Callbacks

```jsx
// LoginPage.jsx
import { AuthForm } from 'dimsee/frontend';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  // ✅ SECURE: Always handle both onSuccess and onError.
  // ❌ NEVER silently swallow errors — users won't know why login failed.
  return (
    <AuthForm
      mode="signin"
      design="modern"
      onSuccess={(data) => {
        // Redirect to protected area; do NOT store JWT in localStorage.
        navigate('/dashboard');
      }}
      onError={(error) => {
        // Log to your monitoring service (not to console in production).
        console.error('[Auth Error]', error?.message ?? error);
      }}
    />
  );
}

export default LoginPage;
```

> **Security notes:**
> - Dimsee uses **HTTP-only cookies** for session tokens — you don't need to (and shouldn't) manually store tokens in `localStorage` or `sessionStorage`.
> - `localStorage` is accessible to JavaScript and therefore vulnerable to XSS. HTTP-only cookies are not.

---

### 6. Frontend – AuthStatus: Gate Entire App

```jsx
// App.jsx
import { AuthProvider, AuthStatus } from 'dimsee/frontend';

function App() {
  return (
    // ✅ SECURE: AuthStatus hits /api/auth/me on mount to verify the session
    //            server-side before rendering protected content.
    <AuthProvider apiUrl={import.meta.env.VITE_API_URL}>
      <AuthStatus
        showUserInfo={true}       // display username in the logout bar
        showSetPassword={true}    // let OAuth users set a password later
        formDesign="modern"
      >
        {/* Only rendered after server confirms the user is authenticated */}
        <Dashboard />
      </AuthStatus>
    </AuthProvider>
  );
}
```

> **Security notes:**
> - `AuthStatus` calls the `/api/auth/me` endpoint on every page load, so a revoked or expired session is detected immediately — no stale client-side state.
> - Wrap your entire app (not just individual pages) so there is no unguarded render path.

---

### 7. Frontend – Controlled Mode Switch

```jsx
// AuthModal.jsx  — sign-in / sign-up toggle
import { useState } from 'react';
import { AuthForm } from 'dimsee/frontend';

function AuthModal({ onClose }) {
  // ✅ SECURE: Use controlled state so only one mode is ever active.
  // ❌ NEVER let two form submissions race (e.g., triggering both signin
  //    and signup if the user clicks while a request is in-flight).
  const [mode, setMode] = useState('signin');

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <AuthForm
        mode={mode}
        onModeChange={setMode}   // let the form toggle mode via its own link
        design="minimal"
        onSuccess={onClose}
        onError={(err) => console.error('[Auth]', err)}
      />
    </div>
  );
}

export default AuthModal;
```

---

### 8. Next.js – Integrated API Route

```javascript
// pages/api/auth/[...slug].js  (Pages Router)
// 'use server' — this file never runs in the browser.
import { createAuthBackend } from 'dimsee/backend';

// ✅ Initialize once at module load, not inside the handler.
//    Re-creating the backend per request would leak DB connections.
const authApp = createAuthBackend({
  mongoUri:   process.env.MONGO_URI,
  jwtSecret:  process.env.JWT_SECRET,
  corsOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// ✅ REQUIRED: Disable Next.js body parsing; Dimsee's Express handles it.
export const config = { api: { bodyParser: false } };

export default function handler(req, res) {
  // Strip the Next.js API prefix so Dimsee sees clean paths (/signup, /signin…)
  req.url = req.url.replace('/api/auth', '');
  return authApp(req, res);
}
```

> **Security notes:**
> - **Never** put real secrets in `next.config.js` — only in `.env.local` (not committed).
> - `NEXT_PUBLIC_*` variables are **exposed to the browser**. Use them only for public values (like the app URL). Keep `MONGO_URI` and `JWT_SECRET` without the `NEXT_PUBLIC_` prefix.

---

### 9. Environment Variables – .env.example

Copy this file to `.env` (never commit `.env`) and fill in your real values:

```bash
# .env.example  — commit this file; keep .env gitignored

# ── Database ────────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mydb?retryWrites=true&w=majority

# ── Auth ────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<at-least-64-hex-chars>

# ── CORS / Frontend URL ──────────────────────────────────
CORS_ORIGIN=https://www.your-app.com        # exact frontend origin, no trailing slash
PORT=5000

# ── OAuth – Google ───────────────────────────────────────
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
GOOGLE_CALLBACK_URL=https://api.your-app.com/api/auth/google/callback

# ── OAuth – GitHub ───────────────────────────────────────
GITHUB_CLIENT_ID=<from-github-developer-settings>
GITHUB_CLIENT_SECRET=<from-github-developer-settings>
GITHUB_CALLBACK_URL=https://api.your-app.com/api/auth/github/callback

# ── Frontend (Vite / CRA / Next.js) ─────────────────────
VITE_API_URL=https://api.your-app.com/api/auth
# REACT_APP_API_URL=https://api.your-app.com/api/auth
# NEXT_PUBLIC_API_URL=https://api.your-app.com/api/auth
```

---

### 10. Rate Limiting – Hardening Endpoints

Dimsee's backend exposes an Express app, so you can layer standard Express middleware for extra hardening:

```javascript
// server.js
require('dotenv').config();
const rateLimit = require('express-rate-limit');   // npm install express-rate-limit
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri:   process.env.MONGO_URI,
  jwtSecret:  process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
});

// ✅ SECURE: Limit auth endpoints to prevent brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Apply only to mutation auth routes (not /me or /oauth-status).
app.use('/api/auth/signin',  authLimiter);
app.use('/api/auth/signup',  authLimiter);
app.use('/api/auth/set-password', authLimiter);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT);
```

> **Security notes:**
> - Adjust `max` and `windowMs` for your expected traffic — a public app will need stricter limits than an internal tool.
> - In production behind a proxy (e.g., Nginx, Cloudflare), set `app.set('trust proxy', 1)` so rate limiting uses the real client IP from `X-Forwarded-For`, not the proxy IP.

---

> [!TIP]
> These snippets are designed to be AI-assistant-friendly: copy any block into your project and it will work securely without modification. The `❌ NEVER` callouts explicitly mark the insecure alternatives so code-generation tools learn the correct path.

## Deployment and Troubleshooting

Moving your application to a production environment requires careful configuration to ensure security and functionality.

### Deployment Checklist

1.  **Set `NODE_ENV`**: Your hosting environment **must** have `NODE_ENV=production`. This is critical for security and performance.
2.  **Configure Environment Variables**:
    -   `MONGO_URI`: Your production database connection string.
    -   `JWT_SECRET`: A long, random, unique string for signing tokens.
    -   `CORS_ORIGIN`: Your exact frontend production URL (e.g., `https://www.your-app.com`).
    -   (Optional) OAuth credentials (`GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, etc.)
3.  **Update Backend Configuration**: Pass your environment variables to the `createAuthBackend` function.
    ```javascript
    const app = createAuthBackend({
      mongoUri: process.env.MONGO_URI,
      jwtSecret: process.env.JWT_SECRET,
      corsOrigin: process.env.CORS_ORIGIN,
      enableOAuth: true, // if using OAuth
      oauth: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback'
        }
      }
    });
    ```
4.  **Update Frontend Configuration**: Set the `apiUrl` in your `AuthProvider` to point to your live backend.
    ```jsx
    <AuthProvider apiUrl="https://api.your-app.com/api/auth">
      {/* ... */}
    </AuthProvider>
    ```
5.  **Configure OAuth Redirect URIs**: In your Google/GitHub developer console, add your production callback URL (e.g., `https://api.your-app.com/api/auth/google/callback`) to the list of authorized redirect URIs.

### Common Issues

-   **"CORS Error"**: This means the `corsOrigin` in your backend config does not exactly match the URL of your frontend. Check for typos, and ensure it includes `https://`.
-   **"Invalid Token" / "No Token Provided"**: This can happen if the frontend and backend are on different root domains (e.g., `app.com` and `api.herokuapp.com`), as browsers may block third-party cookies. To fix this, ensure both your frontend and backend are on subdomains of the same parent domain (e.g., `www.app.com` and `api.app.com`).
-   **OAuth Login Fails with "Redirect URI Mismatch"**: The callback URL registered in your OAuth provider's settings does not exactly match the one your backend is configured with.
-   **User is Logged Out on Refresh**: This could mean cookies are not being set correctly. Ensure `withCredentials: true` is set in your frontend requests (Axios does this by default in this package) and that your CORS/domain configuration is correct.

## Use Cases

Dimsee is ideal for:
-   **Prototyping MERN applications:** Quickly add authentication to your projects.
-   **SaaS products:** A solid foundation for user management.
-   **Internal tools:** Secure your internal applications with minimal effort.
-   **Learning:** A great way to see how full-stack authentication is implemented.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
