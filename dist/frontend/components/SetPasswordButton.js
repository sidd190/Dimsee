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
import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import './SetPasswordButton.css';
var SetPasswordButton = function SetPasswordButton(_ref) {
  var _ref$design = _ref.design,
    design = _ref$design === void 0 ? 'modern' : _ref$design,
    _ref$position = _ref.position,
    position = _ref$position === void 0 ? 'inline' : _ref$position,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 'medium' : _ref$size,
    _ref$showPrompt = _ref.showPrompt,
    showPrompt = _ref$showPrompt === void 0 ? true : _ref$showPrompt,
    _ref$positionValues = _ref.positionValues,
    positionValues = _ref$positionValues === void 0 ? {
      top: undefined,
      // e.g., '20px', '5vh', '10%'
      right: undefined,
      bottom: undefined,
      left: undefined,
      transform: undefined // e.g., 'translate(-50%, -50%)'
    } : _ref$positionValues,
    onSuccess = _ref.onSuccess,
    onError = _ref.onError,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var _useAuth = useAuth(),
    user = _useAuth.user,
    setPassword = _useAuth.setPassword;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    showForm = _useState2[0],
    setShowForm = _useState2[1];
  var _useState3 = useState({
      password: '',
      confirmPassword: ''
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    passwordData = _useState4[0],
    setPasswordData = _useState4[1];
  var _useState5 = useState(''),
    _useState6 = _slicedToArray(_useState5, 2),
    passwordError = _useState6[0],
    setPasswordError = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    isSettingPassword = _useState8[0],
    setIsSettingPassword = _useState8[1];

  // Don't render if user has password or no user
  if (!user || user.hasPassword) {
    return null;
  }
  var handlePasswordChange = function handlePasswordChange(e) {
    var _e$target = e.target,
      name = _e$target.name,
      value = _e$target.value;
    setPasswordData(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, value));
    });
    setPasswordError('');
  };
  var handleSetPassword = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var result, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            e.preventDefault();
            if (!(passwordData.password !== passwordData.confirmPassword)) {
              _context.n = 1;
              break;
            }
            setPasswordError('Passwords do not match');
            return _context.a(2);
          case 1:
            if (!(passwordData.password.length < 6)) {
              _context.n = 2;
              break;
            }
            setPasswordError('Password must be at least 6 characters');
            return _context.a(2);
          case 2:
            setIsSettingPassword(true);
            _context.p = 3;
            _context.n = 4;
            return setPassword(passwordData.password);
          case 4:
            result = _context.v;
            if (result.success) {
              setShowForm(false);
              setPasswordData({
                password: '',
                confirmPassword: ''
              });
              if (onSuccess) onSuccess(result);
            } else {
              setPasswordError(result.message);
              if (onError) onError(result);
            }
            _context.n = 6;
            break;
          case 5:
            _context.p = 5;
            _t = _context.v;
            setPasswordError('Failed to set password. Please try again.');
            if (onError) onError({
              success: false,
              message: 'Failed to set password'
            });
          case 6:
            _context.p = 6;
            setIsSettingPassword(false);
            return _context.f(6);
          case 7:
            return _context.a(2);
        }
      }, _callee, null, [[3, 5, 6, 7]]);
    }));
    return function handleSetPassword(_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  // Calculate container style based on position prop
  var getContainerStyle = function getContainerStyle() {
    if (position === 'inline') {
      return _objectSpread({}, style);
    }
    if (position === 'fixed') {
      var positionStyle = _objectSpread({
        position: 'fixed',
        zIndex: 1000
      }, positionValues);
      return _objectSpread(_objectSpread({}, positionStyle), style);
    }

    // If position is a custom object, use it directly
    if (_typeof(position) === 'object') {
      return _objectSpread(_objectSpread({
        position: 'fixed',
        zIndex: 1000
      }, position), style);
    }
    return _objectSpread({}, style);
  };
  var buttonClasses = ['set-password-button', "design-".concat(design), "size-".concat(size), className].filter(Boolean).join(' ');
  var containerStyle = getContainerStyle();
  return /*#__PURE__*/React.createElement("div", {
    className: "set-password-container",
    style: containerStyle
  }, !showForm && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowForm(true);
    },
    className: buttonClasses
  }, /*#__PURE__*/React.createElement("span", {
    className: "button-icon"
  }, "\uD83D\uDD10"), "Set Password"), showForm && /*#__PURE__*/React.createElement("div", {
    className: "set-password-modal design-".concat(design)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", null, "Set Your Password"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowForm(false);
      setPasswordData({
        password: '',
        confirmPassword: ''
      });
      setPasswordError('');
    },
    className: "close-button",
    "aria-label": "Close"
  }, "\xD7")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSetPassword
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "password",
    placeholder: "New Password",
    value: passwordData.password,
    onChange: handlePasswordChange,
    className: "form-input ".concat(passwordError ? 'error' : ''),
    disabled: isSettingPassword
  })), /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "confirmPassword",
    placeholder: "Confirm Password",
    value: passwordData.confirmPassword,
    onChange: handlePasswordChange,
    className: "form-input ".concat(passwordError ? 'error' : ''),
    disabled: isSettingPassword
  })), passwordError && /*#__PURE__*/React.createElement("p", {
    className: "error-message"
  }, /*#__PURE__*/React.createElement("span", {
    className: "error-icon"
  }, "\u26A0\uFE0F"), passwordError), /*#__PURE__*/React.createElement("div", {
    className: "button-group"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: isSettingPassword,
    className: "submit-button"
  }, isSettingPassword ? 'Setting Password...' : 'Set Password')))));
};
export default SetPasswordButton;