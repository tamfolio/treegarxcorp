import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './Pages/Auth/Login'
import Dashboard from './Pages/Dashboard'
import OTPVerification from './Pages/Auth/OtpVerification'
import ForgotPasswordFlow from './Pages/Auth/ForgotPasswordFlow'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth()
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }
  return children
}

const OTPRoute = ({ children }) => {
  const { hasOTPData } = useAuth()
  const sessionOTPData = sessionStorage.getItem('otpData')
  const hasValidOTPData = hasOTPData || !!sessionOTPData
  if (!hasValidOTPData) {
    return <Navigate to="/login" replace />
  }
  return children
}

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-treegar">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
        <Route
          path="/verify"
          element={
            <OTPRoute>
              <OTPVerification />
            </OTPRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/va-transactions" replace />} />
          <Route path="va-transactions" element={null} />
          <Route path="company-transactions" element={null} />
          <Route path="accounts" element={null} />
          <Route path="payouts" element={null} />
          <Route path="business-payouts" element={null} />
          <Route path="company-payouts" element={null} />
          <Route path="company-tokens" element={null} />
          <Route path="users" element={null} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App