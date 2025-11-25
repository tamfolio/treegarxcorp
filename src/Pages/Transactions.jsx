import { useState } from "react";
import { useTransactions } from "../hooks/useApi";
import StatementModal from "../Components/StatementModal";

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementParams, setStatementParams] = useState({
    startDate: "",
    endDate: "",
    transactionType: "",
    exportType: "pdf",
    email: "",
  });

  const handleStatementDownload = async () => {
    const params = new URLSearchParams({
      StartDate: statementParams.startDate,
      EndDate: statementParams.endDate,
      TransactionType: statementParams.transactionType,
      export: statementParams.exportType,
      email: statementParams.email,
    });

    try {
      const response = await fetch(
        `https://treegar-accounts-api.treegar.com:8443/api/company/transactions/statement?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download statement");

      alert("Statement sent to email successfully!");
      setShowStatementModal(false);
    } catch (error) {
      console.error(error);
      alert("Error downloading statement");
    }
  };

  // Use React Query hook for transactions
  const {
    data: transactionsData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useTransactions(currentPage, pageSize);

  // Extract data from the response
  const transactions = transactionsData?.items || [];
  const totalPages = transactionsData?.totalPages || 1;
  const totalCount = transactionsData?.totalCount || 0;
  const hasNextPage = transactionsData?.hasNextPage || false;
  const hasPreviousPage = transactionsData?.hasPreviousPage || false;

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  // Get transaction type styling
  const getTransactionTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "credit":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/30",
          icon: "↗",
        };
      case "debit":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/30",
          icon: "↘",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-400",
          border: "border-gray-500/30",
          icon: "→",
        };
    }
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/30",
        };
      case "pending":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-400",
          border: "border-yellow-500/30",
        };
      case "failed":
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
    totalTransactions: totalCount,
    creditCount: transactions.filter(
      (t) => t.transactionType?.toLowerCase() === "credit"
    ).length,
    debitCount: transactions.filter(
      (t) => t.transactionType?.toLowerCase() === "debit"
    ).length,
    totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">TRANSACTIONS</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              PAYMENT PROCESSING & HISTORY
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
              Loading transactions...
            </span>
          </div>
        </div>

        <StatementModal
          isOpen={showStatementModal}
          onClose={() => setShowStatementModal(false)}
          params={statementParams}
          setParams={setStatementParams}
          onDownload={handleStatementDownload}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">TRANSACTIONS</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              PAYMENT PROCESSING & HISTORY
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
              Error Loading Transactions
            </h3>
            <p className="text-gray-400">
              {error?.message || "Something went wrong"}
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
            <span className="text-gradient-cyan">TRANSACTIONS</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            PAYMENT PROCESSING & HISTORY
          </p>
        </div>
        <div className="text-right flex gap-4">
          <button
            onClick={() => setShowStatementModal(true)}
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
                d="M4 4v16h16V4H4zm8 11v-6m0 6l-3-3m3 3l3-3"
              />
            </svg>
            <span>DOWNLOAD STATEMENT</span>
          </button>
          <div className="flex flex-col items-start justify-start">
            <p className="text-gray-400 text-sm">Real-time payment</p>
            <p className="text-primary-500 font-medium">infrastructure</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.totalTransactions.toLocaleString()}
              </p>
              <p className="text-xs text-blue-400 mt-1">All time records</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Credits
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.creditCount}
              </p>
              <p className="text-xs text-green-400 mt-1">Incoming payments</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <span className="text-2xl">↗</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Debits
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.debitCount}
              </p>
              <p className="text-xs text-red-400 mt-1">Outgoing payments</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <span className="text-2xl">↘</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Volume
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {formatAmount(stats.totalVolume)}
              </p>
              <p className="text-xs text-blue-400 mt-1">Current page total</p>
            </div>
            <div className="p-3 bg-secondary-500/10 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="treegar-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Transaction History
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
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {transactions.map((transaction) => {
                const typeStyle = getTransactionTypeStyle(
                  transaction.transactionType
                );
                const statusStyle = getStatusStyle(transaction.status);
                const { date, time } = formatDate(transaction.transactionDate);

                return (
                  <tr
                    key={transaction.transactionId}
                    className="hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          #{transaction.transactionId}
                        </div>
                        <div className="text-gray-400 text-xs font-mono">
                          {transaction.transactionReference}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {transaction.accountNumber}
                        </div>
                        <div className="text-gray-400 capitalize">
                          {transaction.accountName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                      >
                        <span className="mr-1">{typeStyle.icon}</span>
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div
                          className={`font-bold ${
                            transaction.transactionType?.toLowerCase() ===
                            "credit"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatAmount(transaction.amount)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Balance: {formatAmount(transaction.balanceAfter)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">{date}</div>
                        <div className="text-gray-400">{time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs">
                        <p className="truncate" title={transaction.description}>
                          {transaction.description}
                        </p>
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
    </div>
  );
};

export default Transactions;
