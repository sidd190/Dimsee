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
const magicLinkRoutes = require(path.join(__dirname, 'routes', 'magicLink'));
const authMiddleware = require(path.join(__dirname, 'middleware', 'auth'));
const { passport: passportInstance, configureOAuthStrategies } = require(path.join(__dirname, 'config', 'passport'));
const User = require(path.join(__dirname, 'models', 'User'));
const { EmailService } = require(path.join(__dirname, 'email', 'emailService'));
const { ConsoleTransport } = require(path.join(__dirname, 'email', 'transports', 'console'));

require('dotenv').config();

const createAuthBackend = (config = {}) => {
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
    // ── Magic-link / email options ──────────────────────────────────────────
    // emailTransport: an EmailTransport instance; defaults to ConsoleTransport.
    emailTransport = null,
    // magicLinkTtl: token lifetime in seconds (default 15 minutes).
    magicLinkTtl = 900,
    // magicLinkSuccessPath: frontend path to redirect to after verification.
    magicLinkSuccessPath = '/',
    // appName: shown in the magic-link email body.
    appName = 'Dimsee',
  } = config;

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
  const emailService = new EmailService(emailTransport || new ConsoleTransport());

  app.locals.authConfig = {
    jwtSecret,
    jwtExpiry,
    jwtRefreshSecret,
    jwtRefreshExpiry,
    cookieMaxAge,
    corsOrigin,
    enableOAuth,
    mongoUri,
    // Magic-link settings
    emailService,
    magicLinkTtl,
    magicLinkSuccessPath,
    appName,
  };

  // Auth routes
  app.use('/api/auth', authRoutes);
  app.use('/api/auth/magic-link', magicLinkRoutes);

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

const { audit } = require('./audit');

module.exports = {
  createAuthBackend,
  authMiddleware,
  User,
  audit,
  // Email transport primitives — consumers can import and pass their own.
  EmailService,
  ConsoleTransport,
  SmtpTransport: require('./email/transports/smtp').SmtpTransport,
};
