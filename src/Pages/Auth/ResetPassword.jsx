import React, { useState, useEffect } from 'react';

const ResetPassword = ({ email, onSuccess, onBackToEmail }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validateForm = () => {
    const newErrors = {};

    // OTP validation
    if (!otp.trim()) {
      newErrors.otp = 'Verification code is required';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'Verification code must be 6 digits';
    }

    // Password validation
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/company/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: otp,
          email: email,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }

      // Success
      onSuccess();
    } catch (error) {
      setErrors({ 
        submit: error.message || 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'otp') {
      setOtp(value);
    } else if (field === 'newPassword') {
      setNewPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }

    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const resendOTP = async () => {
    try {
      const response = await fetch('/api/company/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimeLeft(300); // Reset timer
        setErrors(prev => ({ ...prev, submit: '' }));
      }
    } catch (error) {
      setErrors({ submit: 'Failed to resend code. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            {/* Treegar Logo */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-gradient-cyan">RESET</span>{' '}
              <span className="text-gradient-purple">PASSWORD</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Enter the verification code sent to{' '}
            <span className="text-primary-400 font-medium">{email}</span>
          </p>
          
          {/* Timer */}
          <div className="mt-3">
            {timeLeft > 0 ? (
              <p className="text-yellow-400 text-xs">
                Code expires in: {formatTime(timeLeft)}
              </p>
            ) : (
              <p className="text-red-400 text-xs">
                Verification code has expired
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="treegar-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleInputChange('otp', value);
                }}
                disabled={isLoading}
                className={`input-treegar w-full text-center text-2xl tracking-widest disabled:opacity-50 ${
                  errors.otp ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              {errors.otp && (
                <p className="text-red-400 text-xs mt-1">{errors.otp}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  disabled={isLoading}
                  className={`input-treegar w-full pr-12 disabled:opacity-50 ${
                    errors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPasswords ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                className={`input-treegar w-full disabled:opacity-50 ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || timeLeft === 0 || !otp || !newPassword || !confirmPassword}
              className="w-full btn-treegar-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting password...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reset Password
                </div>
              )}
            </button>
          </form>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={resendOTP}
              disabled={timeLeft > 0 || isLoading}
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {timeLeft > 0 ? `Resend code in ${formatTime(timeLeft)}` : 'Resend verification code'}
            </button>
            
            <button
              onClick={onBackToEmail}
              disabled={isLoading}
              className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
            >
              ← Use different email address
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="mt-6">
          <div className="bg-dark-800/50 border border-dark-600 rounded-lg p-4">
            <p className="text-white text-xs font-medium mb-2">Password Requirements:</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li className="flex items-center space-x-2">
                <span className={newPassword.length >= 8 ? 'text-green-400' : 'text-gray-400'}>•</span>
                <span>At least 8 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-gray-400'}>•</span>
                <span>One uppercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[a-z]/.test(newPassword) ? 'text-green-400' : 'text-gray-400'}>•</span>
                <span>One lowercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/\d/.test(newPassword) ? 'text-green-400' : 'text-gray-400'}>•</span>
                <span>One number</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;