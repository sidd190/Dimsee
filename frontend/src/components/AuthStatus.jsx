import React from 'react';
import useAuth from '../hooks/useAuth';
import AuthForm from './AuthForm';
import LogoutButton from './LogoutButton';
import SetPasswordButton from './SetPasswordButton';
import './AuthStatus.css';

const AuthStatus = ({
  // Form props
  showForm = true,
  formMode = 'signin',
  formDesign = 'modern',
  
  // Logout props
  logoutDesign = 'modern',
  logoutPosition = 'inline',  // 'inline', 'fixed', or custom position object
  logoutPositionValues = {    // Used when logoutPosition is 'fixed'
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
    transform: undefined
  },
  logoutSize = 'medium',
  showUserInfo = true,

  // Set Password props
  showSetPassword = false,
  setPasswordDesign = 'modern',
  setPasswordPosition = 'inline',  // 'inline', 'fixed', or custom position object
  setPasswordPositionValues = {    // Used when setPasswordPosition is 'fixed'
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
    transform: undefined
  },
  setPasswordSize = 'medium',
  
  // Custom components
  children, // Custom component to show when authenticated
  loadingComponent, // Custom loading component
  unauthenticatedComponent, // Custom component when not authenticated
  
  // Callbacks
  onAuthSuccess,
  onAuthError,
  onLogout,
  
  // Styling
  style = {},
  className = ''
}) => {
  const { user, loading } = useAuth();

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    color: '#6b7280'
  };

  // Show loading state
  if (loading) {
    return (
      <div className={className} style={{ ...loadingStyle, ...style }}>
        {loadingComponent || <div>Loading...</div>}
      </div>
    );
  }

  // User is authenticated
  if (user) {
    return (
      <div className={className} style={style}>
        {/* Show set password button for OAuth users */}
        {showSetPassword && (
          <SetPasswordButton
            design={setPasswordDesign}
            position={setPasswordPosition}
            positionValues={setPasswordPositionValues}
            size={setPasswordSize}
            onSuccess={onAuthSuccess}
            onError={onAuthError}
          />
        )}

        {/* Always show logout button when authenticated */}
        <LogoutButton
          design={logoutDesign}
          position={logoutPosition}
          positionValues={logoutPositionValues}
          size={logoutSize}
          showUserInfo={showUserInfo}
          onLogout={onLogout}
        />
        
        {/* Show custom authenticated content */}
        {children}
      </div>
    );
  }

  // User is not authenticated
  return (
    <div className={className} style={style}>
      {unauthenticatedComponent || (
        showForm && (
          <AuthForm
            mode={formMode}
            design={formDesign}
            onSuccess={onAuthSuccess}
            onError={onAuthError}
          />
        )
      )}
    </div>
  );
};

export default AuthStatus;
