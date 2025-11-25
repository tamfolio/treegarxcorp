import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useVerify2FA, useResendOTP, useOTPData, useOTPTimer } from '../../hooks/useApi'
import otpService from '../../services/otpService'

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendCountdown, setResendCountdown] = useState(30)
  const inputRefs = useRef([])

  // Get auth context and OTP data
  const { hasOTPData } = useAuth()
  const { otpData, challengeId, maskedContact, deliveryChannel } = useOTPData()
  
  // React Query mutations
  const verify2FAMutation = useVerify2FA()
  const resendOTPMutation = useResendOTP()

  // OTP timer hook
  const { timeRemaining, formattedTime, isExpired } = useOTPTimer(otpData?.expiresAt)

  // Get OTP data from sessionStorage if not in context
  const sessionOTPData = !hasOTPData ? JSON.parse(sessionStorage.getItem('otpData') || '{}') : null
  const effectiveChallengeId = challengeId || sessionOTPData?.challengeId
  const effectiveMaskedContact = maskedContact || otpService.formatEmail(sessionOTPData?.email)
  const effectiveDeliveryChannel = deliveryChannel || sessionOTPData?.deliveryChannel

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleInputChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle enter key
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = pastedData.split('').slice(0, 6)
    
    // Pad with empty strings if needed
    while (newOtp.length < 6) {
      newOtp.push('')
    }
    
    setOtp(newOtp)
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    
    if (!otpService.isValidOTPCode(otpCode)) {
      return // Let validation handle this
    }
    
    // Get email from OTP data
    const effectiveEmail = otpData?.email || sessionOTPData?.email
    
    if (!effectiveEmail) {
      console.error('Email not found in OTP data')
      return
    }
    
    // Use React Query mutation
    verify2FAMutation.mutate({
      challengeId: effectiveChallengeId,
      code: otpCode,
      email: effectiveEmail
    }, {
      onError: () => {
        // Clear OTP on error
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    })
  }

  const handleResend = async () => {
    setResendCountdown(30)
    setOtp(['', '', '', '', '', ''])
    
    // Use React Query mutation
    resendOTPMutation.mutate(effectiveChallengeId, {
      onSuccess: () => {
        inputRefs.current[0]?.focus()
      }
    })
  }

  const handleBackToLogin = () => {
    // Clear OTP data and go back to login
    otpService.clearOTPData()
    window.location.href = '/login' // Force full page reload to clear context
  }

  const isComplete = otp.every(digit => digit !== '')
  const isLoading = verify2FAMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-treegar particles-bg flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto mb-8 flex justify-center">
            <img 
              src="/Images/logo.png" 
              alt="Treegar X Corp" 
              className="h-16 w-auto animate-pulse-slow"
            />
          </div>
          
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient-cyan">SIGNAL </span>
              <span className="text-gradient-purple">VERIFICATION</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium tracking-wider">
              SECURE TRANSMISSION PROTOCOL
            </p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Enter Verification Code
            </h2>
            <p className="text-gray-400 text-sm">
              We've sent a 6-digit code to {effectiveMaskedContact}
            </p>
            {effectiveDeliveryChannel && (
              <p className="text-primary-500 text-xs">
                via {effectiveDeliveryChannel}
              </p>
            )}
            
            {/* Timer Display */}
            {timeRemaining > 0 && (
              <p className="text-gray-400 text-xs">
                Code expires in: <span className="text-primary-500 font-medium">{formattedTime}</span>
              </p>
            )}
            
            {/* Expired Warning */}
            {isExpired && (
              <p className="text-red-400 text-xs">
                Code has expired. Please request a new one.
              </p>
            )}
          </div>
        </div>

        {/* OTP Form */}
        <div className="treegar-card p-8 space-y-6 shadow-2xl">
          {/* OTP Input Grid */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading || isExpired}
                className={`
                  w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all duration-300
                  bg-dark-800 text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                  ${digit 
                    ? 'border-primary-500 shadow-neon-cyan' 
                    : 'border-dark-600 focus:border-primary-500 focus:shadow-neon-cyan'
                  }
                  ${verify2FAMutation.isError ? 'border-red-500' : ''}
                  ${isExpired ? 'border-red-500' : ''}
                `}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Error Message */}
          {verify2FAMutation.isError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">
                    {verify2FAMutation.error?.message || 'Invalid verification code. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resend Error */}
          {resendOTPMutation.isError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">
                    {resendOTPMutation.error?.message || 'Failed to resend code. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message for Resend */}
          {resendOTPMutation.isSuccess && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-300">
                    Verification code sent successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <div className="pt-4">
            <button
              onClick={handleVerify}
              disabled={isLoading || !isComplete || isExpired}
              className={`
                w-full font-bold tracking-wide transition-all duration-300
                ${(isComplete && !isLoading && !isExpired)
                  ? 'btn-treegar-primary'
                  : 'bg-dark-700 text-gray-400 cursor-not-allowed px-6 py-3 rounded-lg'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  VERIFYING SIGNAL...
                </div>
              ) : isExpired ? (
                'CODE EXPIRED'
              ) : (
                'VERIFY TRANSMISSION'
              )}
            </button>
          </div>

          {/* Resend Section */}
          <div className="pt-4 border-t border-dark-600">
            <div className="text-center space-y-3">
              <p className="text-gray-400 text-sm">
                Didn't receive the code?
              </p>
              
              {resendCountdown > 0 && !isExpired ? (
                <p className="text-gray-500 text-sm">
                  Resend code in <span className="text-primary-500 font-medium">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendOTPMutation.isPending || isLoading}
                  className="text-primary-500 hover:text-primary-400 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {resendOTPMutation.isPending ? 'Sending...' : 'Resend Verification Code'}
                </button>
              )}
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <button 
              onClick={handleBackToLogin}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50"
            >
              ← Back to Login
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            Secure transmission powered by Treegar X Corp
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification