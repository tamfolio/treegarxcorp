import { 
    formatCurrency, 
    formatDate, 
    getStatusStyle, 
    getApprovalStatusStyle 
  } from "../hooks/usePayoutApi";
  
  const PayoutDetailsModal = ({ 
    isOpen, 
    onClose, 
    payout, 
    isLoading, 
    onApprove, 
    onReject, 
    approveMutation, 
    rejectMutation 
  }) => {
    if (!isOpen) return null;
  
    const handleApprove = async () => {
      if (!payout?.id) return;
      try {
        await onApprove(payout.id);
      } catch (error) {
        console.error('Approval failed:', error);
      }
    };
  
    const handleReject = async () => {
      if (!payout?.id) return;
      try {
        await onReject(payout.id);
      } catch (error) {
        console.error('Rejection failed:', error);
      }
    };
  
    const statusStyle = getStatusStyle(payout?.status);
    const approvalStatusStyle = getApprovalStatusStyle(payout?.approvalStatus);
  
    const canApprove = payout?.approvalStatus?.toLowerCase() === 'pending' && 
                      payout?.status?.toLowerCase() !== 'completed' &&
                      payout?.status?.toLowerCase() !== 'failed';
  
    const canReject = payout?.approvalStatus?.toLowerCase() === 'pending' && 
                      payout?.status?.toLowerCase() !== 'completed';
  
    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
        <div className="treegar-card p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Payout Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
  
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
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
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Amount</p>
                  <p className="text-xl font-bold text-neon-cyan">
                    {formatCurrency(payout.amount, payout.currency)}
                  </p>
                </div>
                
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    {payout.status}
                  </span>
                </div>
  
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Approval Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${approvalStatusStyle.bg} ${approvalStatusStyle.text} ${approvalStatusStyle.border}`}
                  >
                    {payout.approvalStatus}
                  </span>
                </div>
  
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Payout ID</p>
                  <p className="text-sm font-medium text-white">{payout.id}</p>
                </div>
              </div>
  
              {/* Approval Actions */}
              {canApprove || canReject ? (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-1">
                        Approval Required
                      </h4>
                      <p className="text-xs text-gray-400">
                        This payout requires approval before processing
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {canReject && (
                        <button
                          onClick={handleReject}
                          disabled={rejectMutation.isPending}
                          className="px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-300 text-sm font-medium rounded-lg hover:bg-red-900/70 transition-colors disabled:opacity-50"
                        >
                          {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                        </button>
                      )}
                      {canApprove && (
                        <button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending}
                          className="px-4 py-2 bg-green-900/50 border border-green-500/50 text-green-300 text-sm font-medium rounded-lg hover:bg-green-900/70 transition-colors disabled:opacity-50"
                        >
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
  
              {/* Error Display */}
              {(approveMutation.isError || rejectMutation.isError) && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
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
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">
                        {approveMutation.error?.message || rejectMutation.error?.message || "Action failed"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
  
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Beneficiary Details */}
                <div className="bg-dark-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Beneficiary Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Account Name</p>
                      <p className="text-white font-medium">{payout.beneficiaryAccountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Number</p>
                      <p className="text-white font-mono">{payout.beneficiaryAccountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Bank Code</p>
                      <p className="text-white font-mono">{payout.beneficiaryBankCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Currency</p>
                      <p className="text-white">{payout.currency}</p>
                    </div>
                  </div>
                </div>
  
                {/* Transaction Details */}
                <div className="bg-dark-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Transaction Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Transaction Reference</p>
                      <p className="text-white font-mono text-sm break-all">
                        {payout.transactionReference || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Provider Reference</p>
                      <p className="text-white font-mono text-sm break-all">
                        {payout.providerReference || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Company ID</p>
                      <p className="text-white">{payout.companyId}</p>
                    </div>
                    {payout.accountId && (
                      <div>
                        <p className="text-sm text-gray-400">Account ID</p>
                        <p className="text-white">{payout.accountId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Timestamps */}
              <div className="bg-dark-700/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="text-white text-sm">{formatDate(payout.createdAt).full}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="text-white text-sm">{formatDate(payout.updatedAt).full}</p>
                  </div>
                  {payout.completedAt && (
                    <div>
                      <p className="text-sm text-gray-400">Completed</p>
                      <p className="text-white text-sm">{formatDate(payout.completedAt).full}</p>
                    </div>
                  )}
                  {payout.cancelledAt && (
                    <div>
                      <p className="text-sm text-gray-400">Cancelled</p>
                      <p className="text-white text-sm">{formatDate(payout.cancelledAt).full}</p>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Failure Reason */}
              {payout.failureReason && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-400 mb-2">
                    Failure Reason
                  </h4>
                  <p className="text-red-300 text-sm">{payout.failureReason}</p>
                </div>
              )}
  
              {/* Instructions */}
              {payout.instructions && payout.instructions.length > 0 && (
                <div className="bg-dark-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Processing Instructions
                  </h4>
                  <div className="space-y-4">
                    {payout.instructions.map((instruction, index) => {
                      const instructionStatusStyle = getStatusStyle(instruction.status);
                      const instructionDate = formatDate(instruction.createdAt);
                      
                      return (
                        <div
                          key={instruction.id}
                          className="border border-dark-600 rounded-lg p-4 bg-dark-800/50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-white font-medium">
                                {instruction.instructionType}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${instructionStatusStyle.bg} ${instructionStatusStyle.text} ${instructionStatusStyle.border}`}
                              >
                                {instruction.status}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              Step {index + 1}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 mb-1">Created</p>
                              <p className="text-white">{instructionDate.full}</p>
                            </div>
                            {instruction.completedAt && (
                              <div>
                                <p className="text-gray-400 mb-1">Completed</p>
                                <p className="text-white">{formatDate(instruction.completedAt).full}</p>
                              </div>
                            )}
                            {instruction.providerReference && (
                              <div>
                                <p className="text-gray-400 mb-1">Provider Reference</p>
                                <p className="text-white font-mono break-all">{instruction.providerReference}</p>
                              </div>
                            )}
                            {instruction.providerResponseCode && (
                              <div>
                                <p className="text-gray-400 mb-1">Response Code</p>
                                <p className="text-white">{instruction.providerResponseCode}</p>
                              </div>
                            )}
                          </div>
                          
                          {instruction.providerResponseMessage && (
                            <div className="mt-3">
                              <p className="text-gray-400 mb-1">Response Message</p>
                              <p className="text-white text-sm">{instruction.providerResponseMessage}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                <p className="text-gray-400">
                  The requested payout details could not be loaded.
                </p>
              </div>
            </div>
          )}
  
          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-dark-600">
            <button
              onClick={onClose}
              className="btn-treegar-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default PayoutDetailsModal;