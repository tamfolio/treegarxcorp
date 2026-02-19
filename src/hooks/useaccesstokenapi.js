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

// Hook to fetch all access tokens
export const useAccessTokens = () => {
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ["access-tokens"],
    queryFn: async () => {
      const response = await apiCall("/access-tokens", token);
      return response.data;
    },
    enabled: isAuthenticated && !!token,
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

// Hook to create a new access token
export const useCreateAccessToken = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, expiresInDays = -1 }) => {
      const response = await apiCall("/access-tokens", token, {
        method: "POST",
        body: JSON.stringify({
          name,
          expiresInDays
        }),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch access tokens
      queryClient.invalidateQueries({ queryKey: ["access-tokens"] });
    },
    onError: (error) => {
      console.error("Error creating access token:", error);
    },
  });
};

// Hook to delete an access token
export const useDeleteAccessToken = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId) => {
      const response = await apiCall(`/access-tokens/${tokenId}`, token, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch access tokens
      queryClient.invalidateQueries({ queryKey: ["access-tokens"] });
    },
    onError: (error) => {
      console.error("Error deleting access token:", error);
    },
  });
};

// Utility functions for formatting
export const formatTokenDate = (dateString) => {
  if (!dateString) return "Never";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTokenStatusStyle = (isActive) => {
  return isActive
    ? {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/30",
      }
    : {
        bg: "bg-gray-500/10",
        text: "text-gray-400", 
        border: "border-gray-500/30",
      };
};

export const maskToken = (token) => {
  if (!token) return "••••••••••••••••";
  
  // Show first 8 characters and mask the rest
  const visiblePart = token.substring(0, 8);
  const maskedPart = "•".repeat(Math.max(0, token.length - 8));
  return visiblePart + maskedPart;
};

// Access Tokens API service object
export const accessTokensService = {
  getAccessTokens: async (token) => {
    const response = await apiCall("/access-tokens", token);
    return response.data;
  },

  createAccessToken: async (name, expiresInDays = -1, token) => {
    const response = await apiCall("/access-tokens", token, {
      method: "POST",
      body: JSON.stringify({
        name,
        expiresInDays,
      }),
    });
    return response.data;
  },

  deleteAccessToken: async (tokenId, token) => {
    const response = await apiCall(`/access-tokens/${tokenId}`, token, {
      method: "DELETE",
    });
    return response;
  },
};

export default accessTokensService;