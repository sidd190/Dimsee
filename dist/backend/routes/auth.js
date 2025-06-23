"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// backend/routes/auth.js - Authentication Routes
var express = require('express');
var jwt = require('jsonwebtoken');
var _require = require('zod'),
  z = _require.z;
var passport = require('passport');
var User = require('../models/User');
var authMiddleware = require('../middleware/auth');
var router = express.Router();

// Validation schemas
var signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine(function (data) {
  return data.password === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// Generate JWT token
var generateToken = function generateToken(userId, jwtSecret, expiresIn) {
  return jwt.sign({
    userId: userId
  }, jwtSecret, {
    expiresIn: expiresIn
  });
};

//generate refresh token
var generateRefreshToken = function generateRefreshToken(userId, jwtRefreshSecret, expiresIn) {
  return jwt.sign({
    userId: userId
  }, jwtRefreshSecret, {
    expiresIn: expiresIn
  });
};

// Helper function to set authentication cookies
var setAuthCookies = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req, res, user) {
    var _req$app$locals$authC, jwtSecret, jwtExpiry, jwtRefreshSecret, jwtRefreshExpiry, cookieMaxAge, token, refreshToken;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _req$app$locals$authC = req.app.locals.authConfig, jwtSecret = _req$app$locals$authC.jwtSecret, jwtExpiry = _req$app$locals$authC.jwtExpiry, jwtRefreshSecret = _req$app$locals$authC.jwtRefreshSecret, jwtRefreshExpiry = _req$app$locals$authC.jwtRefreshExpiry, cookieMaxAge = _req$app$locals$authC.cookieMaxAge; // Generate tokens
          token = generateToken(user._id, jwtSecret, jwtExpiry);
          refreshToken = generateRefreshToken(user._id, jwtRefreshSecret, jwtRefreshExpiry); // Update user's refresh token in DB
          user.refreshToken = refreshToken;
          _context.n = 1;
          return user.save({
            validateBeforeSave: false
          });
        case 1:
          // Important: set to false if your User model doesn't expect all fields to be present/valid after setting refreshToken

          // Set cookies
          res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
          });
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
          });
        case 2:
          return _context.a(2);
      }
    }, _callee);
  }));
  return function setAuthCookies(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

// Middleware to check if user is authenticated
var isAuthenticated = function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
};

// Set password route for OAuth users
router.post('/set-password', isAuthenticated, /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(req, res) {
    var password, user, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          password = req.body.password;
          if (!(!password || password.length < 6)) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long',
            errors: [{
              field: 'password',
              message: 'Password must be at least 6 characters long'
            }]
          }));
        case 1:
          _context2.n = 2;
          return User.findById(req.user.id);
        case 2:
          user = _context2.v;
          if (user) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2, res.status(404).json({
            success: false,
            message: 'User not found'
          }));
        case 3:
          _context2.n = 4;
          return user.setPassword(password);
        case 4:
          res.json({
            success: true,
            message: 'Password set successfully'
          });
          _context2.n = 6;
          break;
        case 5:
          _context2.p = 5;
          _t = _context2.v;
          console.error('Error setting password:', _t);
          res.status(500).json({
            success: false,
            message: 'Failed to set password',
            errors: [{
              field: 'password',
              message: 'Internal server error'
            }]
          });
        case 6:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 5]]);
  }));
  return function (_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}());

// OAuth status route
router.get('/oauth-status', function (req, res) {
  var enableOAuth = req.app.locals.authConfig.enableOAuth;
  var googleEnabled = enableOAuth && !!process.env.GOOGLE_CLIENT_ID;
  var githubEnabled = enableOAuth && !!process.env.GITHUB_CLIENT_ID;
  res.json({
    enabled: googleEnabled || githubEnabled,
    providers: {
      google: googleEnabled,
      github: githubEnabled
    }
  });
});

