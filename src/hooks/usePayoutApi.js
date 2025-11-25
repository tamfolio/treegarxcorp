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

// Hook to fetch paginated payouts
export const usePayouts = (currentPage = 1, pageSize = 20) => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['payouts', currentPage, pageSize],
    queryFn: async () => {
      const response = await apiCall(`/payouts?page=${currentPage}&pageSize=${pageSize}`, token);
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

// Hook to fetch single payout details
export const usePayout = (payoutId) => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['payout', payoutId],
    queryFn: async () => {
      const response = await apiCall(`/payouts/${payoutId}`, token);
      return response.data;
    },
    enabled: isAuthenticated && !!token && !!payoutId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch provider banks list
export const useProviderBanks = () => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ['provider-banks'],
    queryFn: async () => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Provider banks uses a different endpoint (Admin) and requires x-api-key
      const response = await fetch(
        'https://treegar-accounts-api.treegar.com:8443/api/company/payouts/provider-banks',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': token, // Provider banks endpoint requires x-api-key
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch provider banks');
      }

      return data.data;
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes - banks don't change often
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to resolve account details
export const useResolveAccount = () => {
  const { isAuthenticated, token } = useAuth();

  return useMutation({
    mutationFn: async ({ accountNumber, bankCode }) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      
      const response = await apiCall('/payouts/resolve-account', token, {
        method: 'POST',
        body: JSON.stringify({ accountNumber, bankCode }),
      });
      return response;
    },
    onError: (error) => {
      console.error('Account resolution failed:', error);
    },
  });
};

// Hook to create a new payout
export const useCreatePayout = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  
  return useMutation({
    mutationFn: async (payoutData) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await apiCall('/payouts', token, {
        method: 'POST',
        body: JSON.stringify(payoutData),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch payouts data
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (error) => {
      console.error('Payout creation failed:', error);
    },
  });
};

// Hook to approve a payout
export const useApprovePayout = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  
  return useMutation({
    mutationFn: async (payoutId) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await apiCall(`/payouts/${payoutId}/approve`, token, {
        method: 'POST',
      });
      return response.data;
    },
    onSuccess: (data, payoutId) => {
      // Invalidate and refetch payouts data
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout', payoutId] });
    },
    onError: (error) => {
      console.error('Payout approval failed:', error);
    },
  });
};

// Hook to reject a payout - Updated to accept reason
export const useRejectPayout = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  
  return useMutation({
    mutationFn: async ({ payoutId, reason }) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await apiCall(`/payouts/${payoutId}/reject`, token, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return response.data;
    },
    onSuccess: (data, { payoutId }) => {
      // Invalidate and refetch payouts data
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout', payoutId] });
    },
    onError: (error) => {
      console.error('Payout rejection failed:', error);
    },
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

export const getApprovalStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
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
    case "rejected":
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