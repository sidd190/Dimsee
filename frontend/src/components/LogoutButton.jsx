import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import './LogoutButton.css';

const LogoutButton = ({ 
  design = 'modern',
  size = 'medium',
  position = 'inline', // 'inline', 'fixed', or custom position object
  
  // Position props (when position is 'fixed')
  positionValues = {
    top: undefined,    // e.g., '20px', '5vh', '10%'
    right: undefined,
    bottom: undefined,
    left: undefined,
    transform: undefined  // e.g., 'translate(-50%, -50%)'
  },
  
  showUserInfo = true,
  onLogout,
  style = {},
  className = ''
}) => {
  const { user, signout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Don't render if user is not authenticated
  if (!user) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signout();
      if (onLogout) onLogout(result);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Calculate container style based on position prop
  const getContainerStyle = () => {
    if (position === 'inline') {
      return { 
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...style 
      };
    }

    if (position === 'fixed') {
      return {
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        ...positionValues,
        ...style
      };
    }

    // If position is a custom object, use it directly
    if (typeof position === 'object') {
      return {
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        ...position,
        ...style
      };
    }

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      ...style
    };
  };

  // Design, size, hover and disabled styles live in LogoutButton.css
  const buttonClasses = [
    'logout-button',
    `design-${design}`,
    `size-${size}`
  ].join(' ');

  const userInfoStyle = {
    fontSize: '14px',
    color: '#6b7280'
  };

  const containerStyle = getContainerStyle();

  return (
    <div 
      className={className}
      style={containerStyle}
    >
      {showUserInfo && (
        <span style={userInfoStyle}>
          {user.username || user.email}
        </span>
      )}
      
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={buttonClasses}
        title={`Sign out ${user.username}`}
      >
        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
};

export default LogoutButton;