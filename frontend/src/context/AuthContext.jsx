import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true;

const AuthProvider = ({ children, apiUrl = 'http://localhost:5000/api/auth' }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create axios instance with base URL
  const authAPI = axios.create({
    baseURL: apiUrl,
    withCredentials: true
  });

  const checkAuth = async () => {
    try {
      const response = await authAPI.get('/me');
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.log('Not authenticated');
      localStorage.removeItem('user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check auth state immediately when component mounts
  useEffect(() => {
    const checkAuthState = async () => {
      await checkAuth();
    };
    checkAuthState();
  }, []);

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.post('/signup', userData);
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        errors: error.response?.data?.errors 
      };
    }
  };

  const signin = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.post('/signin', userData);
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signin failed';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        errors: error.response?.data?.errors 
      };
    }
  };

  const signout = async () => {
    try {
      await authAPI.post('/signout');
      setUser(null);
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      // Clear local state even if request fails
      setUser(null);
      localStorage.removeItem('user');
      return { success: false };
    }
  };

  const setPassword = async (password) => {
    try {
      setError(null);
      const response = await authAPI.post('/set-password', { password });
      
      if (response.data.success) {
        // Update user data to reflect that they now have a password
        const updatedUser = { ...user, hasPassword: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to set password';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        errors: error.response?.data?.errors 
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    signin,
    signout,
    setPassword,
    checkAuth,
    apiUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;