// Google OAuth routes
router.get('/google', function (req, res, next) {
  if (!req.app.locals.authConfig.enableOAuth) {
    return res.status(403).json({
      success: false,
      message: 'Google OAuth is not enabled'
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(req, res) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return setAuthCookies(req, res, req.user);
        case 1:
          // Redirect to frontend
          res.redirect(req.app.locals.authConfig.corsOrigin);
        case 2:
          return _context3.a(2);
      }
    }, _callee3);
  }));
  return function (_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}());

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));
router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/login'
}), /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(req, res) {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return setAuthCookies(req, res, req.user);
        case 1:
          // Redirect to frontend
          res.redirect(req.app.locals.authConfig.corsOrigin);
        case 2:
          return _context4.a(2);
      }
    }, _callee4);
  }));
  return function (_x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}());

// Sign up route
router.post('/signup', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(req, res) {
    var _req$body, username, email, password, errors, existingUser, user, _t2;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _context5.p = 0;
          _req$body = req.body, username = _req$body.username, email = _req$body.email, password = _req$body.password; // Validate input
          errors = [];
          if (!username || username.length < 3) {
            errors.push({
              field: 'username',
              message: 'Username must be at least 3 characters long'
            });
          }
          if (!email || !/\S+@\S+\.\S+/.test(email)) {
            errors.push({
              field: 'email',
              message: 'Invalid email address'
            });
          }
          if (!password || password.length < 6) {
            errors.push({
              field: 'password',
              message: 'Password must be at least 6 characters long'
            });
          }
          if (!(errors.length > 0)) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2, res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
          }));
        case 1:
          _context5.n = 2;
          return User.findOne({
            $or: [{
              email: email
            }, {
              username: username
            }]
          });
        case 2:
          existingUser = _context5.v;
          if (!existingUser) {
            _context5.n = 3;
            break;
          }
          return _context5.a(2, res.status(400).json({
            success: false,
            message: 'User already exists',
            errors: [{
              field: 'email',
              message: 'Email is already registered'
            }]
          }));
        case 3:
          // Create new user
          user = new User({
            username: username,
            email: email,
            password: password
          });
          _context5.n = 4;
          return user.save();
        case 4:
          _context5.n = 5;
          return setAuthCookies(req, res, user);
        case 5:
          // Set JWT and refresh tokens
          // Log in the user after signup
          req.login(user, function (err) {
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
          _context5.n = 7;
          break;
        case 6:
          _context5.p = 6;
          _t2 = _context5.v;
          console.error('Signup error:', _t2);
          res.status(500).json({
            success: false,
            message: 'Error creating user',
            errors: [{
              field: 'general',
              message: 'Internal server error'
            }]
          });
        case 7:
          return _context5.a(2);
      }
    }, _callee5, null, [[0, 6]]);
  }));
  return function (_x0, _x1) {
    return _ref5.apply(this, arguments);
  };
}());

// Sign in route
router.post('/signin', function (req, res, next) {
  passport.authenticate('local', /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(err, user, info) {
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            if (!err) {
              _context6.n = 1;
              break;
            }
            return _context6.a(2, res.status(500).json({
              success: false,
              message: 'Authentication error',
              errors: [{
                field: 'general',
                message: 'Internal server error'
              }]
            }));
          case 1:
            if (user) {
              _context6.n = 2;
              break;
            }
            return _context6.a(2, res.status(401).json({
              success: false,
              message: info.message || 'Invalid credentials',
              errors: [{
                field: 'general',
                message: info.message || 'Invalid credentials'
              }]
            }));
          case 2:
            _context6.n = 3;
            return setAuthCookies(req, res, user);
          case 3:
            // Set JWT and refresh tokens
            req.login(user, function (err) {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: 'Login error',
                  errors: [{
                    field: 'general',
                    message: 'Internal server error'
                  }]
                });
              }

              // Generate token for the authenticated user
              var token = generateToken(user._id, req.app.locals.authConfig.jwtSecret);
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
          case 4:
            return _context6.a(2);
        }
      }, _callee6);
    }));
    return function (_x10, _x11, _x12) {
      return _ref6.apply(this, arguments);
    };
  }())(req, res, next);
});

