# Dimsee: Full-Stack Authentication Solution 🎨

[![NPM Version](https://img.shields.io/npm/v/dimsee.svg)](https://www.npmjs.com/package/dimsee)
[![NPM Downloads](https://img.shields.io/npm/dm/dimsee.svg)](https://www.npmjs.com/package/dimsee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Dimsee** is a powerful, ready-to-use authentication package for MERN stack applications. It provides a secure, customizable backend and a beautiful, themeable React frontend component to handle user registration, login, and session management with ease.

## 🚀 Features

### Backend
-   🔐 **Local Authentication:** Standard email/password signup and signin.
-   🌐 **OAuth 2.0:** Support for Google and GitHub.
-   🍪 **Session Management:** Secure, cookie-based sessions using JWT and `express-session`.
-   🛡️ **Secure Passwords:** Password hashing with `bcrypt.js`.
-   ⚙️ **Easy Configuration:** Simple to configure via a single config object.
-   🚧 **Route Protection:** Middleware to protect your API routes.

### Frontend
-   ⚛️ **React Component:** A single `AuthForm` component for all your auth needs.
-   🔄 **Multiple Modes:** Supports both 'signin' and 'signup' modes.
-   🎨 **Themable Designs:** Comes with three built-in themes: `modern`, `minimal`, and `colorful`.
-   🔗 **OAuth Integration:** Buttons for Google/GitHub login that activate based on backend configuration.
-   🛠️ **Customizable:** Easily extend and style with your own CSS.
-   📞 **Callbacks:** `onSuccess` and `onError` callbacks for handling auth events.

## 📚 Table of Contents
- [Getting Started](#getting-started)
- [Framework Guides](#-framework-guides)
  - [Create React App / Vite](#create-react-app--vite)
  - [Next.js](#nextjs)
- [Frontend: `AuthForm` Component](#frontend-authform-component)
- [Frontend Components: `AuthStatus` vs. `AuthForm`](#frontend-components-authstatus-vs-authform)
- [Backend: `createAuthBackend`](#backend-createauthbackend)
- [Backend API Reference](#backend-api-reference)
- [Customization and Contributing](#customization-and-contributing)
- [Deployment and Troubleshooting](#deployment-and-troubleshooting)
- [Use Cases](#use-cases)
- [License](#license)


## 🚀 Getting Started

### Installation

```bash
npm install dimsee
```

### Basic Usage

Here is a quick example of how to set up a basic authentication system with Dimsee by running a **standalone backend server**.

**Backend (`server.js`):**
```javascript
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: 'http://localhost:3000', // Your frontend URL
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
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

## 📖 Framework Guides

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
| `redirectUrl` | `string`   | `null`                       | A URL to redirect to after a successful OAuth login.                                                     |
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

We welcome contributions and custom implementations! 💖

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

If you encounter a bug or have a feature request, please [open an issue](https://github.com/your-repo/dimsee/issues) on our GitHub repository. Provide as much detail as possible, including:
-   A clear description of the issue.
-   Steps to reproduce it.
-   Any relevant error messages or console logs.
-   Your environment details (Node.js version, browser, etc.).

## 🚀 Deployment and Troubleshooting

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
-   **🚀 Prototyping MERN applications:** Quickly add authentication to your projects.
-   **SaaS products:** A solid foundation for user management.
-   **🏢 Internal tools:** Secure your internal applications with minimal effort.
-   **🎓 Learning:** A great way to see how full-stack authentication is implemented.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
