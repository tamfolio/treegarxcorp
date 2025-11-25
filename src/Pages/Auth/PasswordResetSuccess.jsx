import React from 'react';

const PasswordResetSuccess = ({ onGoToLogin }) => {
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
            
            {/* Success Animation */}
            <div className="mx-auto w-20 h-20 mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold">
              <span className="text-gradient-cyan">PASSWORD</span>{' '}
              <span className="text-gradient-purple">RESET</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Your password has been successfully reset
          </p>
        </div>

        {/* Success Card */}
        <div className="treegar-card p-6 text-center">
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-2">
              All Set!
            </h2>
            <p className="text-gray-400 text-sm">
              You can now use your new password to log in to your account.
            </p>
          </div>

          <button
            onClick={onGoToLogin}
            className="w-full btn-treegar-primary"
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Continue to Login
            </div>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-left">
                <p className="text-blue-300 text-xs font-medium mb-1">Security Tip</p>
                <p className="text-blue-200 text-xs">
                  Keep your password secure and don't share it with anyone. We recommend using a password manager to store it safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;