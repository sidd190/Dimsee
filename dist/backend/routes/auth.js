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
var generateToken = function generateToken(userId, jwtSecret) {
  return jwt.sign({
    userId: userId
  }, jwtSecret, {
    expiresIn: '7d'
  });
};

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
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req, res) {
    var password, user, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.p = 0;
          password = req.body.password;
          if (!(!password || password.length < 6)) {
            _context.n = 1;
            break;
          }
          return _context.a(2, res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long',
            errors: [{
              field: 'password',
              message: 'Password must be at least 6 characters long'
            }]
          }));
        case 1:
          _context.n = 2;
          return User.findById(req.user.id);
        case 2:
          user = _context.v;
          if (user) {
            _context.n = 3;
            break;
          }
          return _context.a(2, res.status(404).json({
            success: false,
            message: 'User not found'
          }));
        case 3:
          _context.n = 4;
          return user.setPassword(password);
        case 4:
          res.json({
            success: true,
            message: 'Password set successfully'
          });
          _context.n = 6;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
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
          return _context.a(2);
      }
    }, _callee, null, [[0, 5]]);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
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
}), function (req, res) {
  // Generate token for the authenticated user
  var token = generateToken(req.user._id, req.app.locals.authConfig.jwtSecret);

  // Set the token in a cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: req.app.locals.authConfig.cookieMaxAge
  });

  // Redirect to frontend
  res.redirect(req.app.locals.authConfig.corsOrigin);
});

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));
router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/login'
}), function (req, res) {
  // Generate token for the authenticated user
  var token = generateToken(req.user._id, req.app.locals.authConfig.jwtSecret);

  // Set the token in a cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: req.app.locals.authConfig.cookieMaxAge
  });

  // Redirect to frontend
  res.redirect(req.app.locals.authConfig.corsOrigin);
});

// Sign up route
router.post('/signup', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(req, res) {
    var _req$body, username, email, password, errors, existingUser, user, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
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
            _context2.n = 1;
            break;
          }
          return _context2.a(2, res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
          }));
        case 1:
          _context2.n = 2;
          return User.findOne({
            $or: [{
              email: email
            }, {
              username: username
            }]
          });
        case 2:
          existingUser = _context2.v;
          if (!existingUser) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2, res.status(400).json({
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
          _context2.n = 4;
          return user.save();
        case 4:
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
          _context2.n = 6;
          break;
        case 5:
          _context2.p = 5;
          _t2 = _context2.v;
          console.error('Signup error:', _t2);
          res.status(500).json({
            success: false,
            message: 'Error creating user',
            errors: [{
              field: 'general',
              message: 'Internal server error'
            }]
          });
        case 6:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 5]]);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

// Sign in route
router.post('/signin', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        errors: [{
          field: 'general',
          message: 'Internal server error'
        }]
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || 'Invalid credentials',
        errors: [{
          field: 'general',
          message: info.message || 'Invalid credentials'
        }]
      });
    }
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
      res.json({
        success: true,
        message: 'Login successful',
        user: user.toJSON()
      });
    });
  })(req, res, next);
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
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  });
});

// Get current user route
router.get('/me', isAuthenticated, function (req, res) {
  res.json({
    success: true,
    user: req.user.toJSON()
  });
});
module.exports = router;