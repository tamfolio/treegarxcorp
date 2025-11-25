import { useState } from "react";
import { useAccounts, useAccount, useCreateAccount } from "../hooks/useApi";
import CreateAccountModal from "../Components/CreateAccountModal";

const Accounts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Use React Query hooks
  const {
    data: accountsData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useAccounts(currentPage, pageSize);

  // Debug logging
  console.log("Accounts component state:", {
    loading,
    isError,
    error: error?.message,
    accountsData,
    currentPage,
    pageSize,
  });

  // Account details query (only enabled when selectedAccountId is set)
  const {
    data: selectedAccount,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useAccount(selectedAccountId);

  // Create account mutation
  const createAccountMutation = useCreateAccount();

  // Extract data from the accounts response
  const accounts = accountsData?.items || [];
  const totalPages = accountsData?.totalPages || 1;
  const totalCount = accountsData?.totalCount || 0;
  const hasNextPage = accountsData?.hasNextPage || false;
  const hasPreviousPage = accountsData?.hasPreviousPage || false;

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
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phoneNumber
    ) {
      return;
    }

    createAccountMutation.mutate(formData, {
      onSuccess: () => {
        // Reset form and close modal
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
        });
        setShowCreateModal(false);
      },
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle account details view
  const handleViewDetails = (accountId) => {
    setSelectedAccountId(accountId);
    setShowDetailsModal(true);
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedAccountId(null);
  };

  // Format currency amounts
  const formatAmount = (amount, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Get account status styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/30",
        };
      case "inactive":
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-400",
          border: "border-gray-500/30",
        };
      case "suspended":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/30",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-400",
          border: "border-gray-500/30",
        };
    }
  };

  // Calculate statistics
  const stats = {
    totalAccounts: totalCount,
    activeAccounts: accounts.filter((a) => a.status?.toLowerCase() === "active")
      .length,
    totalBalance: accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0),
    avgBalance:
      accounts.length > 0
        ? accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0) /
          accounts.length
        : 0,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">VIRTUAL </span>
              <span className="text-gradient-purple">ACCOUNTS</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              DIGITAL ASSET MANAGEMENT
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
              Loading accounts...
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
              <span className="text-gradient-cyan">VIRTUAL </span>
              <span className="text-gradient-purple">ACCOUNTS</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              DIGITAL ASSET MANAGEMENT
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
              Error Loading Accounts
            </h3>
            <p className="text-gray-400">{error}</p>
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
            <span className="text-gradient-cyan">VIRTUAL </span>
            <span className="text-gradient-purple">ACCOUNTS</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            DIGITAL ASSET MANAGEMENT
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Multi-currency</p>
            <p className="text-primary-500 font-medium">
              virtual infrastructure
            </p>
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
            <span>CREATE ACCOUNT</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Total Accounts
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.totalAccounts.toLocaleString()}
              </p>
              <p className="text-xs text-blue-400 mt-1">All virtual accounts</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Active Accounts
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.activeAccounts}
              </p>
              <p className="text-xs text-green-400 mt-1">
                Operational accounts
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
                Total Balance
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {formatAmount(stats.totalBalance)}
              </p>
              <p className="text-xs text-blue-400 mt-1">
                All accounts combined
              </p>
            </div>
            <div className="p-3 bg-secondary-500/10 rounded-lg">
              <span className="text-2xl">💎</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Avg Balance
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {formatAmount(stats.avgBalance)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Per account average</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="treegar-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Account Management
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
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
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
              {accounts.map((account) => {
                const statusStyle = getStatusStyle(account.status);
                const { date, time } = formatDate(account.createdAt);

                return (
                  <tr
                    key={account.accountId}
                    className="hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {account.accountNumber}
                        </div>
                        <div className="text-gray-400 capitalize">
                          {account.accountName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {account.customerName}
                        </div>
                        <div className="text-gray-400 font-mono text-xs">
                          {account.customerCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-neon-cyan font-bold">
                          {formatAmount(account.currentBalance)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Available: {formatAmount(account.availableBalance)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">{date}</div>
                        <div className="text-gray-400">{time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(account.accountId)}
                        disabled={detailsLoading}
                        className="text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
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

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="treegar-card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Create New Account
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                  });
                }}
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

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={createAccountMutation.isPending}
                  className="input-treegar input-with-icon-left w-full disabled:opacity-50"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={createAccountMutation.isPending}
                  className="input-treegar w-full disabled:opacity-50"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={createAccountMutation.isPending}
                  className="input-treegar w-full disabled:opacity-50"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  disabled={createAccountMutation.isPending}
                  className="input-treegar w-full disabled:opacity-50"
                  placeholder="Enter phone number"
                />
              </div>

              {createAccountMutation.isError && (
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
                        {createAccountMutation.error?.message ||
                          "Failed to create account"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phoneNumber: "",
                    });
                  }}
                  disabled={createAccountMutation.isPending}

                  className="flex-1 btn-treegar-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAccountMutation.isPending}

                  className="flex-1 btn-treegar-primary"
                >
                  {createAccountMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
                      Creating...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
          });
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        mutation={createAccountMutation}
      />
    </div>
  );
};

export default Accounts;
