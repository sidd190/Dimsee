// frontend/hooks/useAuth.js - Auth Hook
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
var useAuth = function useAuth() {
  var context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default useAuth;