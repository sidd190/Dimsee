import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import './AuthForm.css';

const AuthForm = ({ 
  mode = 'signin', 
  design = 'modern', 
  onSuccess,
  onError,
  className = '',
  oAuthConfig = null,
  redirectUrl = null
}) => {
  const { signup, signin, loading, apiUrl } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oAuthStatus, setOAuthStatus] = useState({
    enabled: false,
    providers: {}
  });
  const [oAuthConfigured, setOAuthConfigured] = useState(false);

  useEffect(() => {
    // Use apiUrl from context instead of hardcoded URL
    fetch(`${apiUrl}/oauth-status`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(status => {
        setOAuthStatus(status);
        setOAuthConfigured(true);
      })
      .catch(error => {
        console.error('Failed to fetch OAuth status:', error);
        setOAuthStatus({ enabled: false, providers: {} });
      });
  }, [apiUrl]);

  useEffect(() => {
    // Configure OAuth if custom configuration is provided
    if (oAuthStatus.enabled && oAuthConfig) {
      fetch(`${apiUrl}/configure-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oAuthConfig }),
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          console.error('Failed to configure OAuth:', data.message);
          if (onError) onError(data);
        }
      })
      .catch(error => {
        console.error('OAuth configuration error:', error);
        if (onError) onError({ success: false, message: 'Failed to configure OAuth' });
      });
    }
  }, [oAuthStatus.enabled, oAuthConfig, onError, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const result = mode === 'signup' 
        ? await signup(formData)
        : await signin({ email: formData.email, password: formData.password });

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
          const fieldErrors = {};
          result.errors.forEach(error => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        }
        if (onError) onError(result);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (onError) onError({ success: false, message: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthClick = (provider) => {
    if (!oAuthConfigured || !oAuthStatus.enabled || !oAuthStatus.providers[provider]) {
      console.warn('OAuth is not configured or disabled for this provider');
      return;
    }
    
    // Use apiUrl from context
    window.location.href = `${apiUrl}/${provider}`;
  };

  return (
    <div className={`auth-container ${design} ${className}`}>
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        
        <div className="animal-silhouettes">
          <div className="animal bird-1"></div>
          <div className="animal butterfly-1"></div>
          <div className="animal fish-1"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-header">
          <h2 className="form-title">
            {mode === 'signup' ? 'Join Our Community' : 'Welcome Back'}
          </h2>
          <p className="form-subtitle">
            {mode === 'signup' 
              ? 'Create your account and start your journey' 
              : 'Sign in to continue your adventure'
            }
          </p>
        </div>

        {oAuthStatus.enabled && (
          <div className="oauth-buttons">
            {oAuthStatus.providers.google && (
              <button
                type="button"
                onClick={() => handleOAuthClick('google')}
                className="oauth-button google"
                disabled={!oAuthConfigured}
              >
                <span className="oauth-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                  </svg>
                </span>
                Continue with Google
              </button>
            )}

            {oAuthStatus.providers.github && (
              <button
                type="button"
                onClick={() => handleOAuthClick('github')}
                className="oauth-button github"
                disabled={!oAuthConfigured}
              >
                <span className="oauth-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </span>
                Continue with GitHub
              </button>
            )}
          </div>
        )}

        {oAuthStatus.enabled && (oAuthStatus.providers.google || oAuthStatus.providers.github) && (
          <div className="separator">
            <span>or</span>
          </div>
        )}

        <div className="form-body">
          {mode === 'signup' && (
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                <div className="input-icon">👤</div>
              </div>
              {errors.username && (
                <p className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errors.username}
                </p>
              )}
            </div>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              <div className="input-icon">📧</div>
            </div>
            {errors.email && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.email}
              </p>
            )}
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              <div className="input-icon">🔒</div>
            </div>
            {errors.password && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.password}
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                <div className="input-icon">🔐</div>
              </div>
              {errors.confirmPassword && (
                <p className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="submit-button"
          >
            <span className="button-content">
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Please wait...
                </>
              ) : (
                <>
                  <span className="button-icon">
                    {mode === 'signup' ? '🚀' : '🌟'}
                  </span>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;