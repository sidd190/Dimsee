"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// backend/models/User.js - User Model
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function required() {
      return !this.googleId && !this.githubId; // Only required if not using OAuth
    },
    minlength: 6
  },
  googleId: String,
  githubId: String,
  authMethod: {
    type: String,
    "enum": ['local', 'google', 'github'],
    "default": 'local'
  },
  hasPassword: {
    type: Boolean,
    "default": true
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(next) {
    var salt, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          if (!(this.isModified('password') && this.password)) {
            _context.n = 5;
            break;
          }
          _context.p = 1;
          _context.n = 2;
          return bcrypt.genSalt(10);
        case 2:
          salt = _context.v;
          _context.n = 3;
          return bcrypt.hash(this.password, salt);
        case 3:
          this.password = _context.v;
          _context.n = 5;
          break;
        case 4:
          _context.p = 4;
          _t = _context.v;
          return _context.a(2, next(_t));
        case 5:
          next();
        case 6:
          return _context.a(2);
      }
    }, _callee, this, [[1, 4]]);
  }));
  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

// Compare password method
userSchema.methods.comparePassword = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(candidatePassword) {
    var _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          if (this.password) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, false);
        case 1:
          _context2.p = 1;
          _context2.n = 2;
          return bcrypt.compare(candidatePassword, this.password);
        case 2:
          return _context2.a(2, _context2.v);
        case 3:
          _context2.p = 3;
          _t2 = _context2.v;
          throw _t2;
        case 4:
          return _context2.a(2);
      }
    }, _callee2, this, [[1, 3]]);
  }));
  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();

// Method to set password for OAuth users
userSchema.methods.setPassword = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(password) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          this.password = password;
          this.hasPassword = true;
          _context3.n = 1;
          return this.save();
        case 1:
          return _context3.a(2);
      }
    }, _callee3, this);
  }));
  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}();

// Method to check if user can use password login
userSchema.methods.canUsePasswordLogin = function () {
  return this.hasPassword;
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  var user = this.toObject();
  delete user.password;
  return user;
};
var User = mongoose.model('User', userSchema);
module.exports = User;