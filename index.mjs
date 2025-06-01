// ES Module entry point
export { createAuthBackend, authMiddleware } from './backend/index.js';
export { default as AuthStatus } from './frontend/src/components/AuthStatus';
export { default as useAuth } from './frontend/src/hooks/useAuth';
export { default as AuthForm } from './frontend/src/components/AuthForm'; 