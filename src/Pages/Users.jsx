import { useState } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUserStatus,
  useRolesAndPermissions,
  useUserAuditLogs,
  formatDate,
  getUserStatusStyle,
  getRoleStyle,
  formatRoleName,
} from "../hooks/useUsersApi";
import CreateUserModal from "../Components/CreateUserModal";
import UserDetailsModal from "../Components/UserDetailsModal";
import AuditLogsModal from "../Components/AuditLogsModal";

const Users = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: "",
    roleName: "",
  });

  // Use React Query hooks
  const {
    data: usersData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useUsers(currentPage, pageSize);

  // Roles and permissions data
  const { data: rolesData } = useRolesAndPermissions();

  // Audit logs data
  const { data: auditLogs = [], isLoading: auditLoading } = useUserAuditLogs();

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserStatusMutation = useUpdateUserStatus();

  // Extract data from the users response
  const users = usersData?.items || [];
  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.totalCount || 0;
  const hasNextPage = usersData?.hasNextPage || false;
  const hasPreviousPage = usersData?.hasPreviousPage || false;

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
      !formData.password
    ) {
      return;
    }

    // Prepare payload for API (exclude roleId and roleName if not selected)
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    // Note: Role assignment might need to be handled separately after user creation
    // depending on your API implementation

    createUserMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form and close modal
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          roleId: "",
          roleName: "",
        });
        setShowCreateModal(false);
      },
    });
  };

  // Handle user details view
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  // Handle status update
  const handleUpdateUserStatus = async ({ userId, status }) => {
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  // Quick status toggle from table
  const handleQuickStatusToggle = (user) => {
    const newStatus = user.status === 1 ? 0 : 1;
    handleUpdateUserStatus({ userId: user.id, status: newStatus });
  };

  // Calculate statistics
  const stats = {
    totalUsers: totalCount,
    activeUsers: users.filter((u) => u.status === 1).length,
    inactiveUsers: users.filter((u) => u.status === 0).length,
    superAdmins: users.filter((u) =>
      u.roles?.some((role) => role.key === "super_admin")
    ).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-cyan">USER </span>
              <span className="text-gradient-purple">MANAGEMENT</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              ACCESS CONTROL CENTER
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
              Loading users...
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
              <span className="text-gradient-cyan">USER </span>
              <span className="text-gradient-purple">MANAGEMENT</span>
            </h1>
            <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
              ACCESS CONTROL CENTER
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
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
            <span className="text-gradient-cyan">USER </span>
            <span className="text-gradient-purple">MANAGEMENT</span>
          </h1>
          <p className="text-primary-500 text-sm font-medium mt-1 tracking-wider">
            ACCESS CONTROL CENTER
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Role-based</p>
            <p className="text-primary-500 font-medium">access control</p>
          </div>
          {/* FIXED AUDIT LOGS BUTTON WITH DEBUGGING */}
          <button
  onClick={() => setShowAuditLogsModal(true)}
  className="btn-treegar-primary flex items-center space-x-2 px-4 py-2"
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
      strokeWidth="2"
      d="M3 12h3l2 7 4-14 2 7h5"
    />
  </svg>
  <span className="font-medium tracking-wide">Audit Logs</span>
</button>

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
            <span>CREATE USER</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Total Users
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-blue-400 mt-1">All system users</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Active Users
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.activeUsers}
              </p>
              <p className="text-xs text-green-400 mt-1">Currently active</p>
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
                Inactive Users
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.inactiveUsers}
              </p>
              <p className="text-xs text-red-400 mt-1">Deactivated accounts</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <span className="text-2xl">🚫</span>
            </div>
          </div>
        </div>

        <div className="treegar-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Super Admins
              </p>
              <p className="text-3xl font-bold text-neon-cyan mt-2">
                {stats.superAdmins}
              </p>
              <p className="text-xs text-purple-400 mt-1">Admin privileges</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="treegar-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              User Management
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Roles
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
              {users.map((user) => {
                const statusStyle = getUserStatusStyle(user.status);
                const { date, time } = formatDate(user.createdAt);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </div>
                        <div className="text-sm">
                          <div className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">{user.email}</div>
                        <div className="text-gray-400">
                          Company: {user.companyId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => {
                            const roleStyle = getRoleStyle(role.key);
                            return (
                              <span
                                key={role.id}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                              >
                                {formatRoleName(role)}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">No roles</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {statusStyle.label}
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
                          onClick={() => handleViewDetails(user)}
                          className="text-primary-500 hover:text-primary-400 transition-colors"
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

                        <button
                          onClick={() => handleQuickStatusToggle(user)}
                          disabled={updateUserStatusMutation.isPending}
                          className={`transition-colors disabled:opacity-50 ${
                            user.status === 1
                              ? "text-red-500 hover:text-red-400"
                              : "text-green-500 hover:text-green-400"
                          }`}
                          title={user.status === 1 ? "Deactivate" : "Activate"}
                        >
                          {user.status === 1 ? (
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
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                              />
                            </svg>
                          ) : (
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
                          )}
                        </button>
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

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            roleId: "",
            roleName: "",
          });
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        mutation={createUserMutation}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        user={selectedUser}
        isLoading={false} // No loading since we get user from table data
        rolesData={rolesData}
        onUpdateStatus={handleUpdateUserStatus}
        updateStatusMutation={updateUserStatusMutation}
      />

      {/* Audit Logs Modal with DEBUG INFO */}
      <AuditLogsModal
        isOpen={showAuditLogsModal}
        onClose={() => {
          console.log("🚪 Closing audit logs modal");
          setShowAuditLogsModal(false);
        }}
        auditLogs={auditLogs}
        isLoading={auditLoading}
      />


    </div>
  );
};

export default Users;
