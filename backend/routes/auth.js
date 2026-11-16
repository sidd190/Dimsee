// backend/routes/auth.js - Authentication Routes
const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Validation schemas
const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(passwordComplexityRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const setPasswordSchema = z.object({
  password: passwordSchema
});

const signinSchema = z.object({
  // Existing accounts may use addresses accepted by the earlier signup rules.
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'general',
        message: issue.message
      }))
    });
  }
  req.body = result.data;
  next();
};

// Resolve relative paths against the frontend and reject external destinations.
const resolveOAuthRedirect = (value, frontendUrl) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const frontend = new URL(frontendUrl);
    const target = new URL(value, frontend);
    if (!['http:', 'https:'].includes(target.protocol) ||
        target.origin !== frontend.origin || target.username || target.password) {
      return null;
    }
    return target.href;
  } catch {
    return null;
  }
};

const startOAuth = (provider, scope) => (req, res, next) => {
  if (!req.app.locals.authConfig.enableOAuth) {
    return res.status(403).json({ success: false, message: 'OAuth is not enabled' });
  }
  const redirect = resolveOAuthRedirect(req.query.redirectUrl, req.app.locals.authConfig.corsOrigin);
  if (req.query.redirectUrl !== undefined && !redirect) {
    return res.status(400).json({ success: false, message: 'Invalid OAuth redirect URL' });
  }
  if (!req.session) return next(new Error('OAuth requires session middleware'));
  req.session.oauthRedirects = { ...req.session.oauthRedirects, [provider]: redirect };
  passport.authenticate(provider, { scope })(req, res, next);
};

// Capture the destination before Passport regenerates the session on login.
const takeOAuthRedirect = (provider) => (req, res, next) => {
  res.locals.oauthRedirect = req.session?.oauthRedirects?.[provider];
  if (req.session?.oauthRedirects) delete req.session.oauthRedirects[provider];
  next();
};

const finishOAuth = async (req, res, next) => {
  try {
    await setAuthCookies(req, res, req.user);
    res.redirect(resolveOAuthRedirect(res.locals.oauthRedirect, req.app.locals.authConfig.corsOrigin) ||
      req.app.locals.authConfig.corsOrigin);
  } catch (error) {
    next(error);
  }
};

// Generate JWT token
const generateToken = (userId, jwtSecret,expiresIn) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn });
};

//generate refresh token
const generateRefreshToken = (userId, jwtRefreshSecret,expiresIn) => {
  return jwt.sign({userId},jwtRefreshSecret,{expiresIn});
}

// Centralised cookie options so every auth cookie gets the same flags.
const isProduction = () => process.env.NODE_ENV === 'production';
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'strict' : 'lax',
  ...(maxAge !== undefined && { maxAge })
});

// Helper function to set authentication cookies
const setAuthCookies = async (req, res, user) => {
  const { jwtSecret, jwtExpiry, jwtRefreshSecret, jwtRefreshExpiry, cookieMaxAge } = req.app.locals.authConfig;

  const jwtExpiryFallback = jwtExpiry || '15m';
  const jwtRefreshExpiryFallback = jwtRefreshExpiry || '7d';

  // Generate tokens
  const token = generateToken(user._id, jwtSecret, jwtExpiryFallback);
  const refreshToken = generateRefreshToken(user._id, jwtRefreshSecret, jwtRefreshExpiryFallback);

  // Update user's refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false }); // Important: set to false if your User model doesn't expect all fields to be present/valid after setting refreshToken

  // Set cookies
  res.cookie('authToken', token, getCookieOptions(cookieMaxAge));
  res.cookie('refreshToken', refreshToken, getCookieOptions(cookieMaxAge));
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Set password route for OAuth users
router.post('/set-password', isAuthenticated, validateBody(setPasswordSchema), async (req, res) => {
  try {
    const { password } = req.body;

    // Get the current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set the password and revoke prior refresh tokens
    await user.setPassword(password);

    // Rotate tokens: generate and set fresh auth and refresh cookies for the user
    await setAuthCookies(req, res, user);

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
router.get('/google', startOAuth('google', ['profile', 'email']));

router.get('/google/callback',
  takeOAuthRedirect('google'),
  passport.authenticate('google', { failureRedirect: '/login' }),
  finishOAuth
);

// GitHub OAuth routes
router.get('/github',
  startOAuth('github', ['user:email'])
);

router.get('/github/callback',
  takeOAuthRedirect('github'),
  passport.authenticate('github', { failureRedirect: '/login' }),
  finishOAuth
);

// Sign up route
router.post('/signup', validateBody(signupSchema), async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
    await setAuthCookies(req, res, user); // Set JWT and refresh tokens
    // Log in the user after signup
    req.login(user, (err) => {
      if (err) {
        console.error('Login error after signup:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging in after signup'
        });
      }

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
router.post('/signin', validateBody(signinSchema), (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
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
    await setAuthCookies(req, res, user); // Set JWT and refresh tokens
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Login error',
          errors: [{ field: 'general', message: 'Internal server error' }]
        });
      }

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
    // Clear cookies
    res.clearCookie('authToken', getCookieOptions());
    res.clearCookie('refreshToken', getCookieOptions());
    
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  });
});

// Refresh token route
// This route does NOT require isAuthenticated, as it's meant to obtain new tokens even if the access token has expired.
router.post('/refresh-token', async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized Request: Refresh token missing',
      errors: [{ field: 'general', message: 'Unauthorized Request' }]
    });
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, req.app.locals.authConfig.jwtRefreshSecret);

    // Ensure the payload has userId
    if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Refresh Token payload',
            errors: [{ field: 'general', message: 'Invalid Refresh Token' }]
        });
    }

    const user = await User.findById(decodedToken.userId); 

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Refresh Token: User not found',
        errors: [{ field: 'general', message: 'Invalid Refresh Token' }]
      });
    }

    // Refresh token rotation with reuse detection 
    if (user.refreshToken !== incomingRefreshToken) {
        user.refreshToken = null; // Invalidate the stored refresh token to force re-login
        await user.save({ validateBeforeSave: false }); 
        return res.status(401).json({
            success: false,
            message: 'Refresh token invalid or reused. Please log in again.',
            errors: [{ field: 'general', message: 'Refresh token invalid or reused.' }]
        });
    }

    // Generate new access and refresh tokens
    const newAccessToken = generateToken(user._id, req.app.locals.authConfig.jwtSecret, req.app.locals.authConfig.jwtExpiry || '15m');
    const newRefreshToken = generateRefreshToken(user._id, req.app.locals.authConfig.jwtRefreshSecret, req.app.locals.authConfig.jwtRefreshExpiry || '7d');

    // Update the user's refresh token in the database with the new one
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // Set the new tokens in cookies
    const { cookieMaxAge } = req.app.locals.authConfig;
    res.cookie('authToken', newAccessToken, getCookieOptions(cookieMaxAge));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(cookieMaxAge));

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      accessToken: newAccessToken // Send new access token in body for client to use immediately
    });

  } catch (error) {
    // Generic error handling 
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token due to server error',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

// Get current user route
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: req.user.toJSON()
  });
});

module.exports = router;