// Sign out route
router.post('/signout', function (req, res) {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error signing out'
      });
    }
    // Clear cookies
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  });
});

// Refresh token route
// This route does NOT require isAuthenticated, as it's meant to obtain new tokens even if the access token has expired.
router.post('/refresh-token', /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(req, res) {
    var _req$cookies;
    var incomingRefreshToken, decodedToken, user, newAccessToken, newRefreshToken, _t3;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          incomingRefreshToken = ((_req$cookies = req.cookies) === null || _req$cookies === void 0 ? void 0 : _req$cookies.refreshToken) || req.body.refreshToken;
          if (incomingRefreshToken) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2, res.status(401).json({
            success: false,
            message: 'Unauthorized Request: Refresh token missing',
            errors: [{
              field: 'general',
              message: 'Unauthorized Request'
            }]
          }));
        case 1:
          _context7.p = 1;
          decodedToken = jwt.verify(incomingRefreshToken, req.app.locals.authConfig.jwtRefreshSecret); // Ensure the payload has userId
          if (!(!decodedToken || !decodedToken.userId)) {
            _context7.n = 2;
            break;
          }
          return _context7.a(2, res.status(401).json({
            success: false,
            message: 'Invalid Refresh Token payload',
            errors: [{
              field: 'general',
              message: 'Invalid Refresh Token'
            }]
          }));
        case 2:
          _context7.n = 3;
          return User.findById(decodedToken.userId);
        case 3:
          user = _context7.v;
          if (user) {
            _context7.n = 4;
            break;
          }
          return _context7.a(2, res.status(401).json({
            success: false,
            message: 'Invalid Refresh Token: User not found',
            errors: [{
              field: 'general',
              message: 'Invalid Refresh Token'
            }]
          }));
        case 4:
          if (!(user.refreshToken !== incomingRefreshToken)) {
            _context7.n = 6;
            break;
          }
          user.refreshToken = null; // Invalidate the stored refresh token to force re-login
          _context7.n = 5;
          return user.save({
            validateBeforeSave: false
          });
        case 5:
          return _context7.a(2, res.status(401).json({
            success: false,
            message: 'Refresh token invalid or reused. Please log in again.',
            errors: [{
              field: 'general',
              message: 'Refresh token invalid or reused.'
            }]
          }));
        case 6:
          // Generate new access and refresh tokens
          newAccessToken = generateToken(user._id, req.app.locals.authConfig.jwtSecret, req.app.locals.authConfig.jwtExpiry);
          newRefreshToken = generateRefreshToken(user._id, req.app.locals.authConfig.jwtRefreshSecret, req.app.locals.authConfig.jwtRefreshExpiry); // Update the user's refresh token in the database with the new one
          user.refreshToken = newRefreshToken;
          _context7.n = 7;
          return user.save({
            validateBeforeSave: false
          });
        case 7:
          // Set the new tokens in cookies
          res.cookie('authToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: req.app.locals.authConfig.cookieMaxAge
          });
          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: req.app.locals.authConfig.cookieMaxAge
          });
          res.json({
            success: true,
            message: 'Tokens refreshed successfully',
            accessToken: newAccessToken // Send new access token in body for client to use immediately
          });
          _context7.n = 9;
          break;
        case 8:
          _context7.p = 8;
          _t3 = _context7.v;
          // Generic error handling 
          res.status(500).json({
            success: false,
            message: 'Failed to refresh token due to server error',
            errors: [{
              field: 'general',
              message: 'Internal server error'
            }]
          });
        case 9:
          return _context7.a(2);
      }
    }, _callee7, null, [[1, 8]]);
  }));
  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());

// Get current user route
router.get('/me', isAuthenticated, function (req, res) {
  res.json({
    success: true,
    user: req.user.toJSON()
  });
});
module.exports = router;