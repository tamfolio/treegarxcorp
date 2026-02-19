import React from "react";
import { formatCurrency, formatDate, getStatusStyle } from "../hooks/useBusinessPayoutApi";

const BusinessPayoutDetailsModal = ({ isOpen, onClose, payout, isLoading }) => {
  if (!isOpen) return null;

  const statusStyle = getStatusStyle(payout?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden border border-dark-600">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-600">
          <div>
            <h2 className="text-2xl font-bold">
              <span className="text-gradient-cyan">BUSINESS PAYOUT </span>
              <span className="text-gradient-purple">DETAILS</span>
            </h2>
            <p className="text-primary-500 text-sm mt-1">
              {payout ? `Payout #${payout.id}` : "Loading payout details..."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            {/* Replace XMarkIcon with inline SVG */}
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <svg
                  className="animate-spin h-8 w-8 text-primary-500"
                  fill="none"
                  stroke="currentColor"
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
                <span className="text-lg font-medium text-white">
                  Loading payout details...
                </span>
              </div>
            </div>
          ) : payout ? (
            <div className="space-y-8">
              {/* Overview Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Amount & Status */}
                <div className="treegar-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">💰</span>
                    Payment Overview
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Amount</p>
                      <p className="text-3xl font-bold text-neon-cyan">
                        {formatCurrency(payout.amount, payout.currency)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Fee</p>
                        <p className="text-white font-medium">
                          {formatCurrency(payout.feeAmount, payout.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Currency</p>
                        <p className="text-white font-medium">{payout.currency}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Beneficiary Information */}
                <div className="treegar-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">👤</span>
                    Beneficiary Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Account Name</p>
                      <p className="text-white font-medium">{payout.beneficiaryAccountName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Account Number</p>
                      <p className="text-white font-mono">{payout.beneficiaryAccountNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Bank</p>
                      <p className="text-white font-medium">
                        {payout.bankName} ({payout.bankId})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction References */}
              <div className="treegar-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔗</span>
                  Transaction References
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Client Reference</p>
                    <p className="text-white font-mono text-sm break-all">
                      {payout.clientReference}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Transaction Reference</p>
                    <p className="text-white font-mono text-sm break-all">
                      {payout.transactionReference || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Provider Reference</p>
                    <p className="text-white font-mono text-sm break-all">
                      {payout.providerReference || "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account & System Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Info */}
                <div className="treegar-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🏢</span>
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Company ID</p>
                      <p className="text-white font-medium">{payout.companyId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Wallet ID</p>
                      <p className="text-white font-medium">{payout.walletId}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="treegar-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">⏰</span>
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Created At</p>
                      <p className="text-white">{formatDate(payout.createdAt).full}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Updated At</p>
                      <p className="text-white">{formatDate(payout.updatedAt).full}</p>
                    </div>
                    {payout.completedAt && (
                      <div>
                        <p className="text-gray-400 text-sm">Completed At</p>
                        <p className="text-green-400">{formatDate(payout.completedAt).full}</p>
                      </div>
                    )}
                    {payout.cancelledAt && (
                      <div>
                        <p className="text-gray-400 text-sm">Cancelled At</p>
                        <p className="text-red-400">{formatDate(payout.cancelledAt).full}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Information - Show only if there are failures or reversals */}
              {(payout.failureReason || payout.reversalReference || payout.reversalReason) && (
                <div className="treegar-card p-6 border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                    <span className="text-2xl mr-2">⚠️</span>
                    Issue Details
                  </h3>
                  <div className="space-y-4">
                    {payout.failureReason && (
                      <div>
                        <p className="text-gray-400 text-sm">Failure Reason</p>
                        <p className="text-red-400">{payout.failureReason}</p>
                      </div>
                    )}
                    {payout.reversalReference && (
                      <div>
                        <p className="text-gray-400 text-sm">Reversal Reference</p>
                        <p className="text-yellow-400 font-mono text-sm">{payout.reversalReference}</p>
                      </div>
                    )}
                    {payout.reversalReason && (
                      <div>
                        <p className="text-gray-400 text-sm">Reversal Reason</p>
                        <p className="text-yellow-400">{payout.reversalReason}</p>
                      </div>
                    )}
                    {payout.reversedAt && (
                      <div>
                        <p className="text-gray-400 text-sm">Reversed At</p>
                        <p className="text-yellow-400">{formatDate(payout.reversedAt).full}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <svg
                  className="h-12 w-12 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Payout Not Found</h3>
                <p className="text-gray-400">The requested payout details could not be loaded.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-dark-600 bg-dark-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-dark-600 text-white rounded-lg hover:bg-dark-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessPayoutDetailsModal;