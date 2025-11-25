import React, { useState } from 'react';

const RejectPayoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  payout,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!reason.trim()) {
      setErrors({ reason: 'Please provide a reason for rejection' });
      return;
    }

    if (reason.length < 10) {
      setErrors({ reason: 'Reason must be at least 10 characters' });
      return;
    }

    onConfirm(payout.id, reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="treegar-card w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reject Payout
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Payout Summary */}
        {payout && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Payout ID:</span>
                <span className="text-white">#{payout.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">₦{payout.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Beneficiary:</span>
                <span className="text-white">{payout.beneficiaryAccountName}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors(prev => ({ ...prev, reason: '' }));
                }
              }}
              disabled={isLoading}
              rows="4"
              placeholder="Please provide a detailed reason for rejecting this payout..."
              className={`input-treegar w-full resize-none disabled:opacity-50 ${
                errors.reason ? 'border-red-500 focus:border-red-500' : ''
              }`}
              required
            />
            {errors.reason && (
              <p className="text-red-400 text-xs mt-1">{errors.reason}</p>
            )}
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">
                Minimum 10 characters required
              </p>
              <p className={`text-xs ${reason.length >= 10 ? 'text-green-400' : 'text-gray-400'}`}>
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
              <p className="text-yellow-200 text-xs">
                This action cannot be undone. The payout will be permanently rejected.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 btn-treegar-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim() || reason.length < 10}
              className="flex-1 btn-treegar-danger disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Rejecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Payout
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectPayoutModal;