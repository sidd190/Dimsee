'use client';

import React from 'react';
import { AuthProvider, AuthStatus, LogoutButton, useAuth } from 'dimsee';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Next.js + Dimsee</h2>
        <LogoutButton design="minimal" />
      </div>
      <p>Logged in as: <strong>{user?.email || user?.username}</strong></p>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider apiUrl="http://localhost:5000/api/auth">
      <AuthStatus formDesign="modern">
        <Dashboard />
      </AuthStatus>
    </AuthProvider>
  );
}
