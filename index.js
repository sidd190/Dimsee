// Root index.js - Universal Entry Point
'use strict';

const backend = require('./backend');

// Backend exports
const { createAuthBackend, authMiddleware } = backend;

// Frontend exports
const AuthStatus = require('./frontend/src/components/AuthStatus');
const useAuth = require('./frontend/src/hooks/useAuth');
const AuthForm = require('./frontend/src/components/AuthForm');

module.exports = {
  // Backend
  createAuthBackend,
  authMiddleware,
  // Frontend
  AuthStatus,
  useAuth,
  // Optional components
  AuthForm // Still available but not the main focus
};
