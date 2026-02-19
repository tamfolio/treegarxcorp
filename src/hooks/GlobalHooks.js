import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/GlobalApiClient'; // Your global interceptor-enabled API client

/**
 * Global API service functions for all your application endpoints
 * These will ALL benefit from the global 401 interceptor
 */
const globalApiService = {
  // Business Payouts APIs
  businessPayouts: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await apiClient.get(`/business/payouts?${params.toString()}`);
      return response.data;
    },
    
    create: async (payoutData) => {
      const response = await apiClient.post('/business/payouts', payoutData);
      return response.data;
    },
    
    update: async ({ id, ...payoutData }) => {
      const response = await apiClient.put(`/business/payouts/${id}`, payoutData);
      return response.data;
    },
    
    delete: async (id) => {
      const response = await apiClient.delete(`/business/payouts/${id}`);
      return response.data;
    }
  },

  // Company Tokens APIs
  companyTokens: {
    getAll: async () => {
      const response = await apiClient.get('/company/access-tokens');
      return response.data;
    },
    
    create: async (tokenData) => {
      const response = await apiClient.post('/company/access-tokens', tokenData);
      return response.data;
    },
    
    delete: async (id) => {
      const response = await apiClient.delete(`/company/access-tokens/${id}`);
      return response.data;
    }
  },

  // Users APIs
  users: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await apiClient.get(`/users?${params.toString()}`);
      return response.data;
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
    
    create: async (userData) => {
      const response = await apiClient.post('/users', userData);
      return response.data;
    },
    
    update: async ({ id, ...userData }) => {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    }
  },

  // Accounts APIs
  accounts: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await apiClient.get(`/accounts?${params.toString()}`);
      return response.data;
    }
  },

  // Transactions APIs
  transactions: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await apiClient.get(`/transactions?${params.toString()}`);
      return response.data;
    }
  },

  // Payout APIs
  payouts: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await apiClient.get(`/payouts?${params.toString()}`);
      return response.data;
    },
    
    create: async (payoutData) => {
      const response = await apiClient.post('/payouts', payoutData);
      return response.data;
    }
  }
};

/**
 * React Query Hooks - ALL with global 401 protection
 */

// Business Payouts Hooks
export const useBusinessPayouts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['business-payouts', filters],
    queryFn: () => globalApiService.businessPayouts.getAll(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useCreateBusinessPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.businessPayouts.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['business-payouts']);
    },
  });
};

export const useUpdateBusinessPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.businessPayouts.update,
    onSuccess: () => {
      queryClient.invalidateQueries(['business-payouts']);
    },
  });
};

export const useDeleteBusinessPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.businessPayouts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['business-payouts']);
    },
  });
};

// Company Tokens Hooks
export const useCompanyTokens = (options = {}) => {
  return useQuery({
    queryKey: ['company-tokens'],
    queryFn: globalApiService.companyTokens.getAll,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

export const useCreateCompanyToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.companyTokens.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['company-tokens']);
    },
  });
};

export const useDeleteCompanyToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.companyTokens.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['company-tokens']);
    },
  });
};

// Users Hooks
export const useUsers = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => globalApiService.users.getAll(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUser = (id, options = {}) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => globalApiService.users.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.users.update,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['user', variables.id], data);
      queryClient.invalidateQueries(['users']);
    },
  });
};

// Accounts Hooks
export const useAccounts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['accounts', filters],
    queryFn: () => globalApiService.accounts.getAll(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Transactions Hooks
export const useTransactions = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => globalApiService.transactions.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for transactions
    ...options,
  });
};

// Payouts Hooks
export const usePayouts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['payouts', filters],
    queryFn: () => globalApiService.payouts.getAll(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useCreatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalApiService.payouts.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['payouts']);
      queryClient.invalidateQueries(['transactions']);
    },
  });
};

// Export the API service for direct use if needed
export { globalApiService };

export default {
  // Business Payouts
  useBusinessPayouts,
  useCreateBusinessPayout,
  useUpdateBusinessPayout,
  useDeleteBusinessPayout,
  
  // Company Tokens
  useCompanyTokens,
  useCreateCompanyToken,
  useDeleteCompanyToken,
  
  // Users
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  
  // Accounts
  useAccounts,
  
  // Transactions
  useTransactions,
  
  // Payouts
  usePayouts,
  useCreatePayout,
};