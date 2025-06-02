<<<<<<< HEAD
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "AuthForm", {
  enumerable: true,
  get: function get() {
    return _AuthForm["default"];
  }
});
Object.defineProperty(exports, "AuthProvider", {
  enumerable: true,
  get: function get() {
    return _AuthContext["default"];
  }
});
Object.defineProperty(exports, "AuthStatus", {
  enumerable: true,
  get: function get() {
    return _AuthStatus["default"];
  }
});
Object.defineProperty(exports, "LogoutButton", {
  enumerable: true,
  get: function get() {
    return _LogoutButton["default"];
  }
});
Object.defineProperty(exports, "useAuth", {
  enumerable: true,
  get: function get() {
    return _useAuth["default"];
  }
});
var _AuthContext = _interopRequireDefault(require("./context/AuthContext"));
var _AuthStatus = _interopRequireDefault(require("./components/AuthStatus"));
var _AuthForm = _interopRequireDefault(require("./components/AuthForm"));
var _LogoutButton = _interopRequireDefault(require("./components/LogoutButton"));
var _useAuth = _interopRequireDefault(require("./hooks/useAuth"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
=======
import React from 'react';
import AuthProvider from './src/context/AuthContext';
import AuthStatus from './src/components/AuthStatus';
import AuthForm from './src/components/AuthForm';
import LogoutButton from './src/components/LogoutButton';
import useAuth from './src/hooks/useAuth';

// Main export for easy import
export { AuthProvider, AuthForm, LogoutButton, useAuth,AuthStatus };

// Default export for single import
export default {
  AuthProvider,
  AuthForm,
  LogoutButton, 
  AuthStatus,
  useAuth
};
>>>>>>> 36e4d2f10472aaa87b7d60a021de779f61fbb3e9
