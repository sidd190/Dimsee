// backend/index.js - Main Backend Export
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Use path.join for proper path resolution
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const authMiddleware = require(path.join(__dirname, 'middleware', 'auth'));
const { passport: passportInstance, configureOAuthStrategies } = require(path.join(__dirname, 'config', 'passport'));
const User = require(path.join(__dirname, 'models', 'User'));

require('dotenv').config();

const INSECURE_SECRETS = [
  'your-secret-key-change-in-production',
  'your-secret-key',
  'your-jwt-secret',
  'dimsee-dev-access-token-secret-change-in-production',
  'dimsee-dev-refresh-token-secret-change-in-production',
  'secret',
  'changeme'
];

const validateProductionSecrets = (jwtSecret, jwtRefreshSecret) => {
  if (process.env.NODE_ENV === 'production') {
    if (!jwtSecret || INSECURE_SECRETS.includes(jwtSecret)) {
      throw new Error('Dimsee: Insecure default or empty jwtSecret detected in production. You must configure a secure secret.');
    }
    if (!jwtRefreshSecret || INSECURE_SECRETS.includes(jwtRefreshSecret)) {
      throw new Error('Dimsee: Insecure default or empty jwtRefreshSecret detected in production. You must configure a secure secret.');
    }
    if (jwtSecret === jwtRefreshSecret) {
      throw new Error('Dimsee: jwtSecret and jwtRefreshSecret must be distinct to prevent refresh tokens being used as access tokens.');
    }
  }
};

const createAuthBackend = (config = {}) => {
  const { 
    mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-auth',
    jwtSecret = process.env.JWT_SECRET || 'dimsee-dev-access-token-secret-change-in-production',
    jwtExpiry = '15m',
    jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'dimsee-dev-refresh-token-secret-change-in-production',
    jwtRefreshExpiry = '7d',
    corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173',
    cookieMaxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOAuth = false, // OAuth disabled by default
    oauth = {}
  } = config;

  validateProductionSecrets(jwtSecret, jwtRefreshSecret);

  // Connect to MongoDB using mongoUri from props
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

  const app = express();

  // Middleware
  app.use(cors({
    origin: corsOrigin,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: jwtSecret,
    expiry: jwtExpiry,
    refreshSecret: jwtRefreshSecret,
    refreshExpiry: jwtRefreshExpiry,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: cookieMaxAge
    }
  }));

  // Initialize Passport
  app.use(passportInstance.initialize());
  app.use(passportInstance.session());

  // Configure OAuth strategies based on priority
  if (enableOAuth) {
    const oAuthConfig = {
      google: {
        clientId: oauth.google?.clientId || process.env.GOOGLE_CLIENT_ID,
        clientSecret: oauth.google?.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: oauth.google?.callbackURL || process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
      },
      github: {
        clientId: oauth.github?.clientId || process.env.GITHUB_CLIENT_ID,
        clientSecret: oauth.github?.clientSecret || process.env.GITHUB_CLIENT_SECRET,
        callbackURL: oauth.github?.callbackURL || process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback'
      }
    };
    configureOAuthStrategies(oAuthConfig);
  } else {
    // If OAuth is disabled, pass empty config to disable all strategies
    configureOAuthStrategies({});
  }

  // Make config available to routes
  app.locals.authConfig = {
    jwtSecret,
    jwtExpiry,
    jwtRefreshSecret,
    jwtRefreshExpiry,
    cookieMaxAge,
    corsOrigin,
    enableOAuth,
    mongoUri
  };

  // Auth routes
  app.use('/api/auth', authRoutes);

  // Protected route example
  app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
      success: true,
      message: 'Protected route accessed successfully',
      user: req.user
    });
  });

  return app;
};

module.exports = { createAuthBackend, authMiddleware, User };
