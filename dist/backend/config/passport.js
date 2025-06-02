"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;
var User = require('../models/User');
require('dotenv').config();

// Debug environment variables
console.log('Environment Variables Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not Set');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not Set');
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(/*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(id, done) {
    var user, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return User.findById(id);
        case 1:
          user = _context.v;
          done(null, user);
          _context.n = 3;
          break;
        case 2:
          _context.p = 2;
          _t = _context.v;
          done(_t, null);
        case 3:
          return _context.a(2);
      }
    }, _callee, null, [[0, 2]]);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
var handleOAuthUser = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(profile, provider, done) {
    var email, providerId, user, _profile$displayName, _profile$username, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          email = profile.emails[0].value;
          providerId = "".concat(provider, "Id"); // 'googleId' or 'githubId'
          // First, try to find user by OAuth provider ID
          _context2.n = 1;
          return User.findOne(_defineProperty({}, providerId, profile.id));
        case 1:
          user = _context2.v;
          if (user) {
            _context2.n = 5;
            break;
          }
          _context2.n = 2;
          return User.findOne({
            email: email
          });
        case 2:
          user = _context2.v;
          if (!user) {
            _context2.n = 4;
            break;
          }
          // User exists but hasn't used this OAuth provider before
          // Update their profile with the OAuth provider ID
          user[providerId] = profile.id;
          _context2.n = 3;
          return user.save();
        case 3:
          return _context2.a(2, done(null, user));
        case 4:
          // Create new user if doesn't exist
          user = new User(_defineProperty(_defineProperty(_defineProperty({
            username: ((_profile$displayName = profile.displayName) === null || _profile$displayName === void 0 ? void 0 : _profile$displayName.replace(/\s+/g, '_').toLowerCase()) || ((_profile$username = profile.username) === null || _profile$username === void 0 ? void 0 : _profile$username.toLowerCase()) || email.split('@')[0],
            email: email
          }, providerId, profile.id), "authMethod", provider), "hasPassword", false));
          _context2.n = 5;
          return user.save();
        case 5:
          done(null, user);
          _context2.n = 7;
          break;
        case 6:
          _context2.p = 6;
          _t2 = _context2.v;
          done(_t2, null);
        case 7:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 6]]);
  }));
  return function handleOAuthUser(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();
var configureOAuthStrategies = function configureOAuthStrategies() {
  var _config$google, _config$github;
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Google OAuth Strategy
  if ((_config$google = config.google) !== null && _config$google !== void 0 && _config$google.clientId || process.env.GOOGLE_CLIENT_ID) {
    var _config$google2, _config$google3, _config$google4;
    var googleConfig = {
      clientID: ((_config$google2 = config.google) === null || _config$google2 === void 0 ? void 0 : _config$google2.clientId) || process.env.GOOGLE_CLIENT_ID,
      clientSecret: ((_config$google3 = config.google) === null || _config$google3 === void 0 ? void 0 : _config$google3.clientSecret) || process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: ((_config$google4 = config.google) === null || _config$google4 === void 0 ? void 0 : _config$google4.callbackURL) || "/api/auth/google/callback",
      scope: ['profile', 'email']
    };
    passport.use(new GoogleStrategy(googleConfig, /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(accessToken, refreshToken, profile, done) {
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _context3.n = 1;
              return handleOAuthUser(profile, 'google', done);
            case 1:
              return _context3.a(2);
          }
        }, _callee3);
      }));
      return function (_x6, _x7, _x8, _x9) {
        return _ref3.apply(this, arguments);
      };
    }()));
  } else {
    console.warn('Google OAuth credentials not found. Google sign-in will be disabled.');
  }

  // GitHub OAuth Strategy
  if ((_config$github = config.github) !== null && _config$github !== void 0 && _config$github.clientId || process.env.GITHUB_CLIENT_ID) {
    var _config$github2, _config$github3, _config$github4;
    var githubConfig = {
      clientID: ((_config$github2 = config.github) === null || _config$github2 === void 0 ? void 0 : _config$github2.clientId) || process.env.GITHUB_CLIENT_ID,
      clientSecret: ((_config$github3 = config.github) === null || _config$github3 === void 0 ? void 0 : _config$github3.clientSecret) || process.env.GITHUB_CLIENT_SECRET,
      callbackURL: ((_config$github4 = config.github) === null || _config$github4 === void 0 ? void 0 : _config$github4.callbackURL) || "/api/auth/github/callback",
      scope: ['user:email']
    };
    passport.use(new GitHubStrategy(githubConfig, /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(accessToken, refreshToken, profile, done) {
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              _context4.n = 1;
              return handleOAuthUser(profile, 'github', done);
            case 1:
              return _context4.a(2);
          }
        }, _callee4);
      }));
      return function (_x0, _x1, _x10, _x11) {
        return _ref4.apply(this, arguments);
      };
    }()));
  } else {
    console.warn('GitHub OAuth credentials not found. GitHub sign-in will be disabled.');
  }
};

// Initialize with default configuration
configureOAuthStrategies();

// Export both passport and the configuration function
module.exports = {
  passport: passport,
  configureOAuthStrategies: configureOAuthStrategies
};