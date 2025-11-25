import { useState } from "react";
import {
  usePayouts,
  usePayout,
  useCreatePayout,
  useApprovePayout,
  useRejectPayout,
  formatCurrency,
  formatDate,
  getStatusStyle,
  getApprovalStatusStyle,
} from "../hooks/usePayoutApi";
import CreatePayoutModal from "../Components/CreatePayoutModal";
import PayoutDetailsModal from "../Components/PayoutDetailsModal";
import RejectPayoutModal from "../Components/RejectPayoutModal";

const Payouts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);
  const [payoutToReject, setPayoutToReject] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    amount: 0,
    displayAmount: "",
    beneficiaryAccountNumber: "",
    beneficiaryAccountName: "",
    beneficiaryBankCode: "",
    bankName: "",
    narration: "",
    currency: "NGN",
  });

  // Use React Query hooks
  const {
    data: payoutsData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = usePayouts(currentPage, pageSize);

  // Payout details query (only enabled when selectedPayoutId is set)
  const {
    data: selectedPayout,
    isLoading: detailsLoading,
    isError: detailsError,
  } = usePayout(selectedPayoutId);

  // Mutations
  const createPayoutMutation = useCreatePayout();
  const approvePayoutMutation = useApprovePayout();
  const rejectPayoutMutation = useRejectPayout();

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

  // Handle form submission
  const handleCreateSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.amount ||
      formData.amount <= 0 ||
      !formData.beneficiaryAccountNumber ||
      !formData.beneficiaryAccountName ||
      !formData.beneficiaryBankCode ||
      !formData.narration
    ) {
      return;
    }

    // Prepare payload for API
    const payload = {
      amount: formData.amount,
      beneficiaryAccountNumber: formData.beneficiaryAccountNumber,
      beneficiaryAccountName: formData.beneficiaryAccountName,
      beneficiaryBankCode: formData.beneficiaryBankCode,
      narration: formData.narration,
      currency: "NGN",
    };

    createPayoutMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form and close modal
        setFormData({
          amount: 0,
          displayAmount: "",
          beneficiaryAccountNumber: "",
          beneficiaryAccountName: "",
          beneficiaryBankCode: "",
          bankName: "",
          narration: "",
          currency: "NGN",
        });
        setShowCreateModal(false);
      },
    });
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

  // Handle payout approval
  const handleApprovePayout = async (payoutId) => {
    try {
      await approvePayoutMutation.mutateAsync(payoutId);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  // Handle opening rejection modal
  const handleOpenRejectModal = (payout) => {
    setPayoutToReject(payout);
    setShowRejectModal(true);
  };

  // Handle closing rejection modal
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setPayoutToReject(null);
  };

  // Handle payout rejection with reason
  const handleRejectPayout = async (payoutId, reason) => {
    try {
      await rejectPayoutMutation.mutateAsync({ payoutId, reason });
      handleCloseRejectModal();
    } catch (error) {
      console.error("Rejection failed:", error);
      // Note: Error handling is already done in the mutation's onError callback
    }
  };

  // Calculate statistics
  const stats = {
    totalPayouts: totalCount,
    completedPayouts: payouts.filter((p) => p.status?.toLowerCase() === "completed").length,
    pendingPayouts: payouts.filter((p) => p.approvalStatus?.toLowerCase() === "pending").length,
    totalAmount: payouts.reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">PAYOUTS </span>
              <span className="text-gradient-purple">MANAGEMENT</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              DISBURSEMENT CONTROL CENTER
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
              Loading payouts...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">PAYOUTS </span>
              <span className="text-gradient-purple">MANAGEMENT</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              DISBURSEMENT CONTROL CENTER
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Payouts</h3>
            <p className="text-gray-400">{error?.message || "An error occurred"}</p>
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
            <span className="text-gradient-cyan">PAYOUTS </span>
            <span className="text-gradient-purple">MANAGEMENT</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            DISBURSEMENT CONTROL CENTER
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Automated</p>
            <p className="text-primary-500 font-medium">disbursement system</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-treegar-primary flex items-center space-x-2"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>CREATE PAYOUT</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <span className="text-2xl">💸</span>
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
              <p className="text-xs text-green-400 mt-1">Successful payouts</p>
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
                Pending Approval
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.pendingPayouts}
              </p>
              <p className="text-xs text-yellow-400 mt-1">Awaiting approval</p>
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
              <span className="text-2xl">💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="treegar-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Payouts Management
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} • {totalCount} total
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
                  Approval
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
              {payouts.map((payout) => {
                const statusStyle = getStatusStyle(payout.status);
                const approvalStatusStyle = getApprovalStatusStyle(payout.approvalStatus);
                const { date, time } = formatDate(payout.createdAt);

                return (
                  <tr
                    key={payout.id}
                    className="hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">#{payout.id}</div>
                        <div className="text-gray-400 font-mono text-xs truncate max-w-32">
                          {payout.transactionReference || "Pending"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {payout.beneficiaryAccountName}
                        </div>
                        <div className="text-gray-400 font-mono text-xs">
                          {payout.beneficiaryAccountNumber} • {payout.beneficiaryBankCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-neon-cyan font-bold">
                          {formatCurrency(payout.amount, payout.currency)}
                        </div>
                        <div className="text-gray-400 text-xs">{payout.currency}</div>
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${approvalStatusStyle.bg} ${approvalStatusStyle.text} ${approvalStatusStyle.border}`}
                      >
                        {payout.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">{date}</div>
                        <div className="text-gray-400">{time}</div>
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
                        
                        {payout.approvalStatus?.toLowerCase() === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePayout(payout.id)}
                              disabled={approvePayoutMutation.isPending}
                              className="text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
                              title="Approve"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(payout)}
                              disabled={rejectPayoutMutation.isPending}
                              className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Reject"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>

      {/* Create Payout Modal */}
      <CreatePayoutModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            amount: 0,
            displayAmount: "",
            beneficiaryAccountNumber: "",
            beneficiaryAccountName: "",
            beneficiaryBankCode: "",
            bankName: "",
            narration: "",
            currency: "NGN",
          });
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        mutation={createPayoutMutation}
      />

      {/* Payout Details Modal */}
      <PayoutDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        payout={selectedPayout}
        isLoading={detailsLoading}
        onApprove={handleApprovePayout}
        onReject={() => handleOpenRejectModal(selectedPayout)}
        approveMutation={approvePayoutMutation}
        rejectMutation={rejectPayoutMutation}
      />

      {/* Reject Payout Modal */}
      <RejectPayoutModal
        isOpen={showRejectModal}
        onClose={handleCloseRejectModal}
        onConfirm={handleRejectPayout}
        payout={payoutToReject}
        isLoading={rejectPayoutMutation.isPending}
      />
    </div>
  );
};

export default Payouts;