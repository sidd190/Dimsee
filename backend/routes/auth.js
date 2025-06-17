// backend/routes/auth.js - Authentication Routes
const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const passport = require('passport');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// Generate JWT token
const generateToken = (userId, jwtSecret) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Set password route for OAuth users
router.post('/set-password', isAuthenticated, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        errors: [{ field: 'password', message: 'Password must be at least 6 characters long' }]
      });
    }

    // Get the current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set the password
    await user.setPassword(password);

    res.json({
      success: true,
      message: 'Password set successfully'
    });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set password',
      errors: [{ field: 'password', message: 'Internal server error' }]
    });
  }
});

// OAuth status route
router.get('/oauth-status', (req, res) => {
  const { enableOAuth } = req.app.locals.authConfig;
  const googleEnabled = enableOAuth && !!process.env.GOOGLE_CLIENT_ID;
  const githubEnabled = enableOAuth && !!process.env.GITHUB_CLIENT_ID;

  res.json({
    enabled: googleEnabled || githubEnabled,
    providers: {
      google: googleEnabled,
      github: githubEnabled,
    },
  });
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!req.app.locals.authConfig.enableOAuth) {
    return res.status(403).json({
      success: false,
      message: 'Google OAuth is not enabled'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate token for the authenticated user
    const token = generateToken(req.user._id, req.app.locals.authConfig.jwtSecret);
    
    // Set the token in a cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: req.app.locals.authConfig.cookieMaxAge
    });

    // Redirect to frontend
    res.redirect(req.app.locals.authConfig.corsOrigin);
  }
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate token for the authenticated user
    const token = generateToken(req.user._id, req.app.locals.authConfig.jwtSecret);
    
    // Set the token in a cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: req.app.locals.authConfig.cookieMaxAge
    });

    // Redirect to frontend
    res.redirect(req.app.locals.authConfig.corsOrigin);
  }
);

// Sign up route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    const errors = [];
    if (!username || username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email address' });
    }
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        errors: [
          { field: 'email', message: 'Email is already registered' }
        ]
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Log in the user after signup
    req.login(user, (err) => {
      if (err) {
        console.error('Login error after signup:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging in after signup'
        });
      }

      // Generate token for the authenticated user
      const token = generateToken(user._id, req.app.locals.authConfig.jwtSecret);
      // Set the token in a cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: req.app.locals.authConfig.cookieMaxAge
      });

      res.json({
        success: true,
        message: 'Signup successful',
        user: user.toJSON()
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

// Sign in route
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        errors: [{ field: 'general', message: 'Internal server error' }]
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || 'Invalid credentials',
        errors: [{ field: 'general', message: info.message || 'Invalid credentials' }]
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Login error',
          errors: [{ field: 'general', message: 'Internal server error' }]
        });
      }

      // Generate token for the authenticated user
      const token = generateToken(user._id, req.app.locals.authConfig.jwtSecret);
      // Set the token in a cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: req.app.locals.authConfig.cookieMaxAge
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: user.toJSON()
      });
    });
  })(req, res, next);
});

// Sign out route
router.post('/signout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error signing out'
      });
    }
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  });
});

// Get current user route
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: req.user.toJSON()
  });
});

module.exports = router;
