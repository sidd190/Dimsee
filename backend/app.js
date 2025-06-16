const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit'); // ✅ Added for brute-force protection
require('dotenv').config();

// Connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dimsee')
  .then(() => {
    console.log('Connected to MongoDB');

    const app = express();

    // Import routes
    const authRoutes = require('./routes/auth');

    // Import passport config
    const { passport, configureOAuthStrategies } = require('./config/passport');

    // Middleware
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }));

    // ✅ Rate Limiting on /signin and /signup (Fix for Bug #2)
    const authLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5,
      message: { success: false, message: 'Too many attempts. Please try again later.' }
    });
    app.use('/api/auth/signin', authLimiter);
    app.use('/api/auth/signup', authLimiter);

    // Session configuration
    app.use(session({
      // ❗ Kept insecure fallback as requested (Bug #1 not fixed)
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
      // ❗ Kept insecure fallback as requested (Bug #1 not fixed)
      jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
      cookieMaxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    // Configure OAuth with custom credentials if provided
    app.post('/api/auth/configure-oauth', (req, res) => {
      try {
        const { oAuthConfig } = req.body;
        if (oAuthConfig) {
          configureOAuthStrategies(oAuthConfig);
        }
        res.json({ success: true, message: 'OAuth configuration updated' });
      } catch (error) {
        console.error('OAuth configuration error:', error);
        res.status(500).json({ success: false, message: 'Failed to update OAuth configuration' });
      }
    });

    // Routes
    app.use('/api/auth', authRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process on connection failure
  });

module.exports = {}; // Export empty object as app is initialized async
