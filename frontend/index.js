import AuthProvider from './src/context/AuthContext';
import AuthStatus from './src/components/AuthStatus';
import AuthForm from './src/components/AuthForm';
import LogoutButton from './src/components/LogoutButton';
import useAuth from './src/hooks/useAuth';

// Named exports for granular imports
export { AuthProvider, AuthForm, LogoutButton, useAuth, AuthStatus };

// Default export for a single import
export default {
  AuthProvider,
  AuthForm,
  LogoutButton,
  AuthStatus,
  useAuth
};
