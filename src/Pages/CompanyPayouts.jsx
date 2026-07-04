import { useState } from "react";
import {
  useCompanyPayouts,
  useBusinessPayout,
  formatCurrency,
  formatDate,
  getStatusStyle,
} from "../hooks/useBusinessPayoutApi";
import BusinessPayoutDetailsModal from "../Components/BusinessPayoutDetailsModal";

// ─── Copyable Reference ───────────────────────────────────────────────────────
const CopyRef = ({ value }) => {
  const [copied, setCopied] = useState(false);

  if (!value) return <span className="text-gray-600 text-xs font-mono">N/A</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="text-gray-300 text-xs font-mono truncate max-w-[120px]" title={value}>
        {value.slice(0, 12)}…
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary-400 shrink-0"
        title={copied ? "Copied!" : value}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// ─── Filter Modal ─────────────────────────────────────────────────────────────
const FilterModal = ({ onClose, onApply, onClear, draftFilters, setDraftFilters, activeFilterCount }) => {

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="treegar-card p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Filter Payouts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "clientReference", label: "Client Reference", placeholder: "e.g. 7729777d-d709..." },
            { key: "providerReference", label: "Provider Reference", placeholder: "e.g. 09011026041718..." },
            { key: "internalReference", label: "Internal Reference", placeholder: "e.g. FPAY20260629..." },
            { key: "transactionReference", label: "Transaction Reference", placeholder: "e.g. TXN-..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
              <input
                type="text"
                value={draftFilters[key]}
                onChange={(e) => setDraftFilters((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="input-treegar w-full"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
            <input
              type="number"
              min="0"
              value={draftFilters.minAmount}
              onChange={(e) => setDraftFilters((p) => ({ ...p, minAmount: e.target.value }))}
              placeholder="0"
              className="input-treegar w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
            <input
              type="number"
              min="0"
              value={draftFilters.maxAmount}
              onChange={(e) => setDraftFilters((p) => ({ ...p, maxAmount: e.target.value }))}
              placeholder="0"
              className="input-treegar w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) => setDraftFilters((p) => ({ ...p, startDate: e.target.value }))}
              className="input-treegar w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(e) => setDraftFilters((p) => ({ ...p, endDate: e.target.value }))}
              className="input-treegar w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={draftFilters.status}
              onChange={(e) => setDraftFilters((p) => ({ ...p, status: e.target.value }))}
              className="input-treegar w-full"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === "" ? "All Statuses" : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          {activeFilterCount > 0 && (
            <button type="button" onClick={onClear} className="btn-treegar-outline">
              Clear All
            </button>
          )}
          <button type="button" onClick={onClose} className="flex-1 btn-treegar-outline">
            Cancel
          </button>
          <button type="button" onClick={onApply} className="flex-1 btn-treegar-primary">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const STATUSES = ["", "Processing", "Completed", "Failed", "Reversed", "Cancelled", "Rejected"];

const EMPTY_FILTERS = {
  clientReference: "",
  providerReference: "",
  internalReference: "",
  transactionReference: "",
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate: "",
  status: "",
};

const CompanyPayouts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);

  const {
    data: payoutsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCompanyPayouts({ page: currentPage, pageSize, ...appliedFilters });

  const loading = isLoading && !payoutsData;

  const {
    data: selectedPayout,
    isLoading: detailsLoading,
  } = useBusinessPayout(selectedPayoutId);

  const payouts = payoutsData?.items || [];
  const totalPages = payoutsData?.totalPages || 1;
  const totalCount = payoutsData?.totalCount || 0;
  const hasNextPage = payoutsData?.hasNextPage || false;
  const hasPreviousPage = payoutsData?.hasPreviousPage || false;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleApplyFilters = () => {
    const active = Object.fromEntries(
      Object.entries(draftFilters).filter(([, v]) => v !== "")
    );
    setAppliedFilters(active);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters({});
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const stats = {
    total: totalCount,
    completed: payouts.filter((p) => p.status?.toLowerCase() === "completed").length,
    failed: payouts.filter((p) => p.status?.toLowerCase() === "failed").length,
    pending: payouts.filter((p) => p.status?.toLowerCase() === "pending").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-cyan">COMPANY </span>
            <span className="text-gradient-purple">PAYOUTS</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            COMPANY DISBURSEMENT CENTER
          </p>
        </div>
        <div className="treegar-card p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-lg font-medium text-white">Loading company payouts...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-cyan">COMPANY </span>
            <span className="text-gradient-purple">PAYOUTS</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            COMPANY DISBURSEMENT CENTER
          </p>
        </div>
        <div className="treegar-card p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Error Loading Company Payouts</h3>
            <p className="text-gray-400">{error?.message || "An error occurred"}</p>
          </div>
          <button onClick={() => refetch()} className="btn-treegar-primary">Try Again</button>
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
            <span className="text-gradient-cyan">COMPANY </span>
            <span className="text-gradient-purple">PAYOUTS</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            COMPANY DISBURSEMENT CENTER
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeFilterCount > 0
                ? "bg-primary-500/20 border-primary-500/50 text-primary-400"
                : "bg-dark-700 border-dark-600 text-gray-300 hover:border-primary-500/50 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Payouts", value: stats.total.toLocaleString(), sub: "All disbursements", subColor: "text-blue-400", icon: "🏢", bg: "bg-primary-500/10" },
          { label: "Completed", value: stats.completed, sub: "Successful payouts", subColor: "text-green-400", icon: "✅", bg: "bg-green-500/10" },
          { label: "Failed", value: stats.failed, sub: "Need attention", subColor: "text-red-400", icon: "❌", bg: "bg-red-500/10" },
          { label: "Pending", value: stats.pending, sub: "In progress", subColor: "text-yellow-400", icon: "⏳", bg: "bg-yellow-500/10" },
        ].map((s, i) => (
          <div key={i} className="treegar-card-hover p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-neon-cyan mt-2 truncate" title={s.value}>{s.value}</p>
                <p className={`text-xs ${s.subColor} mt-1`}>{s.sub}</p>
              </div>
              <div className={`p-3 ${s.bg} rounded-lg`}>
                <span className="text-2xl">{s.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="treegar-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">Company Payouts</h3>
            {isFetching && (
              <svg className="animate-spin h-4 w-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages} • {totalCount} total
            </span>
            <button
              onClick={() => refetch()}
              className="text-primary-500 hover:text-primary-400 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                {["S/N", "Payout", "Beneficiary", "Amount", "Status", "Client Ref", "Txn Ref", "Provider Ref", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    No payouts found{activeFilterCount > 0 ? " for the selected filters" : ""}.
                  </td>
                </tr>
              ) : (
                payouts.map((payout, index) => {
                  const statusStyle = getStatusStyle(payout.status);
                  const { date, time } = formatDate(payout.createdAt);
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={payout.id} className="hover:bg-dark-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400 font-mono">{serialNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-white font-medium">#{payout.id}</div>
                          <div className="text-gray-400 font-mono text-xs">Wallet: {payout.walletId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-white font-medium">{payout.beneficiaryAccountName}</div>
                          <div className="text-gray-400 font-mono text-xs">{payout.beneficiaryAccountNumber}</div>
                          <div className="text-gray-500 text-xs">{payout.bankName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-neon-cyan font-bold">{formatCurrency(payout.amount, payout.currency)}</div>
                          <div className="text-gray-400 text-xs">Fee: {formatCurrency(payout.feeAmount, payout.currency)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CopyRef value={payout.clientReference} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CopyRef value={payout.transactionReference} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CopyRef value={payout.providerReference} />
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
                        <button
                          onClick={() => { setSelectedPayoutId(payout.id); setShowDetailsModal(true); }}
                          disabled={detailsLoading}
                          className="text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
              className="bg-dark-700 border border-dark-600 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-primary-500"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-sm text-gray-400">per page</span>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => handlePageChange(1)} disabled={!hasPreviousPage} className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">First</button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPreviousPage} className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, currentPage - 2) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${p === currentPage ? "bg-primary-500 text-dark-900 font-medium" : "text-gray-400 hover:text-white hover:bg-dark-700"}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNextPage} className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
            <button onClick={() => handlePageChange(totalPages)} disabled={!hasNextPage} className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Last</button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          activeFilterCount={activeFilterCount}
        />
      )}

      {/* Details Modal */}
      <BusinessPayoutDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedPayoutId(null); }}
        payout={selectedPayout}
        isLoading={detailsLoading}
      />
    </div>
  );
};

export default CompanyPayouts;
