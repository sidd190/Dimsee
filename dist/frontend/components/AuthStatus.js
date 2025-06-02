function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React from 'react';
import useAuth from '../hooks/useAuth';
import AuthForm from './AuthForm';
import LogoutButton from './LogoutButton';
import SetPasswordButton from './SetPasswordButton';
import './AuthStatus.css';
var AuthStatus = function AuthStatus(_ref) {
  var _ref$showForm = _ref.showForm,
    showForm = _ref$showForm === void 0 ? true : _ref$showForm,
    _ref$formMode = _ref.formMode,
    formMode = _ref$formMode === void 0 ? 'signin' : _ref$formMode,
    _ref$formDesign = _ref.formDesign,
    formDesign = _ref$formDesign === void 0 ? 'modern' : _ref$formDesign,
    _ref$logoutDesign = _ref.logoutDesign,
    logoutDesign = _ref$logoutDesign === void 0 ? 'modern' : _ref$logoutDesign,
    _ref$logoutPosition = _ref.logoutPosition,
    logoutPosition = _ref$logoutPosition === void 0 ? 'inline' : _ref$logoutPosition,
    _ref$logoutPositionVa = _ref.logoutPositionValues,
    logoutPositionValues = _ref$logoutPositionVa === void 0 ? {
      // Used when logoutPosition is 'fixed'
      top: undefined,
      right: undefined,
      bottom: undefined,
      left: undefined,
      transform: undefined
    } : _ref$logoutPositionVa,
    _ref$logoutSize = _ref.logoutSize,
    logoutSize = _ref$logoutSize === void 0 ? 'medium' : _ref$logoutSize,
    _ref$showUserInfo = _ref.showUserInfo,
    showUserInfo = _ref$showUserInfo === void 0 ? true : _ref$showUserInfo,
    _ref$showSetPassword = _ref.showSetPassword,
    showSetPassword = _ref$showSetPassword === void 0 ? false : _ref$showSetPassword,
    _ref$setPasswordDesig = _ref.setPasswordDesign,
    setPasswordDesign = _ref$setPasswordDesig === void 0 ? 'modern' : _ref$setPasswordDesig,
    _ref$setPasswordPosit = _ref.setPasswordPosition,
    setPasswordPosition = _ref$setPasswordPosit === void 0 ? 'inline' : _ref$setPasswordPosit,
    _ref$setPasswordPosit2 = _ref.setPasswordPositionValues,
    setPasswordPositionValues = _ref$setPasswordPosit2 === void 0 ? {
      // Used when setPasswordPosition is 'fixed'
      top: undefined,
      right: undefined,
      bottom: undefined,
      left: undefined,
      transform: undefined
    } : _ref$setPasswordPosit2,
    _ref$setPasswordSize = _ref.setPasswordSize,
    setPasswordSize = _ref$setPasswordSize === void 0 ? 'medium' : _ref$setPasswordSize,
    children = _ref.children,
    loadingComponent = _ref.loadingComponent,
    unauthenticatedComponent = _ref.unauthenticatedComponent,
    onAuthSuccess = _ref.onAuthSuccess,
    onAuthError = _ref.onAuthError,
    onLogout = _ref.onLogout,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var _useAuth = useAuth(),
    user = _useAuth.user,
    loading = _useAuth.loading;
  var loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    color: '#6b7280'
  };

  // Show loading state
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: className,
      style: _objectSpread(_objectSpread({}, loadingStyle), style)
    }, loadingComponent || /*#__PURE__*/React.createElement("div", null, "Loading..."));
  }

  // User is authenticated
  if (user) {
    return /*#__PURE__*/React.createElement("div", {
      className: className,
      style: style
    }, showSetPassword && /*#__PURE__*/React.createElement(SetPasswordButton, {
      design: setPasswordDesign,
      position: setPasswordPosition,
      positionValues: setPasswordPositionValues,
      size: setPasswordSize,
      onSuccess: onAuthSuccess,
      onError: onAuthError
    }), /*#__PURE__*/React.createElement(LogoutButton, {
      design: logoutDesign,
      position: logoutPosition,
      positionValues: logoutPositionValues,
      size: logoutSize,
      showUserInfo: showUserInfo,
      onLogout: onLogout
    }), children);
  }

  // User is not authenticated
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, unauthenticatedComponent || showForm && /*#__PURE__*/React.createElement(AuthForm, {
    mode: formMode,
    design: formDesign,
    onSuccess: onAuthSuccess,
    onError: onAuthError
  }));
};
export default AuthStatus;