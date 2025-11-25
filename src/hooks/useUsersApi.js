import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// Base API configuration
const API_BASE = 'https://treegar-accounts-api.treegar.com:8443/api/company';

// Helper function for authenticated API calls
const apiCall = async (url, token, options = {}) => {
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// ============================================================================
// USER MANAGEMENT HOOKS
// ============================================================================

// Hook to fetch paginated users
export const useUsers = (currentPage = 1, pageSize = 20) => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['users', currentPage, pageSize],
    queryFn: async () => {
      const response = await apiCall(`/users?page=${currentPage}&pageSize=${pageSize}`, token);
      return response.data;
    },
    enabled: isAuthenticated && !!token,
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Note: No single user endpoint available - user details come from the users list

// Hook to fetch roles and permissions
export const useRolesAndPermissions = () => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['roles-permissions'],
    queryFn: async () => {
      const response = await apiCall('/users/roles-permissions', token);
      return response.data;
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change often
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch user audit logs
export const useUserAuditLogs = () => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['user-audit-logs'],
    queryFn: async () => {
      const response = await apiCall('/users/audit', token);
      return response.data;
    },
    enabled: isAuthenticated && !!token,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  
  return useMutation({
    mutationFn: async (userData) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await apiCall('/users', token, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User creation failed:', error);
    },
  });
};

// Hook to update user status (activate/deactivate)
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  
  return useMutation({
    mutationFn: async ({ userId, status }) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await apiCall(`/users/${userId}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return response.data;
    },
    onSuccess: (data, { userId }) => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: (error) => {
      console.error('User status update failed:', error);
    },
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format currency amounts
export const formatCurrency = (amount, currency = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-GB"),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    full: date.toLocaleString("en-GB"),
  };
};

// Get user status styling
export const getUserStatusStyle = (status) => {
  switch (status) {
    case 1: // Active
      return {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/30",
        label: "Active",
      };
    case 0: // Inactive
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        label: "Inactive",
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-400",
        border: "border-gray-500/30",
        label: "Unknown",
      };
  }
};

// Get audit result styling
export const getAuditResultStyle = (result, isSuccessful) => {
  if (!isSuccessful) {
    return {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
    };
  }

  switch (result?.toLowerCase()) {
    case "success":
    case "two_factor_success":
      return {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/30",
      };
    case "two_factor_required":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
      };
    case "failed":
    case "failure":
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

// Get role styling
export const getRoleStyle = (roleKey) => {
  switch (roleKey?.toLowerCase()) {
    case "super_admin":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/30",
      };
    case "approver":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/30",
      };
    case "initiator":
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/30",
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-400",
        border: "border-gray-500/30",
      };
  }
};

// Parse user agent for display
export const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: "Unknown", os: "Unknown" };

  let browser = "Unknown";
  let os = "Unknown";

  // Detect browser
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  else if (userAgent.includes("PostmanRuntime")) browser = "Postman";

  // Detect OS
  if (userAgent.includes("Windows NT")) os = "Windows";
  else if (userAgent.includes("Macintosh")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone")) os = "iOS";

  return { browser, os };
};

// Mask IP address for privacy
export const maskIpAddress = (ip) => {
  if (!ip) return "Unknown";
  
  // For IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
  }
  
  // For IPv6 or other formats
  if (ip.length > 6) {
    return ip.substring(0, 6) + "...";
  }
  
  return ip;
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    checks: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    },
  };
};

// Format role names for display
export const formatRoleName = (role) => {
  if (!role) return "";
  return role.name || role.key?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "";
};

// Get permission description
export const getPermissionDescription = (permission) => {
  const descriptions = {
    "accounts.create": "Create new virtual accounts",
    "accounts.view": "View account information and balances",
    "audit.view": "View system audit logs and user activity",
    "payouts.approve": "Approve or reject payout requests",
    "payouts.create": "Create new payout requests",
    "payouts.view": "View payout history and details",
    "transactions.view": "View transaction history and details",
    "users.manage": "Create, edit, and manage user accounts",
  };
  
  return descriptions[permission] || permission;
};