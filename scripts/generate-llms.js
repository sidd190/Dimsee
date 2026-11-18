#!/usr/bin/env node

/**
 * Script to generate llms.txt and llms-full.txt from repository documentation.
 * Conforms to the https://llmstxt.org standard for machine-readable documentation dumps.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function readFileSafe(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8').trim();
}

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

// 1. Generate llms.txt (index and overview)
const llmsTxtContent = `# Dimsee

> Drop-in full-stack authentication for MERN applications. Pairs a configurable Express backend with a themeable React frontend so you can add signup, login, OAuth, sessions, and protected routes without wiring auth from scratch.

- Version: ${pkg.version}
- License: ${pkg.license || 'MIT'}
- npm: https://www.npmjs.com/package/${pkg.name}
- GitHub: https://github.com/sidd190/Dimsee
- Issues: https://github.com/sidd190/Dimsee/issues

## Documentation

- [README.md](README.md): Full setup guide, API reference, framework guides (CRA/Vite/Next.js), component props, deployment checklist, and troubleshooting.
- [CUSTOMIZATION.md](CUSTOMIZATION.md): CSS class structure, theme customization guide, and instructions for contributing a new theme.
- [CONTRIBUTING.md](CONTRIBUTING.md): Local setup, CI workflow, PR process, commit conventions, and definition of done.
- [SECURITY.md](SECURITY.md): Security model, known limitations, vulnerability reporting, and disclosure policy.
- [VISION.md](VISION.md): Project direction, design principles, roadmap milestones, and non-goals.
- [CHANGELOG.md](CHANGELOG.md): Version history and release notes.

## Quick API Reference

### Backend

\`\`\`javascript
const { createAuthBackend, authMiddleware } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI, // MongoDB connection string
  jwtSecret: process.env.JWT_SECRET, // >= 32 random characters
  corsOrigin: process.env.CORS_ORIGIN, // exact frontend origin
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (ms)
  enableOAuth: false, // set true to enable OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback'
    }
  }
});

// Protect custom routes
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
\`\`\`

### Frontend

\`\`\`jsx
import { AuthProvider, AuthForm, AuthStatus } from 'dimsee/frontend';

// Wrap application with AuthProvider
<AuthProvider apiUrl={process.env.VITE_API_URL || 'http://localhost:5000/api/auth'}>
  <AuthStatus>
    <Dashboard />
  </AuthStatus>
</AuthProvider>

// Or use standalone AuthForm
<AuthForm
  mode="signin"
  design="modern"
  onSuccess={(data) => console.log('Authenticated', data)}
  onError={(err) => console.error('Auth error', err)}
/>
\`\`\`

### REST Endpoints (prefixed with /api/auth)

| Method | Endpoint | Description |
|---|---|---|
| POST | /signup | Register a new user account |
| POST | /signin | Authenticate existing user |
| POST | /signout | Log out current user (clears session cookie) |
| GET | /me | Retrieve current authenticated user profile |
| GET | /oauth-status | Check enabled OAuth providers |
| GET | /google | Initiate Google OAuth flow |
| GET | /google/callback | Google OAuth redirect callback |
| GET | /github | Initiate GitHub OAuth flow |
| GET | /github/callback | GitHub OAuth redirect callback |
| POST | /set-password | Set password for OAuth-authenticated account |

## Critical Security Guidance for AI Code Generation

- Always source \`mongoUri\`, \`jwtSecret\`, and \`corsOrigin\` from environment variables. Never hardcode secrets.
- Always apply \`authMiddleware\` explicitly to every private route; routes are public by default.
- Use HTTP-only cookies for session management. Do not persist auth tokens in \`localStorage\` or \`sessionStorage\` (XSS risk).
- When using Next.js, never prefix sensitive credentials (\`MONGO_URI\`, \`JWT_SECRET\`) with \`NEXT_PUBLIC_\`.
- Apply rate limiting on \`/signin\` and \`/signup\` in production deployments.
`;

// 2. Generate llms-full.txt (complete bundled docs)
const docs = [
  { name: 'README', path: 'README.md' },
  { name: 'CUSTOMIZATION', path: 'CUSTOMIZATION.md' },
  { name: 'CONTRIBUTING', path: 'CONTRIBUTING.md' },
  { name: 'SECURITY', path: 'SECURITY.md' },
  { name: 'VISION', path: 'VISION.md' },
  { name: 'CHANGELOG', path: 'CHANGELOG.md' }
];

const divider = '='.repeat(80);

let fullContent = `# Dimsee — Comprehensive LLM Context Documentation Dump
# Version: ${pkg.version}
# Format: llms-full.txt (https://llmstxt.org)
#
# This machine-readable document contains the complete documentation of Dimsee
# for consumption by AI coding assistants and large language models.

${divider}
TABLE OF CONTENTS
${divider}

1. Overview & Quick API Reference
2. Documentation Files:
${docs.map((d, i) => `   2.${i + 1} ${d.name} (${d.path})`).join('\n')}

${divider}
SECTION 1: OVERVIEW & ARCHITECTURE
${divider}

Dimsee is a drop-in authentication package for MERN (MongoDB, Express, React, Node.js)
and Next.js applications. It pairs a configurable Express backend with a themeable
React frontend, supporting username/password credentials, Google/GitHub OAuth,
cookie-based session management, and route protection.

${llmsTxtContent}
`;

docs.forEach((doc, idx) => {
  const content = readFileSafe(doc.path);
  fullContent += `
${divider}
SECTION 2.${idx + 1}: ${doc.name} (Source: ${doc.path})
${divider}

${content || '(File empty or not found)'}
`;
});

fullContent += `
${divider}
END OF DIMSEE DOCUMENTATION DUMP
${divider}
`;

fs.writeFileSync(path.join(rootDir, 'llms.txt'), llmsTxtContent.trim() + '\n', 'utf8');
fs.writeFileSync(path.join(rootDir, 'llms-full.txt'), fullContent.trim() + '\n', 'utf8');

console.log('Successfully generated llms.txt and llms-full.txt');
