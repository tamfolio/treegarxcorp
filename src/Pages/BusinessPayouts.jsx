import { useState } from "react";
import {
  useBusinessPayouts,
  useBusinessPayout,
  useBusinessPayoutByReference,
  formatCurrency,
  formatDate,
  getStatusStyle,
} from "../hooks/useBusinessPayoutApi";
import BusinessPayoutDetailsModal from "../Components/BusinessPayoutDetailsModal";

const BusinessPayouts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchReference, setSearchReference] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);

  // Use React Query hooks
  const {
    data: payoutsData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useBusinessPayouts(currentPage, pageSize, selectedStatus);

  // Search by reference hook
  const {
    data: searchResult,
    isLoading: searchLoading,
    isError: searchError,
    refetch: refetchSearch,
  } = useBusinessPayoutByReference(searchQuery, {
    enabled: false, // Manual trigger
  });

  // Payout details query (only enabled when selectedPayoutId is set)
  const {
    data: selectedPayout,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useBusinessPayout(selectedPayoutId);

  // Extract data from the payouts response
  const payouts = payoutsData?.items || [];
  const totalPages = payoutsData?.totalPages || 1;
  const totalCount = payoutsData?.totalCount || 0;
  const hasNextPage = payoutsData?.hasNextPage || false;
  const hasPreviousPage = payoutsData?.hasPreviousPage || false;

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Handle search by reference
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchReference.trim()) {
      setSearchQuery(searchReference.trim());
      refetchSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchReference("");
    setSearchQuery("");
  };

  // Handle payout details view
  const handleViewDetails = (payoutId) => {
    setSelectedPayoutId(payoutId);
    setShowDetailsModal(true);
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedPayoutId(null);
  };

  // Handle fix payout (retry failed payout)
  const handleFixPayout = (payout) => {
    // You can implement this to either:
    // 1. Create a new payout with same details
    // 2. Call a retry API endpoint
    // 3. Open a modal to edit and retry the payout
    console.log("Fix payout:", payout);
    alert(
      `Fix payout #${payout.id}\nFailure: ${payout.failureReason}\nThis would retry the payout with corrected details.`
    );
  };

  // Calculate statistics
  const stats = {
    totalPayouts: totalCount,
    completedPayouts: payouts.filter(
      (p) => p.status?.toLowerCase() === "completed"
    ).length,
    failedPayouts: payouts.filter((p) => p.status?.toLowerCase() === "failed")
      .length,
    pendingPayouts: payouts.filter((p) => p.status?.toLowerCase() === "pending")
      .length,
    totalAmount: payouts.reduce((sum, p) => sum + (p.amount || 0), 0),
    totalFees: payouts.reduce((sum, p) => sum + (p.feeAmount || 0), 0),
  };

  // Show search results if available
  const displayPayouts = searchResult ? [searchResult] : payouts;
  const isShowingSearchResult = !!searchResult;

  if (loading && !searchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">BUSINESS </span>
              <span className="text-gradient-purple">PAYOUTS</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              CORPORATE DISBURSEMENT CENTER
            </p>
          </div>
        </div>

        <div className="treegar-card p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
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
              Loading business payouts...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !searchError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">BUSINESS </span>
              <span className="text-gradient-purple">PAYOUTS</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              CORPORATE DISBURSEMENT CENTER
            </p>
          </div>
        </div>

        <div className="treegar-card p-8 text-center">
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
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Business Payouts
            </h3>
            <p className="text-gray-400">
              {error?.message || "An error occurred"}
            </p>
          </div>
          <button onClick={() => refetch()} className="btn-treegar-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-cyan">BUSINESS </span>
            <span className="text-gradient-purple">PAYOUTS</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            CORPORATE DISBURSEMENT CENTER
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Enterprise</p>
            <p className="text-primary-500 font-medium">payment system</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="treegar-card p-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchReference}
              onChange={(e) => setSearchReference(e.target.value)}
              placeholder="Search by client reference (e.g., dc31fe5b-fd0a-4051-9d8f-208cebc3cd79)"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading || !searchReference.trim()}
            className="btn-treegar-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {searchLoading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>SEARCH</span>
              </>
            )}
          </button>
          {isShowingSearchResult && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white hover:bg-dark-600 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
        {/* Status Filter */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm text-gray-400 whitespace-nowrap">
            Filter by status:
          </span>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {["", "Processing", "Completed", "Failed", "Reversed"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedStatus === status
                      ? "bg-primary-500 text-dark-900 border-primary-500"
                      : "bg-dark-700 text-gray-400 border-dark-600 hover:border-primary-500 hover:text-white"
                  }`}
                >
                  {status === "" ? "All" : status}
                </button>
              )
            )}
          </div>
          {selectedStatus && (
            <span className="text-xs text-primary-400 ml-2">
              Showing: <span className="font-medium">{selectedStatus}</span>
            </span>
          )}
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              {searchError?.response?.data?.message ||
                "Search failed. Please check the reference and try again."}
            </p>
          </div>
        )}
      </div>

      {/* Statistics Grid - Hide when showing search result */}
      {!isShowingSearchResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Total Payouts
                </p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">
                  {stats.totalPayouts.toLocaleString()}
                </p>
                <p className="text-xs text-blue-400 mt-1">All disbursements</p>
              </div>
              <div className="p-3 bg-primary-500/10 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Completed
                </p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">
                  {stats.completedPayouts}
                </p>
                <p className="text-xs text-green-400 mt-1">
                  Successful payouts
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Failed
                </p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">
                  {stats.failedPayouts}
                </p>
                <p className="text-xs text-red-400 mt-1">Need attention</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Pending
                </p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">
                  {stats.pendingPayouts}
                </p>
                <p className="text-xs text-yellow-400 mt-1">In progress</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Total Amount
                </p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">
                  {formatCurrency(stats.totalAmount)}
                </p>
                <p className="text-xs text-blue-400 mt-1">Current page total</p>
              </div>
              <div className="p-3 bg-secondary-500/10 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Total Fees
                </p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">
                  {formatCurrency(stats.totalFees)}
                </p>
                <p className="text-xs text-purple-400 mt-1">Processing fees</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <span className="text-2xl">💎</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Payouts Table */}
      <div className="treegar-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {isShowingSearchResult ? "Search Result" : "Business Payouts"}
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {isShowingSearchResult
                  ? "1 result"
                  : `Page ${currentPage} of ${totalPages} • ${totalCount} total`}
              </span>
              <button
                onClick={() => refetch()}
                className="text-primary-500 hover:text-primary-400 transition-colors"
                title="Refresh"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Payout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  References
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {displayPayouts.map((payout, index) => {
                const statusStyle = getStatusStyle(payout.status);
                const { date, time } = formatDate(payout.createdAt);

                return (
                  <tr
                    key={payout.id}
                    className="hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          #{payout.id}
                        </div>
                        <div className="text-gray-400 font-mono text-xs">
                          Wallet: {payout.walletId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {payout.beneficiaryAccountName}
                        </div>
                        <div className="text-gray-400 font-mono text-xs">
                          {payout.beneficiaryAccountNumber}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {payout.bankName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-neon-cyan font-bold">
                          {formatCurrency(payout.amount, payout.currency)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Fee:{" "}
                          {formatCurrency(payout.feeAmount, payout.currency)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-400 max-w-32 space-y-1">
                        <div
                          className="truncate"
                          title={payout.clientReference}
                        >
                          Client: {payout.clientReference?.slice(0, 8)}...
                        </div>
                        <div
                          className="truncate"
                          title={payout.transactionReference}
                        >
                          Txn: {payout.transactionReference || "Pending"}
                        </div>
                        <div
                          className="truncate"
                          title={payout.providerReference}
                        >
                          Provider:{" "}
                          {payout.providerReference?.slice(0, 8) || "N/A"}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">{date}</div>
                        <div className="text-gray-400">{time}</div>
                        {payout.completedAt && (
                          <div className="text-green-400 text-xs">
                            Completed: {formatDate(payout.completedAt).time}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(payout.id)}
                          disabled={detailsLoading}
                          className="text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
                          title="View Details"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        {/* Show fix button for failed payouts */}
                        {payout.status?.toLowerCase() === "failed" && (
                          <button
                            onClick={() => handleFixPayout(payout)}
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                            title="Retry/Fix Payout"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Show warning icon for reversed payouts */}
                        {payout.reversalReference && (
                          <div
                            className="text-yellow-500"
                            title="Payout was reversed"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - Hide when showing search result */}
        {!isShowingSearchResult && (
          <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-dark-700 border border-dark-600 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-primary-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-400">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!hasPreviousPage}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        pageNum === currentPage
                          ? "bg-primary-500 text-dark-900 font-medium"
                          : "text-gray-400 hover:text-white hover:bg-dark-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={!hasNextPage}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Business Payout Details Modal */}
      <BusinessPayoutDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        payout={selectedPayout}
        isLoading={detailsLoading}
      />
    </div>
  );
};

export default BusinessPayouts;
