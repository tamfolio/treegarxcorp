import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './Pages/Auth/Login'
import Dashboard from './Pages/Dashboard'
import OTPVerification from './Pages/Auth/OtpVerification'
import ForgotPasswordFlow from './Pages/Auth/ForgotPasswordFlow'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth()
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// OTP Route Protection - allows access only when coming from login with 2FA data
const OTPRoute = ({ children }) => {
  const { hasOTPData } = useAuth()
  
  // Check if we have OTP data (either from context or sessionStorage)
  const sessionOTPData = sessionStorage.getItem('otpData')
  const hasValidOTPData = hasOTPData || !!sessionOTPData
  
  if (!hasValidOTPData) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-treegar">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Forgot Password Flow */}
            <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
            
            <Route
              path="/verify"
              element={
                <OTPRoute>
                  <OTPVerification />
                </OTPRoute>
              }
            />
            {/* Dashboard with nested routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Default redirect to transactions */}
              <Route index element={<Navigate to="/dashboard/transactions" replace />} />
              <Route path="transactions" element={null} />
              <Route path="accounts" element={null} />
              <Route path="payouts" element={null} />
              <Route path="users" element={null} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App