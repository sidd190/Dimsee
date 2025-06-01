// Main entry point for the package
const { createAuthBackend, authMiddleware } = require('./backend');

// Re-export everything
module.exports = {
  // Backend exports
  createAuthBackend,
  authMiddleware,
  
  // Frontend exports
  AuthStatus: require('./frontend/src/components/AuthStatus'),
  useAuth: require('./frontend/src/hooks/useAuth'),
  
  // Optional components
  AuthForm: require('./frontend/src/components/AuthForm') // Still available but not the main focus
}; 