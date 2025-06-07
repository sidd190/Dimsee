import React from 'react'
import AuthStatus from '../../../frontend/src/components/AuthStatus'
import AuthProvider from '../../../frontend/src/context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AuthStatus formDesign='colorful'>
      
      </AuthStatus>
    </AuthProvider>
  )
}

export default App