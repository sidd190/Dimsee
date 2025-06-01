import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import './SetPasswordButton.css';

const SetPasswordButton = ({
  // Button props
  design = 'modern',
  position = 'inline',  // 'inline', 'fixed', or custom position object
  size = 'medium',
  showPrompt = true,
  
  // Position props (when position is 'fixed')
  positionValues = {
    top: undefined,    // e.g., '20px', '5vh', '10%'
    right: undefined,
    bottom: undefined,
    left: undefined,
    transform: undefined  // e.g., 'translate(-50%, -50%)'
  },
  
  // Callbacks
  onSuccess,
  onError,
  
  // Styling
  style = {},
  className = ''
}) => {
  const { user, setPassword } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Don't render if user has password or no user
  if (!user || user.hasPassword) {
    return null;
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsSettingPassword(true);
    try {
      const result = await setPassword(passwordData.password);
      if (result.success) {
        setShowForm(false);
        setPasswordData({ password: '', confirmPassword: '' });
        if (onSuccess) onSuccess(result);
      } else {
        setPasswordError(result.message);
        if (onError) onError(result);
      }
    } catch (error) {
      setPasswordError('Failed to set password. Please try again.');
      if (onError) onError({ success: false, message: 'Failed to set password' });
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Calculate container style based on position prop
  const getContainerStyle = () => {
    if (position === 'inline') {
      return { ...style };
    }

    if (position === 'fixed') {
      const positionStyle = {
        position: 'fixed',
        zIndex: 1000,
        ...positionValues
      };
      return { ...positionStyle, ...style };
    }

    // If position is a custom object, use it directly
    if (typeof position === 'object') {
      return {
        position: 'fixed',
        zIndex: 1000,
        ...position,
        ...style
      };
    }

    return { ...style };
  };

  const buttonClasses = [
    'set-password-button',
    `design-${design}`,
    `size-${size}`,
    className
  ].filter(Boolean).join(' ');

  const containerStyle = getContainerStyle();

  return (
    <div className="set-password-container" style={containerStyle}>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className={buttonClasses}
        >
          <span className="button-icon">🔐</span>
          Set Password
        </button>
      )}

      {showForm && (
        <div className={`set-password-modal design-${design}`}>
          <div className="modal-header">
            <h3>Set Your Password</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setPasswordData({ password: '', confirmPassword: '' });
                setPasswordError('');
              }}
              className="close-button"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSetPassword}>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                className={`form-input ${passwordError ? 'error' : ''}`}
                disabled={isSettingPassword}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`form-input ${passwordError ? 'error' : ''}`}
                disabled={isSettingPassword}
              />
            </div>
            {passwordError && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {passwordError}
              </p>
            )}
            <div className="button-group">
              <button
                type="submit"
                disabled={isSettingPassword}
                className="submit-button"
              >
                {isSettingPassword ? 'Setting Password...' : 'Set Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SetPasswordButton; 