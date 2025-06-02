function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
var AuthContext = /*#__PURE__*/createContext();

// Configure axios defaults
axios.defaults.withCredentials = true;
var AuthProvider = function AuthProvider(_ref) {
  var children = _ref.children,
    _ref$apiUrl = _ref.apiUrl,
    apiUrl = _ref$apiUrl === void 0 ? 'http://localhost:5000/api/auth' : _ref$apiUrl;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    user = _useState2[0],
    setUser = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    error = _useState6[0],
    setError = _useState6[1];

  // Create axios instance with base URL
  var authAPI = axios.create({
    baseURL: apiUrl,
    withCredentials: true
  });
  var checkAuth = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var response, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.p = 0;
            _context.n = 1;
            return authAPI.get('/me');
          case 1:
            response = _context.v;
            if (!response.data.success) {
              _context.n = 2;
              break;
            }
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return _context.a(2, true);
          case 2:
            return _context.a(2, false);
          case 3:
            _context.p = 3;
            _t = _context.v;
            console.log('Not authenticated');
            localStorage.removeItem('user');
            return _context.a(2, false);
          case 4:
            _context.p = 4;
            setLoading(false);
            return _context.f(4);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[0, 3, 4, 5]]);
    }));
    return function checkAuth() {
      return _ref2.apply(this, arguments);
    };
  }();

  // Check auth state immediately when component mounts
  useEffect(function () {
    var checkAuthState = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return checkAuth();
            case 1:
              return _context2.a(2);
          }
        }, _callee2);
      }));
      return function checkAuthState() {
        return _ref3.apply(this, arguments);
      };
    }();
    checkAuthState();
  }, []);
  var signup = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(userData) {
      var response, _error$response, _error$response2, errorMessage, _t2;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            _context3.p = 0;
            setError(null);
            _context3.n = 1;
            return authAPI.post('/signup', userData);
          case 1:
            response = _context3.v;
            if (!response.data.success) {
              _context3.n = 2;
              break;
            }
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return _context3.a(2, {
              success: true,
              message: response.data.message
            });
          case 2:
            _context3.n = 4;
            break;
          case 3:
            _context3.p = 3;
            _t2 = _context3.v;
            errorMessage = ((_error$response = _t2.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || 'Signup failed';
            setError(errorMessage);
            return _context3.a(2, {
              success: false,
              message: errorMessage,
              errors: (_error$response2 = _t2.response) === null || _error$response2 === void 0 || (_error$response2 = _error$response2.data) === null || _error$response2 === void 0 ? void 0 : _error$response2.errors
            });
        }
      }, _callee3, null, [[0, 3]]);
    }));
    return function signup(_x) {
      return _ref4.apply(this, arguments);
    };
  }();
  var signin = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(userData) {
      var response, _error$response3, _error$response4, errorMessage, _t3;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            _context4.p = 0;
            setError(null);
            _context4.n = 1;
            return authAPI.post('/signin', userData);
          case 1:
            response = _context4.v;
            if (!response.data.success) {
              _context4.n = 2;
              break;
            }
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return _context4.a(2, {
              success: true,
              message: response.data.message
            });
          case 2:
            _context4.n = 4;
            break;
          case 3:
            _context4.p = 3;
            _t3 = _context4.v;
            errorMessage = ((_error$response3 = _t3.response) === null || _error$response3 === void 0 || (_error$response3 = _error$response3.data) === null || _error$response3 === void 0 ? void 0 : _error$response3.message) || 'Signin failed';
            setError(errorMessage);
            return _context4.a(2, {
              success: false,
              message: errorMessage,
              errors: (_error$response4 = _t3.response) === null || _error$response4 === void 0 || (_error$response4 = _error$response4.data) === null || _error$response4 === void 0 ? void 0 : _error$response4.errors
            });
        }
      }, _callee4, null, [[0, 3]]);
    }));
    return function signin(_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
  var signout = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
      var _t4;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            _context5.p = 0;
            _context5.n = 1;
            return authAPI.post('/signout');
          case 1:
            setUser(null);
            localStorage.removeItem('user');
            return _context5.a(2, {
              success: true
            });
          case 2:
            _context5.p = 2;
            _t4 = _context5.v;
            console.error('Signout error:', _t4);
            // Clear local state even if request fails
            setUser(null);
            localStorage.removeItem('user');
            return _context5.a(2, {
              success: false
            });
        }
      }, _callee5, null, [[0, 2]]);
    }));
    return function signout() {
      return _ref6.apply(this, arguments);
    };
  }();
  var setPassword = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(password) {
      var response, updatedUser, _error$response5, _error$response6, errorMessage, _t5;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            _context6.p = 0;
            setError(null);
            _context6.n = 1;
            return authAPI.post('/set-password', {
              password: password
            });
          case 1:
            response = _context6.v;
            if (!response.data.success) {
              _context6.n = 2;
              break;
            }
            // Update user data to reflect that they now have a password
            updatedUser = _objectSpread(_objectSpread({}, user), {}, {
              hasPassword: true
            });
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return _context6.a(2, {
              success: true,
              message: response.data.message
            });
          case 2:
            _context6.n = 4;
            break;
          case 3:
            _context6.p = 3;
            _t5 = _context6.v;
            errorMessage = ((_error$response5 = _t5.response) === null || _error$response5 === void 0 || (_error$response5 = _error$response5.data) === null || _error$response5 === void 0 ? void 0 : _error$response5.message) || 'Failed to set password';
            setError(errorMessage);
            return _context6.a(2, {
              success: false,
              message: errorMessage,
              errors: (_error$response6 = _t5.response) === null || _error$response6 === void 0 || (_error$response6 = _error$response6.data) === null || _error$response6 === void 0 ? void 0 : _error$response6.errors
            });
        }
      }, _callee6, null, [[0, 3]]);
    }));
    return function setPassword(_x3) {
      return _ref7.apply(this, arguments);
    };
  }();
  var value = {
    user: user,
    loading: loading,
    error: error,
    signup: signup,
    signin: signin,
    signout: signout,
    setPassword: setPassword,
    checkAuth: checkAuth,
    apiUrl: apiUrl
  };
  return /*#__PURE__*/React.createElement(AuthContext.Provider, {
    value: value
  }, children);
};
export { AuthContext };
export default AuthProvider;