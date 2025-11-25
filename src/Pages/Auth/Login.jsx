import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLogin } from '../../hooks/useApi'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Get auth state and actions
  const { isAuthenticated } = useAuth()
  
  // React Query mutation for login
  const loginMutation = useLogin()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Use React Query mutation
    loginMutation.mutate({
      email: formData.email,
      password: formData.password
    })
  }

  return (
    <div className="h-screen bg-gradient-treegar particles-bg flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto  flex justify-center">
            <img 
              src="/Images/logo.png" 
              alt="Treegar X Corp" 
              className="h-20 w-auto animate-pulse-slow"
            />
          </div>
          
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient-cyan">TREEGAR X </span>
              <span className="text-gradient-purple">CORP</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium tracking-wider">
              THE BACKBONE OF MODERN FINANCE
            </p>
          </div>
        
        </div>

        {/* Login Form */}
        <div className="treegar-card p-8 space-y-6 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  className="input-treegar input-with-icon-left w-full disabled:opacity-50 disabled:cursor-not-allowed relative z-0"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  className="input-treegar input-with-icons-both w-full disabled:opacity-50 disabled:cursor-not-allowed relative z-0"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-500 transition-colors disabled:opacity-50 z-10"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007.022m4.242 4.242L15.536 15.536m0 0l1.414-1.414M15.536 15.536a3 3 0 00.007-.022m0 0L17.95 17.95m-2.414-2.414A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007.022m4.242 4.242L15.536 15.536m0 0l1.414-1.414" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginMutation.isError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-300">
                      {loginMutation.error?.message || 'Login failed. Please try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className={`
                  w-full text-center font-bold tracking-wide transition-all duration-300
                  ${loginMutation.isPending 
                    ? 'bg-dark-700 text-gray-400 cursor-not-allowed px-6 py-3 rounded-lg' 
                    : 'btn-treegar-primary'
                  }
                `}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AUTHENTICATING...
                  </div>
                ) : (
                  'TRANSMIT SIGNAL'
                )}
              </button>
            </div>
          </form>

          {/* Additional Options */}
          <div className="pt-6 border-t border-dark-600">
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input 
                  type="checkbox" 
                  className="mr-2 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                  disabled={loginMutation.isPending}
                />
                Remember me
              </label>
              <a href="#" className="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm">
              Operating in the shadows of global finance
            </p>
            <div className="mt-4 space-x-4 text-xs">
              <a href="#" className="text-primary-500 hover:text-primary-400 transition-colors">
                SIGNAL
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                ORIGINS
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                MACHINERY
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            Treegar X Corp © 2025
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login