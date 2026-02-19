import React from 'react';
import { use401Tracking } from '../hooks/use401Tracking';

const UnauthorizedErrorDashboard = ({ isOpen, onClose }) => {
  const { stats, errorLog, isLoading, refreshData, clearLog } = use401Tracking();

  if (!isOpen) return null;

  const getErrorTypeColor = (type) => {
    const colors = {
      'TOKEN_EXPIRED': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      'TOKEN_INVALID': 'text-red-400 bg-red-500/10 border-red-500/20',
      'TOKEN_MISSING': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'PAYOUT_VALIDATION': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'REFRESH_TOKEN_FAILED': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'SESSION_EXPIRED': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      'GENERIC_401': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    };
    return colors[type] || colors.GENERIC_401;
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getHealthStatus = () => {
    if (!stats) return { color: 'text-gray-400', status: 'Unknown' };
    
    if (stats.lastHour === 0) {
      return { color: 'text-green-400', status: 'Healthy' };
    } else if (stats.lastHour <= 2) {
      return { color: 'text-yellow-400', status: 'Warning' };
    } else {
      return { color: 'text-red-400', status: 'Critical' };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden border border-dark-600">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-600">
          <div>
            <h2 className="text-2xl font-bold">
              <span className="text-gradient-cyan">401 ERROR </span>
              <span className="text-gradient-purple">MONITORING</span>
            </h2>
            <p className="text-primary-500 text-sm mt-1">
              Authentication & Authorization Error Tracking
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-primary-400"
              title="Refresh Data"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-medium text-white">Loading error data...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="treegar-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase">Auth Health</p>
                      <p className={`text-2xl font-bold mt-2 ${healthStatus.color}`}>
                        {healthStatus.status}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Current status</p>
                    </div>
                    <div className="p-3 bg-primary-500/10 rounded-lg">
                      <span className="text-2xl">🛡️</span>
                    </div>
                  </div>
                </div>

                <div className="treegar-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase">Last Hour</p>
                      <p className="text-2xl font-bold text-neon-cyan mt-2">
                        {stats?.lastHour || 0}
                      </p>
                      <p className="text-xs text-blue-400 mt-1">Recent errors</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <span className="text-2xl">⚡</span>
                    </div>
                  </div>
                </div>

                <div className="treegar-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase">Last 24 Hours</p>
                      <p className="text-2xl font-bold text-neon-cyan mt-2">
                        {stats?.last24Hours || 0}
                      </p>
                      <p className="text-xs text-blue-400 mt-1">Daily errors</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="treegar-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase">Total Tracked</p>
                      <p className="text-2xl font-bold text-neon-cyan mt-2">
                        {stats?.total || 0}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Session: {formatDuration(stats?.sessionDuration || 0)}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Types Breakdown */}
              {stats?.byType && Object.keys(stats.byType).length > 0 && (
                <div className="treegar-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    Error Types Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className={`p-4 rounded-lg border ${getErrorTypeColor(type)}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{type.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-lg">{count}</span>
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {((count / stats.total) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Errors Log */}
              <div className="treegar-card">
                <div className="px-6 py-4 border-b border-dark-600 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Recent 401 Errors</h3>
                  <button
                    onClick={clearLog}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Clear Log
                  </button>
                </div>
                
                {errorLog.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No 401 errors tracked yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-dark-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">URL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Method</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {errorLog.slice(0, 20).map((error) => (
                          <tr key={error.id} className="hover:bg-dark-700/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-white">
                              <div>{new Date(error.timestamp).toLocaleTimeString()}</div>
                              <div className="text-xs text-gray-400">
                                +{formatDuration(error.sessionTime)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getErrorTypeColor(error.errorType)}`}>
                                {error.errorType.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                              <div className="truncate max-w-48" title={error.url}>
                                {error.url.replace(API_CONFIG?.BASE_URL || '', '')}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              <span className="px-2 py-1 bg-dark-600 rounded text-xs">
                                {error.method}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              <div className="space-y-1">
                                {error.tokenPresent ? (
                                  <span className="text-green-400">Token ✓</span>
                                ) : (
                                  <span className="text-red-400">No Token ✗</span>
                                )}
                                {error.isPayoutValidationError && (
                                  <div className="text-blue-400">Payout Validation</div>
                                )}
                                {error.context?.isRefreshFailure && (
                                  <div className="text-purple-400">Refresh Failed</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedErrorDashboard;