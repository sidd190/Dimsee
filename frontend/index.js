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