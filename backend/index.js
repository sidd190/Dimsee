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
const { applyPreset, PROTOTYPE_WARNING_BANNER } = require(path.join(__dirname, 'presets'));

require('dotenv').config();

const createAuthBackend = (rawConfig = {}) => {
  const { config, preset, warnings } = applyPreset(rawConfig);

  const { 
    mongoUri = 'mongodb://localhost:27017/mern-auth',
    jwtSecret = 'your-secret-key-change-in-production',
    jwtExpiry = '15m',
    jwtRefreshSecret = 'your-secret-key-change-in-production',
    jwtRefreshExpiry = '7d',
    corsOrigin = 'http://localhost:5173',
    cookieMaxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    enableOAuth = false, // OAuth disabled by default
    oauth = {},
    useMemorySession = false,
    connectMongo = true
  } = config;

  // Connect to MongoDB using mongoUri from props
  if (connectMongo !== false) {
    mongoose.connect(mongoUri)
      .then(() => {
        if (preset !== 'prototype') {
          console.log('MongoDB connected successfully');
        }
      })
      .catch(err => {
        if (preset === 'prototype') {
          console.warn('[DIMSEE PROTOTYPE] MongoDB connection failed or offline; prototype running with local fallback.');
        } else {
          console.error('MongoDB connection error:', err);
        }
      });
  }

  const app = express();

  // Middleware
  app.use(cors({
    origin: corsOrigin,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Session storage: in prototype preset, useMemorySession defaults to true (in-process)
  let sessionStore;
  if (!useMemorySession) {
    sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions'
    });
  }

  app.use(session({
    secret: jwtSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // In-memory MemoryStore if sessionStore is undefined
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

  // Make config available to routes and callers
  app.locals.authConfig = {
    preset,
    jwtSecret,
    jwtExpiry,
    jwtRefreshSecret,
    jwtRefreshExpiry,
    cookieMaxAge,
    corsOrigin,
    enableOAuth,
    mongoUri,
    warnings
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

module.exports = { createAuthBackend, authMiddleware, User, applyPreset, PROTOTYPE_WARNING_BANNER };
