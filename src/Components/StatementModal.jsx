import React from "react";

const StatementModal = ({ 
  isOpen, 
  onClose, 
  statementParams, 
  setStatementParams, 
  onDownload, 
  isLoading = false,
  result = null 
}) => {
  // Don't render if not open
  if (!isOpen) return null;

  // Provide default values if statementParams is undefined
  const params = statementParams || {
    startDate: "",
    endDate: "",
    transactionType: "",
    exportType: "pdf",
    email: "",
  };

  const handleParamChange = (key, value) => {
    if (setStatementParams && !isLoading) {
      setStatementParams({ ...params, [key]: value });
    }
  };

  const handleDownload = () => {
    // Basic validation
    if (!params.startDate || !params.endDate) {
      return;
    }

    if (!params.email) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      return;
    }

    // Check if start date is not after end date
    if (new Date(params.startDate) > new Date(params.endDate)) {
      return;
    }

    onDownload();
  };

  // Validation for form fields
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return params.startDate && 
           params.endDate && 
           params.email && 
           emailRegex.test(params.email) &&
           new Date(params.startDate) <= new Date(params.endDate);
  };

  const getValidationMessage = () => {
    if (!params.startDate || !params.endDate) {
      return "Please select both start and end dates";
    }
    if (!params.email) {
      return "Please enter an email address";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      return "Please enter a valid email address";
    }
    if (new Date(params.startDate) > new Date(params.endDate)) {
      return "Start date cannot be after end date";
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="treegar-card w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Download Statement</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Result Notification */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {result.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{result.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={params.startDate}
              onChange={(e) => handleParamChange("startDate", e.target.value)}
              className="input-treegar w-full disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={params.endDate}
              onChange={(e) => handleParamChange("endDate", e.target.value)}
              className="input-treegar w-full disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={params.transactionType}
              onChange={(e) => handleParamChange("transactionType", e.target.value)}
              className="input-treegar w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="">All Transactions</option>
              <option value="credit">Credit Only</option>
              <option value="debit">Debit Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={params.exportType}
              onChange={(e) => handleParamChange("exportType", e.target.value)}
              className="input-treegar w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="pdf">PDF Document</option>
              <option value="csv">CSV Spreadsheet</option>
              <option value="excel">Excel Spreadsheet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="Enter email to receive the statement"
              value={params.email}
              onChange={(e) => handleParamChange("email", e.target.value)}
              className="input-treegar w-full disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 mt-1">
              The statement will be sent to this email address
            </p>
          </div>
        </div>

        {/* Validation Message */}
        {!isFormValid() && !result && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg">
            <p className="text-sm">{getValidationMessage()}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
          <button 
            onClick={onClose} 
            className="btn-treegar-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button 
            onClick={handleDownload} 
            className="btn-treegar-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Statement
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatementModal;