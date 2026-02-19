import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

// Base API configuration
const API_BASE = "https://treegar-accounts-api.treegar.com:8443/api/company";

// Helper function for authenticated API calls
const apiCall = async (url, token, options = {}) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
};

// Hook to fetch paginated business payouts
// In useBusinessPayoutApi.js
export const useBusinessPayouts = (
  currentPage = 1,
  pageSize = 20,
  status = ""
) => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ["business-payouts", currentPage, pageSize, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        pageSize: pageSize,
        ...(status && { status }), // only add status if not empty
      });
      const response = await apiCall(`/business-payouts?${params}`, token);
      return response.data;
    },
    enabled: isAuthenticated && !!token,
    keepPreviousData: true,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("401") ||
        error?.message?.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch single business payout details
export const useBusinessPayout = (payoutId) => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ["business-payout", payoutId],
    queryFn: async () => {
      const response = await apiCall(`/business-payouts/${payoutId}`, token);
      return response.data;
    },
    enabled: isAuthenticated && !!token && !!payoutId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("401") ||
        error?.message?.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to search business payout by reference
export const useBusinessPayoutByReference = (reference, options = {}) => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ["business-payout-reference", reference],
    queryFn: async () => {
      const response = await apiCall(
        `/business-payouts/reference/${reference}`,
        token
      );
      return response.data;
    },
    enabled:
      isAuthenticated &&
      !!token &&
      !!reference &&
      reference.trim().length > 0 &&
      options.enabled !== false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("401") ||
        error?.message?.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};

// Utility functions for formatting
export const formatCurrency = (amount, currency = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return { date: "N/A", time: "N/A", full: "N/A" };

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

export const getStatusStyle = (status) => {
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
    case "rejected":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
      };
    case "reversed":
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/30",
      };
    case "cancelled":
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-400",
        border: "border-gray-500/30",
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-400",
        border: "border-gray-500/30",
      };
  }
};

// Business Payouts API service object (for consistency with your other services)
export const businessPayoutsService = {
  getBusinessPayouts: async (page = 1, pageSize = 20, token) => {
    const response = await apiCall(
      `/business-payouts?page=${page}&pageSize=${pageSize}`,
      token
    );
    return response.data;
  },

  getBusinessPayout: async (payoutId, token) => {
    const response = await apiCall(`/business-payouts/${payoutId}`, token);
    return response.data;
  },

  searchBusinessPayoutByReference: async (reference, token) => {
    const response = await apiCall(
      `/business-payouts/reference/${reference}`,
      token
    );
    return response.data;
  },
};

export default businessPayoutsService;
