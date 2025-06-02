# Dimsee

A modern, flexible authentication solution for MERN stack applications with built-in OAuth support. Dimsee provides a complete authentication system that's easy to integrate, secure by default, and highly customizable.

## Features

- 🔐 Complete authentication system for MERN applications
- 🚀 Easy integration with React frontend
- 🔑 OAuth support for Google and GitHub
- 🎯 Session management with MongoDB
- 🛡️ JWT and cookie-based authentication
- ⚡ Flexible configuration options
- 📦 TypeScript support
- 🎨 Customizable UI components
- 🔄 Real-time auth state management
- 🌐 Cross-domain support
- 📱 Mobile-friendly by default

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [OAuth Setup](#oauth-setup)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Installation

```bash
npm install dimsee
# or
yarn add dimsee
# or
pnpm add dimsee
```

## Quick Start

### Backend Setup

```javascript
const express = require('express');
const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri: 'your-mongodb-uri',
  jwtSecret: 'your-jwt-secret',
  corsOrigin: 'http://your-frontend-url',
  enableOAuth: true,
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback'
    }
  }
});

app.listen(5000, () => {
  console.log('Auth server running on port 5000');
});
```

### Frontend Setup

```jsx
import { AuthProvider, useAuth } from 'dimsee/frontend';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider
      backendUrl="http://localhost:5000"
      onAuthStateChange={(user) => console.log('Auth state changed:', user)}
    >
      <YourApp />
    </AuthProvider>
  );
}

// Use authentication in any component
function LoginButton() {
  const { login, isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.name}!</div>;
  }

  return (
    <button onClick={() => login('google')}>
      Login with Google
    </button>
  );
}
```

## Configuration

### Backend Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| mongoUri | string | 'mongodb://localhost:27017/mern-auth' | MongoDB connection URI |
| jwtSecret | string | 'your-secret-key-change-in-production' | Secret for JWT signing |
| corsOrigin | string/array/function | 'http://localhost:5173' | Frontend origin for CORS |
| cookieMaxAge | number | 7 * 24 * 60 * 60 * 1000 | Cookie expiration in ms |
| enableOAuth | boolean | false | Enable OAuth authentication |
| oauth | object | {} | OAuth provider configurations |
| sessionStore | object | null | Custom session store configuration |
| cookieOptions | object | {} | Additional cookie options |

### Frontend Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| backendUrl | string | Yes | URL of your auth backend |
| onAuthStateChange | function | No | Callback for auth state changes |
| children | ReactNode | Yes | Child components |
| authConfig | object | No | Additional auth configuration |
| persistKey | string | No | Local storage key for persistence |

## OAuth Setup

⚠️ **Important**: Each application using Dimsee needs its own OAuth credentials. You cannot use shared or pre-provided OAuth keys because callback URLs must be specifically authorized for your domain.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API and OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add your specific callback URLs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
6. Set environment variables in your application (not in the package):
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Add your specific callback URLs:
   - Development: `http://localhost:5000/api/auth/github/callback`
   - Production: `https://your-domain.com/api/auth/github/callback`
4. Set environment variables in your application (not in the package):
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### OAuth Configuration in Your App

```javascript
const app = createAuthBackend({
  // ... other options
  enableOAuth: true,
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Make sure this matches the callback URL you set in Google Console
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com/api/auth/google/callback'
        : 'http://localhost:5000/api/auth/google/callback'
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // Make sure this matches the callback URL you set in GitHub
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com/api/auth/github/callback'
        : 'http://localhost:5000/api/auth/github/callback'
    }
  }
});
```

## API Reference

### Backend Routes

#### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
  ```typescript
  body: {
    email: string;
    password: string;
    name?: string;
  }
  ```

- POST `/api/auth/login` - Login with credentials
  ```typescript
  body: {
    email: string;
    password: string;
  }
  ```

- GET `/api/auth/logout` - Logout user
- GET `/api/auth/user` - Get current user
- GET `/api/auth/google` - Google OAuth login
- GET `/api/auth/github` - GitHub OAuth login

### Frontend Hooks

#### useAuth Hook

```javascript
const {
  // Current authenticated user or null
  user,                
  
  // Authentication status
  isAuthenticated,     
  
  // Loading state for auth operations
  isLoading,          
  
  // Login with email/password
  login: (email: string, password: string) => Promise<void>,
  
  // Logout current user
  logout: () => Promise<void>,
  
  // Register new user
  register: (email: string, password: string, data?: object) => Promise<void>,
  
  // OAuth login
  loginWithOAuth: (provider: 'google' | 'github') => void,
  
  // Update user data
  updateUser: (data: object) => Promise<void>,
  
  // Auth error if any
  error: Error | null
} = useAuth();
```

## Advanced Usage

### Custom Session Store

```javascript
const MongoStore = require('connect-mongo');

const app = createAuthBackend({
  // ... other options
  sessionStore: {
    store: MongoStore.create({
      mongoUrl: 'your-mongodb-uri',
      collectionName: 'custom-sessions'
    })
  }
});
```

### Custom User Model

```javascript
const app = createAuthBackend({
  // ... other options
  userModel: {
    schema: {
      name: String,
      role: { type: String, default: 'user' },
      metadata: Object
    },
    methods: {
      isAdmin() {
        return this.role === 'admin';
      }
    }
  }
});
```

### Protected Routes

```javascript
const { authMiddleware } = require('dimsee/backend');

// Protect specific routes
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Role-based protection
const roleMiddleware = (role) => (req, res, next) => {
  if (req.user?.role === role) next();
  else res.status(403).json({ error: 'Unauthorized' });
};

app.get('/api/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

## Security

- Sessions are stored securely in MongoDB
- Passwords are hashed using bcrypt
- JWT tokens are signed with your secret
- CORS is configured for your frontend
- Cookies are HTTP-only and secure in production
- Rate limiting on authentication endpoints
- Protection against common attacks:
  - CSRF
  - XSS
  - Session hijacking
  - Brute force attempts

## Error Handling

```javascript
try {
  await login(email, password);
} catch (error) {
  if (error.code === 'AUTH_INVALID_CREDENTIALS') {
    // Handle invalid credentials
  } else if (error.code === 'AUTH_USER_NOT_FOUND') {
    // Handle user not found
  }
}
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

## Support

- 📚 [Documentation](https://github.com/sidd190/dimsee#readme)
- 🐛 [Report a bug](https://github.com/sidd190/dimsee/issues)
- 💡 [Request a feature](https://github.com/sidd190/dimsee/issues)
- 📧 [Email support](mailto:sidd190bansal@gmail.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Built with ❤️ by [Siddharth Bansal](https://github.com/sidd190) 