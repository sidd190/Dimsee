"use strict";

var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo');
require('dotenv').config();

// Connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dimsee').then(function () {
  console.log('Connected to MongoDB');
  var app = express();

  // Import routes
  var authRoutes = require('./routes/auth');

  // Import passport config
  var _require = require('./config/passport'),
    passport = _require.passport,
    configureOAuthStrategies = _require.configureOAuthStrategies;

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/dimsee',
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  }));

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Auth configuration
  app.locals.authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  // Configure OAuth with custom credentials if provided
  app.post('/api/auth/configure-oauth', function (req, res) {
    try {
      var oAuthConfig = req.body.oAuthConfig;
      if (oAuthConfig) {
        configureOAuthStrategies(oAuthConfig);
      }
      res.json({
        success: true,
        message: 'OAuth configuration updated'
      });
    } catch (error) {
      console.error('OAuth configuration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update OAuth configuration'
      });
    }
  });

  // Routes
  app.use('/api/auth', authRoutes);

  // Error handling middleware
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });
  var PORT = process.env.PORT || 5000;
  app.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
  });
})["catch"](function (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit process on connection failure
});
module.exports = {}; // Export empty object as app is initialized async