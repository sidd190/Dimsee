import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';

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

  // Design styles
  const getButtonStyle = () => {
    const baseButtonStyle = {
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontFamily: 'inherit'
    };

    const sizes = {
      small: { padding: '6px 12px', fontSize: '14px' },
      medium: { padding: '8px 16px', fontSize: '16px' },
      large: { padding: '12px 24px', fontSize: '18px' }
    };

    const designs = {
      modern: {
        backgroundColor: '#dc2626',
        color: 'white',
        ':hover': {
          backgroundColor: '#b91c1c'
        },
        ':disabled': {
          backgroundColor: '#fca5a5',
          cursor: 'not-allowed'
        }
      },
      minimal: {
        backgroundColor: '#e5e7eb',
        color: '#374151',
        ':hover': {
          backgroundColor: '#d1d5db'
        },
        ':disabled': {
          backgroundColor: '#f3f4f6',
          cursor: 'not-allowed'
        }
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#dc2626',
        border: '2px solid #dc2626',
        ':hover': {
          backgroundColor: '#dc2626',
          color: 'white'
        },
        ':disabled': {
          borderColor: '#fca5a5',
          color: '#fca5a5',
          cursor: 'not-allowed'
        }
      },
      rounded: {
        backgroundColor: '#dc2626',
        color: 'white',
        borderRadius: '50px',
        ':hover': {
          backgroundColor: '#b91c1c'
        },
        ':disabled': {
          backgroundColor: '#fca5a5',
          cursor: 'not-allowed'
        }
      }
    };

    const userInfoStyle = {
      fontSize: '14px',
      color: '#6b7280'
    };

    return { 
      buttonStyle: {
        ...baseButtonStyle,
        ...sizes[size],
        ...designs[design]
      },
      userInfoStyle 
    };
  };

  const { buttonStyle, userInfoStyle } = getButtonStyle();
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
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={buttonStyle}
        title={`Sign out ${user.username}`}
        onMouseEnter={(e) => {
          if (!isLoggingOut) {
            const design = getButtonStyle().buttonStyle;
            if (design[':hover']) {
              Object.assign(e.target.style, design[':hover']);
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoggingOut) {
            const design = getButtonStyle().buttonStyle;
            e.target.style.backgroundColor = design.backgroundColor;
            e.target.style.color = design.color;
          }
        }}
      >
        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
};

export default LogoutButton;