function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import './AuthForm.css';
var AuthForm = function AuthForm(_ref) {
  var _ref$mode = _ref.mode,
    mode = _ref$mode === void 0 ? 'signin' : _ref$mode,
    _ref$design = _ref.design,
    design = _ref$design === void 0 ? 'modern' : _ref$design,
    onSuccess = _ref.onSuccess,
    onError = _ref.onError,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className,
    _ref$oAuthConfig = _ref.oAuthConfig,
    oAuthConfig = _ref$oAuthConfig === void 0 ? null : _ref$oAuthConfig,
    _ref$redirectUrl = _ref.redirectUrl,
    redirectUrl = _ref$redirectUrl === void 0 ? null : _ref$redirectUrl;
  var _useAuth = useAuth(),
    signup = _useAuth.signup,
    signin = _useAuth.signin,
    loading = _useAuth.loading,
    apiUrl = _useAuth.apiUrl;
  var _useState = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }),
    _useState2 = _slicedToArray(_useState, 2),
    formData = _useState2[0],
    setFormData = _useState2[1];
  var _useState3 = useState({}),
    _useState4 = _slicedToArray(_useState3, 2),
    errors = _useState4[0],
    setErrors = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    isSubmitting = _useState6[0],
    setIsSubmitting = _useState6[1];
  var _useState7 = useState({
      enabled: false,
      providers: {}
    }),
    _useState8 = _slicedToArray(_useState7, 2),
    oAuthStatus = _useState8[0],
    setOAuthStatus = _useState8[1];
  var _useState9 = useState(false),
    _useState0 = _slicedToArray(_useState9, 2),
    oAuthConfigured = _useState0[0],
    setOAuthConfigured = _useState0[1];
  useEffect(function () {
    // Use apiUrl from context instead of hardcoded URL
    fetch("".concat(apiUrl, "/oauth-status"), {
      credentials: 'include'
    }).then(function (res) {
      return res.json();
    }).then(function (status) {
      setOAuthStatus(status);
      setOAuthConfigured(true);
    })["catch"](function (error) {
      console.error('Failed to fetch OAuth status:', error);
      setOAuthStatus({
        enabled: false,
        providers: {}
      });
    });
  }, [apiUrl]);
  useEffect(function () {
    // Configure OAuth if custom configuration is provided
    if (oAuthStatus.enabled && oAuthConfig) {
      fetch("".concat(apiUrl, "/configure-oauth"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oAuthConfig: oAuthConfig
        }),
        credentials: 'include'
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        if (!data.success) {
          console.error('Failed to configure OAuth:', data.message);
          if (onError) onError(data);
        }
      })["catch"](function (error) {
        console.error('OAuth configuration error:', error);
        if (onError) onError({
          success: false,
          message: 'Failed to configure OAuth'
        });
      });
    }
  }, [oAuthStatus.enabled, oAuthConfig, onError, apiUrl]);
  var handleChange = function handleChange(e) {
    var _e$target = e.target,
      name = _e$target.name,
      value = _e$target.value;
    setFormData(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, value));
    });

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, ''));
      });
    }
  };
  var validateForm = function validateForm() {
    var newErrors = {};
    if (mode === 'signup') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  var handleSubmit = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var result, fieldErrors, _t, _t2;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            e.preventDefault();
            if (validateForm()) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            setIsSubmitting(true);
            _context.p = 2;
            if (!(mode === 'signup')) {
              _context.n = 4;
              break;
            }
            _context.n = 3;
            return signup(formData);
          case 3:
            _t = _context.v;
            _context.n = 6;
            break;
          case 4:
            _context.n = 5;
            return signin({
              email: formData.email,
              password: formData.password
            });
          case 5:
            _t = _context.v;
          case 6:
            result = _t;
            if (result.success) {
              if (onSuccess) onSuccess(result);
              // Clear form on success
              setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
              });
            } else {
              if (result.errors) {
                fieldErrors = {};
                result.errors.forEach(function (error) {
                  fieldErrors[error.field] = error.message;
                });
                setErrors(fieldErrors);
              }
              if (onError) onError(result);
            }
            _context.n = 8;
            break;
          case 7:
            _context.p = 7;
            _t2 = _context.v;
            console.error('Form submission error:', _t2);
            if (onError) onError({
              success: false,
              message: 'An unexpected error occurred'
            });
          case 8:
            _context.p = 8;
            setIsSubmitting(false);
            return _context.f(8);
          case 9:
            return _context.a(2);
        }
      }, _callee, null, [[2, 7, 8, 9]]);
    }));
    return function handleSubmit(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var handleOAuthClick = function handleOAuthClick(provider) {
    if (!oAuthConfigured || !oAuthStatus.enabled || !oAuthStatus.providers[provider]) {
      console.warn('OAuth is not configured or disabled for this provider');
      return;
    }

    // Use apiUrl from context
    window.location.href = "".concat(apiUrl, "/").concat(provider);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "auth-container ".concat(design, " ").concat(className)
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-background"
  }, /*#__PURE__*/React.createElement("div", {
    className: "floating-shapes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shape shape-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shape shape-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shape shape-3"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shape shape-4"
  })), /*#__PURE__*/React.createElement("div", {
    className: "animal-silhouettes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "animal bird-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "animal butterfly-1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "animal fish-1"
  }))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "auth-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "form-title"
  }, mode === 'signup' ? 'Join Our Community' : 'Welcome Back'), /*#__PURE__*/React.createElement("p", {
    className: "form-subtitle"
  }, mode === 'signup' ? 'Create your account and start your journey' : 'Sign in to continue your adventure')), oAuthStatus.enabled && /*#__PURE__*/React.createElement("div", {
    className: "oauth-buttons"
  }, oAuthStatus.providers.google && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleOAuthClick('google');
    },
    className: "oauth-button google",
    disabled: !oAuthConfigured
  }, /*#__PURE__*/React.createElement("span", {
    className: "oauth-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
  }))), "Continue with Google"), oAuthStatus.providers.github && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleOAuthClick('github');
    },
    className: "oauth-button github",
    disabled: !oAuthConfigured
  }, /*#__PURE__*/React.createElement("span", {
    className: "oauth-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
  }))), "Continue with GitHub")), oAuthStatus.enabled && (oAuthStatus.providers.google || oAuthStatus.providers.github) && /*#__PURE__*/React.createElement("div", {
    className: "separator"
  }, /*#__PURE__*/React.createElement("span", null, "or")), /*#__PURE__*/React.createElement("div", {
    className: "form-body"
  }, mode === 'signup' && /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "username",
    placeholder: "Username",
    value: formData.username,
    onChange: handleChange,
    className: "form-input ".concat(errors.username ? 'error' : ''),
    disabled: isSubmitting
  }), /*#__PURE__*/React.createElement("div", {
    className: "input-icon"
  }, "\uD83D\uDC64")), errors.username && /*#__PURE__*/React.createElement("p", {
    className: "error-message"
  }, /*#__PURE__*/React.createElement("span", {
    className: "error-icon"
  }, "\u26A0\uFE0F"), errors.username)), /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    placeholder: "Email Address",
    value: formData.email,
    onChange: handleChange,
    className: "form-input ".concat(errors.email ? 'error' : ''),
    disabled: isSubmitting
  }), /*#__PURE__*/React.createElement("div", {
    className: "input-icon"
  }, "\uD83D\uDCE7")), errors.email && /*#__PURE__*/React.createElement("p", {
    className: "error-message"
  }, /*#__PURE__*/React.createElement("span", {
    className: "error-icon"
  }, "\u26A0\uFE0F"), errors.email)), /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "password",
    placeholder: "Password",
    value: formData.password,
    onChange: handleChange,
    className: "form-input ".concat(errors.password ? 'error' : ''),
    disabled: isSubmitting
  }), /*#__PURE__*/React.createElement("div", {
    className: "input-icon"
  }, "\uD83D\uDD12")), errors.password && /*#__PURE__*/React.createElement("p", {
    className: "error-message"
  }, /*#__PURE__*/React.createElement("span", {
    className: "error-icon"
  }, "\u26A0\uFE0F"), errors.password)), mode === 'signup' && /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "confirmPassword",
    placeholder: "Confirm Password",
    value: formData.confirmPassword,
    onChange: handleChange,
    className: "form-input ".concat(errors.confirmPassword ? 'error' : ''),
    disabled: isSubmitting
  }), /*#__PURE__*/React.createElement("div", {
    className: "input-icon"
  }, "\uD83D\uDD10")), errors.confirmPassword && /*#__PURE__*/React.createElement("p", {
    className: "error-message"
  }, /*#__PURE__*/React.createElement("span", {
    className: "error-icon"
  }, "\u26A0\uFE0F"), errors.confirmPassword)), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: isSubmitting || loading,
    className: "submit-button"
  }, /*#__PURE__*/React.createElement("span", {
    className: "button-content"
  }, isSubmitting ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "loading-spinner"
  }), "Please wait...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "button-icon"
  }, mode === 'signup' ? '🚀' : '🌟'), mode === 'signup' ? 'Create Account' : 'Sign In'))))));
};
export default AuthForm;