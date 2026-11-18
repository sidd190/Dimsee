/**
 * Dimsee Documentation Model Context Protocol (MCP) Server.
 * Exposes Dimsee documentation and code snippets to AI coding assistants
 * over standard JSON-RPC (MCP specification 2024-11-05).
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');

const DOC_FILES = {
  'readme': { path: 'README.md', description: 'Main README and getting started guide' },
  'customization': { path: 'CUSTOMIZATION.md', description: 'CSS customization and theme creation' },
  'contributing': { path: 'CONTRIBUTING.md', description: 'Local setup, testing, and contribution ladder' },
  'security': { path: 'SECURITY.md', description: 'Security architecture, sessions, and cookies' },
  'vision': { path: 'VISION.md', description: 'Project vision, roadmap, and design principles' },
  'changelog': { path: 'CHANGELOG.md', description: 'Release history and version changelog' }
};

function readDoc(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function getSecureSnippets() {
  return [
    {
      id: 'backend-minimal',
      title: 'Minimal Secure Backend Setup',
      language: 'javascript',
      code: `const { createAuthBackend } = require('dimsee/backend');

// Guard against missing secrets
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
if (!process.env.CORS_ORIGIN) throw new Error('CORS_ORIGIN is required');

const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000,
});

app.listen(Number(process.env.PORT) || 5000);`
    },
    {
      id: 'backend-oauth',
      title: 'Backend with Google and GitHub OAuth',
      language: 'javascript',
      code: `const { createAuthBackend } = require('dimsee/backend');

const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
  enableOAuth: true,
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
});`
    },
    {
      id: 'protect-routes',
      title: 'Protect Custom Express API Routes',
      language: 'javascript',
      code: `const { createAuthBackend, authMiddleware } = require('dimsee/backend');
const app = createAuthBackend({ /* ... */ });

// Explicit authMiddleware verification on protected endpoint
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});`
    },
    {
      id: 'frontend-provider',
      title: 'Frontend AuthProvider Setup',
      language: 'jsx',
      code: `import { AuthProvider } from 'dimsee/frontend';

const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

function App() {
  return (
    <AuthProvider apiUrl={API_URL}>
      <AppContent />
    </AuthProvider>
  );
}`
    },
    {
      id: 'frontend-authstatus',
      title: 'AuthStatus Route Guard & State Controller',
      language: 'jsx',
      code: `import { AuthStatus } from 'dimsee/frontend';

function App() {
  return (
    <AuthStatus formDesign="modern" showUserInfo={true}>
      <ProtectedDashboard />
    </AuthStatus>
  );
}`
    }
  ];
}

class DimseeDocsServer {
  constructor() {
    this.serverInfo = {
      name: 'dimsee-docs-mcp',
      version: '1.0.0'
    };
  }

  handleRequest(request) {
    const { id, method, params } = request;

    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              resources: {},
              tools: {}
            },
            serverInfo: this.serverInfo
          }
        };

      case 'notifications/initialized':
        return null;

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: Object.keys(DOC_FILES).map(key => ({
              uri: `dimsee://docs/${key}`,
              name: `${key.toUpperCase()} Documentation`,
              description: DOC_FILES[key].description,
              mimeType: 'text/markdown'
            }))
          }
        };

      case 'resources/read': {
        const uri = params && params.uri;
        const match = uri && uri.match(/^dimsee:\/\/docs\/([a-z0-9_-]+)$/i);
        if (!match || !DOC_FILES[match[1].toLowerCase()]) {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Resource not found: ${uri}` }
          };
        }

        const docKey = match[1].toLowerCase();
        const content = readDoc(DOC_FILES[docKey].path);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: content || ''
              }
            ]
          }
        };
      }

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'search_docs',
                description: 'Search Dimsee documentation files for a keyword or topic.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'The search query or keyword' }
                  },
                  required: ['query']
                }
              },
              {
                name: 'get_snippet',
                description: 'Retrieve a vetted secure code snippet for Dimsee integration.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Snippet identifier (e.g. backend-minimal, backend-oauth, protect-routes, frontend-provider, frontend-authstatus)'
                    }
                  },
                  required: ['id']
                }
              },
              {
                name: 'list_snippets',
                description: 'List all available vetted secure integration snippets.',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              }
            ]
          }
        };

      case 'tools/call': {
        const { name, arguments: args } = params || {};

        if (name === 'list_snippets') {
          const snippets = getSecureSnippets().map(s => ({
            id: s.id,
            title: s.title,
            language: s.language
          }));
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(snippets, null, 2)
                }
              ]
            }
          };
        }

        if (name === 'get_snippet') {
          const snippetId = args && args.id;
          const snippet = getSecureSnippets().find(s => s.id === snippetId);
          if (!snippet) {
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: `Snippet not found: ${snippetId}` }],
                isError: true
              }
            };
          }
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `### ${snippet.title}\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``
                }
              ]
            }
          };
        }

        if (name === 'search_docs') {
          const query = (args && args.query || '').toLowerCase();
          const results = [];

          for (const key of Object.keys(DOC_FILES)) {
            const content = readDoc(DOC_FILES[key].path);
            if (!content) continue;

            const lines = content.split('\n');
            const matchingLines = [];

            lines.forEach((line, lineNum) => {
              if (line.toLowerCase().includes(query)) {
                matchingLines.push({ line: lineNum + 1, text: line.trim() });
              }
            });

            if (matchingLines.length > 0) {
              results.push({
                doc: key,
                file: DOC_FILES[key].path,
                matches: matchingLines.slice(0, 5)
              });
            }
          }

          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2)
                }
              ]
            }
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${name}` }
        };
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` }
        };
    }
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const request = JSON.parse(trimmed);
        const response = this.handleRequest(request);
        if (response) {
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (err) {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: `Parse error: ${err.message}` }
          }) + '\n'
        );
      }
    });
  }
}

if (require.main === module) {
  const server = new DimseeDocsServer();
  server.start();
}

module.exports = DimseeDocsServer;
