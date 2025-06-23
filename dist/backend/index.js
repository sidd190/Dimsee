"use strict";

// backend/index.js - Main Backend Export
var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo');
var path = require('path');

// Use path.join for proper path resolution
var authRoutes = require(path.join(__dirname, 'routes', 'auth'));
var authMiddleware = require(path.join(__dirname, 'middleware', 'auth'));
var _require = require(path.join(__dirname, 'config', 'passport')),
  passportInstance = _require.passport,
  configureOAuthStrategies = _require.configureOAuthStrategies;
var User = require(path.join(__dirname, 'models', 'User'));
require('dotenv').config();
var createAuthBackend = function createAuthBackend() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _config$mongoUri = config.mongoUri,
    mongoUri = _config$mongoUri === void 0 ? 'mongodb://localhost:27017/mern-auth' : _config$mongoUri,
    _config$jwtSecret = config.jwtSecret,
    jwtSecret = _config$jwtSecret === void 0 ? 'your-secret-key-change-in-production' : _config$jwtSecret,
    _config$jwtExpiry = config.jwtExpiry,
    jwtExpiry = _config$jwtExpiry === void 0 ? '15m' : _config$jwtExpiry,
    _config$jwtRefreshSec = config.jwtRefreshSecret,
    jwtRefreshSecret = _config$jwtRefreshSec === void 0 ? 'your-secret-key-change-in-production' : _config$jwtRefreshSec,
    _config$jwtRefreshExp = config.jwtRefreshExpiry,
    jwtRefreshExpiry = _config$jwtRefreshExp === void 0 ? '7d' : _config$jwtRefreshExp,
    _config$corsOrigin = config.corsOrigin,
    corsOrigin = _config$corsOrigin === void 0 ? 'http://localhost:5173' : _config$corsOrigin,
    _config$cookieMaxAge = config.cookieMaxAge,
    cookieMaxAge = _config$cookieMaxAge === void 0 ? 7 * 24 * 60 * 60 * 1000 : _config$cookieMaxAge,
    _config$enableOAuth = config.enableOAuth,
    enableOAuth = _config$enableOAuth === void 0 ? false : _config$enableOAuth,
    _config$oauth = config.oauth,
    oauth = _config$oauth === void 0 ? {} : _config$oauth;

  // Connect to MongoDB using mongoUri from props
  mongoose.connect(mongoUri).then(function () {
    return console.log('✅ MongoDB connected successfully');
  })["catch"](function (err) {
    return console.error('❌ MongoDB connection error:', err);
  });
  var app = express();

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
    var _oauth$google, _oauth$google2, _oauth$google3, _oauth$github, _oauth$github2, _oauth$github3;
    var oAuthConfig = {
      google: {
        clientId: ((_oauth$google = oauth.google) === null || _oauth$google === void 0 ? void 0 : _oauth$google.clientId) || process.env.GOOGLE_CLIENT_ID,
        clientSecret: ((_oauth$google2 = oauth.google) === null || _oauth$google2 === void 0 ? void 0 : _oauth$google2.clientSecret) || process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: ((_oauth$google3 = oauth.google) === null || _oauth$google3 === void 0 ? void 0 : _oauth$google3.callbackURL) || process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
      },
      github: {
        clientId: ((_oauth$github = oauth.github) === null || _oauth$github === void 0 ? void 0 : _oauth$github.clientId) || process.env.GITHUB_CLIENT_ID,
        clientSecret: ((_oauth$github2 = oauth.github) === null || _oauth$github2 === void 0 ? void 0 : _oauth$github2.clientSecret) || process.env.GITHUB_CLIENT_SECRET,
        callbackURL: ((_oauth$github3 = oauth.github) === null || _oauth$github3 === void 0 ? void 0 : _oauth$github3.callbackURL) || process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback'
      }
    };
    configureOAuthStrategies(oAuthConfig);
  } else {
    // If OAuth is disabled, pass empty config to disable all strategies
    configureOAuthStrategies({});
  }

  // Make config available to routes
  app.locals.authConfig = {
    jwtSecret: jwtSecret,
    jwtExpiry: jwtExpiry,
    jwtRefreshSecret: jwtRefreshSecret,
    jwtRefreshExpiry: jwtRefreshExpiry,
    cookieMaxAge: cookieMaxAge,
    corsOrigin: corsOrigin,
    enableOAuth: enableOAuth,
    mongoUri: mongoUri
  };

  // Auth routes
  app.use('/api/auth', authRoutes);

  // Protected route example
  app.get('/api/protected', authMiddleware, function (req, res) {
    res.json({
      success: true,
      message: 'Protected route accessed successfully',
      user: req.user
    });
  });
  return app;
};
module.exports = {
  createAuthBackend: createAuthBackend,
  authMiddleware: authMiddleware,
  User: User
};