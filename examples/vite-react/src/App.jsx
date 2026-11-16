import React from 'react';
import { AuthProvider, AuthForm, AuthStatus, LogoutButton, useAuth } from 'dimsee';

function UserDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user?.username}!</h1>
        <LogoutButton design="modern" />
      </header>
      <main style={{ marginTop: '2rem' }}>
        <p>Your authenticated session is active and secured via HttpOnly cookies.</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider apiUrl="http://localhost:5000/api/auth">
      <AuthStatus
        formDesign="modern"
        loadingComponent={<p>Loading authentication state...</p>}
      >
        <UserDashboard />
      </AuthStatus>
    </AuthProvider>
  );
}
