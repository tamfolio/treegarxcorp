import { useState } from "react";
import { 
  formatDate, 
  getUserStatusStyle, 
  getAuditResultStyle, 
  getRoleStyle,
  parseUserAgent,
  maskIpAddress,
  getPermissionDescription
} from "../hooks/useUsersApi";

const UserDetailsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  isLoading, 
  rolesData,
  onUpdateStatus, 
  updateStatusMutation 
}) => {
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);

  if (!isOpen) return null;

  const handleStatusToggle = async () => {
    if (!user?.id) return;
    
    const newStatus = user.status === 1 ? 0 : 1;
    setConfirmStatusChange(newStatus);
  };

  const confirmStatusUpdate = async () => {
    if (!user?.id || confirmStatusChange === null) return;
    
    try {
      await onUpdateStatus({ userId: user.id, status: confirmStatusChange });
      setConfirmStatusChange(null);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const statusStyle = getUserStatusStyle(user?.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="treegar-card p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            User Details
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
                Loading user details...
              </span>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Header Info */}
            <div className="bg-dark-700/30 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-500">User ID: {user.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    {statusStyle.label}
                  </span>
                  <button
                    onClick={handleStatusToggle}
                    disabled={updateStatusMutation.isPending}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                      user.status === 1 
                        ? "bg-red-900/50 border-red-500/50 text-red-300 hover:bg-red-900/70" 
                        : "bg-green-900/50 border-green-500/50 text-green-300 hover:bg-green-900/70"
                    }`}
                  >
                    {updateStatusMutation.isPending ? "Updating..." : (user.status === 1 ? "Deactivate" : "Activate")}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Change Confirmation */}
            {confirmStatusChange !== null && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-1">
                      Confirm Status Change
                    </h4>
                    <p className="text-xs text-gray-400">
                      Are you sure you want to {confirmStatusChange === 1 ? "activate" : "deactivate"} this user?
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setConfirmStatusChange(null)}
                      className="px-3 py-1 bg-gray-900/50 border border-gray-500/50 text-gray-300 text-sm font-medium rounded hover:bg-gray-900/70 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmStatusUpdate}
                      className="px-3 py-1 bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 text-sm font-medium rounded hover:bg-yellow-900/70 transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {updateStatusMutation.isError && (
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
                      {updateStatusMutation.error?.message || "Status update failed"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="bg-dark-700/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  User Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Full Name</p>
                    <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email Address</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Company ID</p>
                    <p className="text-white">{user.companyId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="text-white">{formatDate(user.createdAt).full}</p>
                  </div>
                </div>
              </div>

              {/* Roles & Permissions */}
              <div className="bg-dark-700/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Roles & Permissions
                </h4>
                
                {/* User Roles */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Assigned Roles</p>
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => {
                        const roleStyle = getRoleStyle(role.key);
                        return (
                          <span
                            key={role.id}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            {role.name}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No roles assigned</p>
                  )}
                </div>

                {/* Available Permissions */}
                {rolesData?.permissions && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">System Permissions</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {rolesData.permissions.map((permission) => (
                        <div key={permission} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs text-white">{permission}</p>
                            <p className="text-xs text-gray-500">{getPermissionDescription(permission)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
              <p className="text-gray-400">
                The requested user details could not be loaded.
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

export default UserDetailsModal;