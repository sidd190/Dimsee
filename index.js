<<<<<<< HEAD
// Root index.js - Universal Entry Point
'use strict';

const backend = require('./backend');

module.exports = {
  ...backend,
  // Frontend components are imported dynamically when using the /frontend subpath
};
=======
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
>>>>>>> 36e4d2f10472aaa87b7d60a021de779f61fbb3e9
