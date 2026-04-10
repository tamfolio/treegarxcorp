import { useState } from "react";
import { useCompanyWalletTransactions, useCompanyProfile } from "../hooks/useApi";

// ─── Sweep Modal ────────────────────────────────────────────────────────────
const SweepModal = ({ isOpen, onClose, onSweep, isLoading, result, balanceCards, formatAmount }) => {
  const [sweepForm, setSweepForm] = useState({
    amount: "",
    fromWalletType: "Collection",
    currencyCode: "NGN",
  });

  const handleSubmit = () => {
    if (!sweepForm.amount || isNaN(sweepForm.amount) || Number(sweepForm.amount) <= 0) return;
    onSweep({ ...sweepForm, amount: parseFloat(sweepForm.amount) });
  };

  if (!isOpen) return null;

  const fromWallet = balanceCards.find(b => b.type === sweepForm.fromWalletType);
  const toWalletType = sweepForm.fromWalletType === "Collection" ? "Disbursement" : "Collection";
  const toWallet = balanceCards.find(b => b.type === toWalletType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h2 className="text-lg font-bold text-white">Wallet Sweep</h2>
            <p className="text-xs text-gray-400 mt-0.5">Transfer funds between wallets</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Wallet Flow Preview */}
          <div className="flex items-center justify-between bg-dark-700/50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">From</p>
              <p className="text-sm font-semibold text-white">{sweepForm.fromWalletType}</p>
              {fromWallet && !fromWallet.error && (
                <p className="text-xs text-neon-cyan mt-1">{formatAmount(fromWallet.availableBalance)}</p>
              )}
            </div>
            <div className="text-primary-500 text-xl">→</div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">To</p>
              <p className="text-sm font-semibold text-white">{toWalletType}</p>
              {toWallet && !toWallet.error && (
                <p className="text-xs text-neon-cyan mt-1">{formatAmount(toWallet.availableBalance)}</p>
              )}
            </div>
          </div>

          {/* From Wallet */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Wallet</label>
            <select
              value={sweepForm.fromWalletType}
              onChange={e => setSweepForm(p => ({ ...p, fromWalletType: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500"
            >
              <option value="Collection">Collection</option>
              <option value="Disbursement">Disbursement</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (NGN)</label>
            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={sweepForm.amount}
              onChange={e => setSweepForm(p => ({ ...p, amount: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 placeholder-gray-500"
            />
          </div>

          {/* Result feedback */}
          {result && (
            <div className={`rounded-lg p-4 text-sm ${
              result.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {result.type === 'success' ? (
                <div className="space-y-1">
                  <p className="font-semibold">✓ Sweep successful</p>
                  <p>Amount: {formatAmount(result.data?.amount)}</p>
                  <p className="text-xs text-gray-400">Ref: {result.data?.debitReference}</p>
                </div>
              ) : (
                <p>{result.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-dark-600">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !sweepForm.amount}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-dark-900 bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>Sweep Funds</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CompanyTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showSweepModal, setShowSweepModal] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState(null);

  // Hooks
  const { data: transactionsData, isLoading: loading, isError, error, refetch } =
    useCompanyWalletTransactions(currentPage, pageSize);

  const { data: companyProfile, isLoading: profileLoading, refetch: refetchProfile } =
    useCompanyProfile();

  // Derived data
  const transactions = transactionsData?.items || [];
  const totalPages = transactionsData?.totalPages || 1;
  const totalCount = transactionsData?.totalCount || 0;
  const hasNextPage = transactionsData?.hasNextPage || false;
  const hasPreviousPage = transactionsData?.hasPreviousPage || false;

  const balanceCards = (companyProfile?.accountBalances || []).map(a => ({
    type: a.accountType,
    accountNumber: a.accountNumber,
    availableBalance: a.availableBalance || 0,
    ledgerBalance: a.ledgerBalance || 0,
    currency: a.currency || 'NGN',
    error: a.error,
  }));

  // Handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSweep = async (payload) => {
    setIsSweeping(true);
    setSweepResult(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'https://treegar-accounts-api.treegar.com:8443/api/company/wallet/sweep',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || `Error ${response.status}`);
      }
      setSweepResult({ type: 'success', data: json.data });
      refetch();
      refetchProfile();
      setTimeout(() => {
        setShowSweepModal(false);
        setSweepResult(null);
      }, 3000);
    } catch (err) {
      setSweepResult({ type: 'error', message: err.message || 'Sweep failed. Please try again.' });
    } finally {
      setIsSweeping(false);
    }
  };

  // Formatters
  const formatAmount = (amount, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 })
      .format(amount || 0);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-GB'),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getDirectionStyle = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'credit':
        return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: '↗' };
      case 'debit':
        return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: '↘' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', icon: '→' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
      case 'pending':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      case 'failed':
        return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  const stats = {
    totalTransactions: totalCount,
    creditCount: transactions.filter(t => t.direction?.toLowerCase() === 'credit').length,
    debitCount: transactions.filter(t => t.direction?.toLowerCase() === 'debit').length,
    totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold"><span className="text-gradient-cyan">COMPANY TRANSACTIONS</span></h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">WALLET TRANSACTION HISTORY</p>
        </div>
        <div className="treegar-card p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-lg font-medium text-white">Loading transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold"><span className="text-gradient-cyan">COMPANY TRANSACTIONS</span></h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">WALLET TRANSACTION HISTORY</p>
        </div>
        <div className="treegar-card p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Error Loading Transactions</h3>
            <p className="text-gray-400">{error?.message || 'Something went wrong'}</p>
          </div>
          <button onClick={() => refetch()} className="btn-treegar-primary">Try Again</button>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold"><span className="text-gradient-cyan">COMPANY TRANSACTIONS</span></h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">WALLET TRANSACTION HISTORY</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSweepResult(null); setShowSweepModal(true); }}
            className="btn-treegar-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>SWEEP FUNDS</span>
          </button>
          <div className="flex flex-col items-start">
            <p className="text-gray-400 text-sm">Wallet</p>
            <p className="text-primary-500 font-medium">management</p>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      {balanceCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {balanceCards.map((account, i) => (
            <div key={i} className="treegar-card-hover p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{account.type} Wallet</h3>
                  <p className="text-sm text-gray-400">Account: {account.accountNumber}</p>
                </div>
                <div className="p-3 bg-primary-500/10 rounded-lg">
                  <span className="text-2xl">{account.type === 'Collection' ? '📥' : '📤'}</span>
                </div>
              </div>
              {account.error ? (
                <p className="text-red-400 text-sm">Error: {account.error}</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-neon-cyan">
                    {formatAmount(account.availableBalance, account.currency)}
                  </p>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => refetchProfile()}
                  disabled={profileLoading}
                  className="text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <svg className={`w-4 h-4 ${profileLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Transactions', value: stats.totalTransactions.toLocaleString(), sub: 'All time records', subColor: 'text-blue-400', icon: '💳', bg: 'bg-primary-500/10' },
          { label: 'Credits', value: stats.creditCount, sub: 'Incoming payments', subColor: 'text-green-400', icon: '↗', bg: 'bg-green-500/10' },
          { label: 'Debits', value: stats.debitCount, sub: 'Outgoing payments', subColor: 'text-red-400', icon: '↘', bg: 'bg-red-500/10' },
          { label: 'Volume', value: formatAmount(stats.totalVolume), sub: 'Current page total', subColor: 'text-blue-400', icon: '💰', bg: 'bg-secondary-500/10' },
        ].map((s, i) => (
          <div key={i} className="treegar-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-neon-cyan mt-2">{s.value}</p>
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
          <h3 className="text-lg font-semibold text-white">Wallet Transaction History</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages} • {totalCount} total
            </span>
            <button onClick={() => refetch()} className="text-primary-500 hover:text-primary-400 transition-colors" title="Refresh">
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
                {['ID', 'Reference', 'Type', 'Direction', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {transactions.map((tx) => {
                const dirStyle = getDirectionStyle(tx.direction);
                const statusStyle = getStatusStyle(tx.status);
                const { date, time } = formatDate(tx.createdAt);
                return (
                  <tr key={tx.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white font-medium">#{tx.id}</span>
                      {tx.walletId && <p className="text-xs text-gray-400">Wallet {tx.walletId}</p>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-mono text-gray-300 max-w-[200px] truncate" title={tx.reference}>{tx.reference}</p>
                      {tx.relatedReference && (
                        <p className="text-xs text-gray-500 font-mono truncate" title={tx.relatedReference}>↳ {tx.relatedReference}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{tx.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${dirStyle.bg} ${dirStyle.text} ${dirStyle.border}`}>
                        <span className="mr-1">{dirStyle.icon}</span>{tx.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${tx.direction?.toLowerCase() === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {formatAmount(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white">{date}</p>
                      <p className="text-xs text-gray-400">{time}</p>
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
              onChange={e => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
              className="bg-dark-700 border border-dark-600 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-primary-500"
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
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
                  <button key={p} onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${p === currentPage ? 'bg-primary-500 text-dark-900 font-medium' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
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

      {/* Sweep Modal */}
      <SweepModal
        isOpen={showSweepModal}
        onClose={() => { setShowSweepModal(false); setSweepResult(null); }}
        onSweep={handleSweep}
        isLoading={isSweeping}
        result={sweepResult}
        balanceCards={balanceCards}
        formatAmount={formatAmount}
      />
    </div>
  );
};

export default CompanyTransactions;