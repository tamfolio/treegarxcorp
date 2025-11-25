import { useState, useMemo } from "react";
import { 
  formatDate, 
  getAuditResultStyle,
  parseUserAgent,
  maskIpAddress 
} from "../hooks/useUsersApi";

const AuditLogsModal = ({ isOpen, onClose, auditLogs = [], isLoading }) => {
  const [filter, setFilter] = useState("all"); // all, success, failure, two_factor
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first, asc = oldest first

  // Filter and sort audit logs
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = auditLogs;

    // Apply status filter
    if (filter !== "all") {
      filtered = auditLogs.filter(log => {
        switch (filter) {
          case "success":
            return log.isSuccessful && (log.result === "success" || log.result === "two_factor_success");
          case "failure":
            return !log.isSuccessful;
          case "two_factor":
            return log.result.includes("two_factor");
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm) ||
        log.result?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.failureReason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by timestamp
    return filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [auditLogs, filter, searchTerm, sortOrder]);

  // Statistics from filtered logs
  const stats = useMemo(() => {
    return {
      total: filteredAndSortedLogs.length,
      successful: filteredAndSortedLogs.filter(log => log.isSuccessful).length,
      failed: filteredAndSortedLogs.filter(log => !log.isSuccessful).length,
      twoFactor: filteredAndSortedLogs.filter(log => log.result.includes("two_factor")).length,
    };
  }, [filteredAndSortedLogs]);

  // Get unique users from logs
  const uniqueUsers = useMemo(() => {
    const users = new Set();
    auditLogs.forEach(log => {
      if (log.email) users.add(log.email);
    });
    return Array.from(users);
  }, [auditLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="treegar-card p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              User Audit Logs
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Track user login attempts and system access
            </p>
          </div>
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

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm text-gray-400">Total Logs</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm text-gray-400">Successful</p>
                <p className="text-xl font-bold text-green-400">{stats.successful}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-xl font-bold text-red-400">{stats.failed}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="text-sm text-gray-400">2FA Events</p>
                <p className="text-xl font-bold text-blue-400">{stats.twoFactor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-700/30 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-dark-700 border border-dark-600 text-white text-sm rounded px-3 py-1 focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All Events</option>
                  <option value="success">Successful Only</option>
                  <option value="failure">Failed Only</option>
                  <option value="two_factor">2FA Events</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400">Sort:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-dark-700 border border-dark-600 text-white text-sm rounded px-3 py-1 focus:outline-none focus:border-primary-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-dark-700 border border-dark-600 text-white text-sm rounded pl-8 pr-3 py-2 focus:outline-none focus:border-primary-500 w-64"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
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
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Active Users Count */}
          <div className="mt-3 pt-3 border-t border-dark-600">
            <p className="text-xs text-gray-400">
              Showing logs for {uniqueUsers.length} unique user{uniqueUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Audit Logs Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <svg
                className="animate-spin h-6 w-6 text-primary-500"
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
              <span className="text-white">Loading audit logs...</span>
            </div>
          </div>
        ) : filteredAndSortedLogs.length > 0 ? (
          <div className="bg-dark-700/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {filteredAndSortedLogs.map((log) => {
                    const auditResultStyle = getAuditResultStyle(log.result, log.isSuccessful);
                    const { browser, os } = parseUserAgent(log.userAgent);
                    const logDate = formatDate(log.timestamp);

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-dark-600/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {log.email?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{log.email}</p>
                              <p className="text-xs text-gray-400">User ID: {log.companyUserId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${auditResultStyle.bg} ${auditResultStyle.text} ${auditResultStyle.border}`}
                            >
                              {log.result.replace(/_/g, " ")}
                            </span>
                            {log.failureReason && (
                              <p className="text-xs text-red-400">{log.failureReason}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-white">{browser}</p>
                            <p className="text-gray-400 text-xs">{os}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-white font-mono">{maskIpAddress(log.ipAddress)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-white">{logDate.date}</p>
                            <p className="text-gray-400 text-xs">{logDate.time}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-dark-700/30 rounded-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filter !== "all" ? "No Matching Logs" : "No Audit Logs"}
              </h3>
              <p className="text-sm">
                {searchTerm || filter !== "all" 
                  ? "Try adjusting your search criteria or filters" 
                  : "No user activity has been recorded yet"}
              </p>
            </div>
            {(searchTerm || filter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="btn-treegar-outline text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-dark-600">
          <div className="text-sm text-gray-400">
            {filteredAndSortedLogs.length > 0 && (
              <>Showing {filteredAndSortedLogs.length} of {auditLogs.length} total logs</>
            )}
          </div>
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

export default AuditLogsModal;