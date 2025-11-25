import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI, dashboardAPI } from '../lib/api'
import otpService from '../services/otpService'

// Query Keys - centralized for consistency
export const queryKeys = {
  // Authentication
  profile: ['auth', 'profile'],
  
  // Dashboard
  dashboard: ['dashboard'],
  analytics: (dateRange) => ['analytics', dateRange],
  
  // Transactions
  transactions: (page, pageSize) => ['transactions', { page, pageSize }],
  transaction: (id) => ['transactions', id],
  
  // Accounts
  accounts: (page, pageSize) => ['accounts', { page, pageSize }],
  account: (id) => ['accounts', id],
  
  // Users (for future use)
  users: ['users'],
  user: (id) => ['users', id],
  
  // Reports (for future use)
  reports: ['reports'],
  report: (id) => ['reports', id],
}

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

// Login mutation
export const useLogin = () => {
  const navigate = useNavigate()
  const { loginSuccess, loginFailure, otpRequired } = useAuth()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      if (data.success) {
        // Check if 2FA is required
        if (data.data.requiresTwoFactor && data.data.twoFactorChallengeId) {
          // Store OTP data and transition to OTP state
          const otpData = {
            email: data.data.email,
            challengeId: data.data.twoFactorChallengeId,
            deliveryChannel: data.data.twoFactorDeliveryChannel,
            expiresAt: data.data.twoFactorExpiresAt,
            userData: data.data
          }
          
          otpRequired(otpData)
          navigate('/verify')
        } else {
          // Direct login without 2FA
          loginSuccess(data.data)
          navigate('/dashboard')
        }
      }
    },
    onError: (error) => {
      console.error('Login failed:', error)
      loginFailure()
    },
  })
}

// Verify 2FA mutation
export const useVerify2FA = () => {
  const navigate = useNavigate()
  const { otpSuccess, otpFailure } = useAuth()

  return useMutation({
    mutationFn: ({ challengeId, code, email }) => {
      // Use the authAPI function with the correct parameters
      return authAPI.verify2FA({
        challengeId,
        code,
        email
      })
    },
    onSuccess: (data) => {
      if (data.success) {
        // OTP verification successful
        otpSuccess(data.data || {})
        navigate('/dashboard')
      }
    },
    onError: (error) => {
      console.error('2FA verification failed:', error)
      otpFailure()
    },
  })
}

// Resend OTP mutation
export const useResendOTP = () => {
  return useMutation({
    mutationFn: (challengeId) => otpService.resendOTP(challengeId),
    onSuccess: (data) => {
      console.log('OTP resent successfully:', data)
    },
    onError: (error) => {
      console.error('Resend OTP failed:', error)
    },
  })
}

// Logout mutation
export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  return useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      // Clear auth state and cache regardless of API response
      logout()
      queryClient.clear()
      navigate('/login')
    },
  })
}

// Get current user profile
export const useProfile = () => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: authAPI.getProfile,
    enabled: isAuthenticated && !!token,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (error?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

// Get dashboard overview data
export const useDashboardData = () => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardAPI.getDashboardData,
    enabled: isAuthenticated && !!token,
    // Refetch every 5 minutes for live dashboard
    refetchInterval: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Get analytics data with date range
export const useAnalytics = (dateRange = '7d') => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.analytics(dateRange),
    queryFn: () => dashboardAPI.getAnalytics(dateRange),
    enabled: isAuthenticated && !!token && !!dateRange,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })
}

// ============================================================================
// TRANSACTIONS HOOKS
// ============================================================================

// Get transactions with pagination
export const useTransactions = (page = 1, pageSize = 20) => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.transactions(page, pageSize),
    queryFn: async () => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `https://treegar-accounts-api.treegar.com:8443/api/company/transactions?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transactions')
      }

      return data.data
    },
    enabled: isAuthenticated && !!token,
    keepPreviousData: true, // Keep previous page data while fetching new page
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Get single transaction details
export const useTransaction = (transactionId) => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.transaction(transactionId),
    queryFn: async () => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `https://treegar-accounts-api.treegar.com:8443/api/company/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transaction')
      }

      return data.data
    },
    enabled: isAuthenticated && !!token && !!transactionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// ACCOUNTS HOOKS  
// ============================================================================

// Get accounts with pagination
export const useAccounts = (page = 1, pageSize = 20) => {
  const { isAuthenticated, token } = useAuth()
  
  console.log('useAccounts hook state:', {
    page,
    pageSize,
    isAuthenticated,
    hasToken: !!token,
    tokenLength: token?.length
  })

  return useQuery({
    queryKey: queryKeys.accounts(page, pageSize),
    queryFn: async () => {
      console.log('useAccounts queryFn executing...', { isAuthenticated, hasToken: !!token })
      
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `https://treegar-accounts-api.treegar.com:8443/api/company/accounts?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      console.log('useAccounts API response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('useAccounts API response data:', data)
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch accounts')
      }

      return data.data
    },
    enabled: isAuthenticated && !!token,
    keepPreviousData: true, // Keep previous page data while fetching new page
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      console.log('useAccounts retry:', { failureCount, error: error?.message })
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Get single account details
export const useAccount = (accountId) => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.account(accountId),
    queryFn: async () => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `https://treegar-accounts-api.treegar.com:8443/api/company/accounts/${accountId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch account')
      }

      return data.data
    },
    enabled: isAuthenticated && !!token && !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Create new account mutation
export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated, token } = useAuth()

  return useMutation({
    mutationFn: async (accountData) => {
      if (!token || !isAuthenticated) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        'https://treegar-accounts-api.treegar.com:8443/api/company/accounts',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(accountData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to create account')
      }

      return data.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch accounts queries
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      console.log('Account created successfully:', data)
    },
    onError: (error) => {
      console.error('Account creation failed:', error)
    },
  })
}

// ============================================================================
// OTP UTILITY HOOKS
// ============================================================================

// OTP data hook
export const useOTPData = () => {
  const { otpData } = useAuth()
  
  return {
    otpData,
    hasOTPData: !!otpData,
    challengeId: otpData?.challengeId,
    email: otpData?.email,
    deliveryChannel: otpData?.deliveryChannel,
    expiresAt: otpData?.expiresAt,
    maskedContact: otpData ? otpService.getMaskedContact(
      otpData.email, 
      otpData.phone, 
      otpData.deliveryChannel
    ) : null,
  }
}

// OTP timer hook
export const useOTPTimer = (expiresAt) => {
  const [timeRemaining, setTimeRemaining] = useState(
    otpService.getTimeRemaining(expiresAt)
  )

  useEffect(() => {
    if (!expiresAt) return

    const timer = setInterval(() => {
      const remaining = otpService.getTimeRemaining(expiresAt)
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  return {
    timeRemaining,
    formattedTime: otpService.formatTimeRemaining(timeRemaining),
    isExpired: timeRemaining <= 0,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Auth status hook (enhanced with context)
export const useAuthStatus = () => {
  const auth = useAuth()
  
  return {
    ...auth,
    // Additional computed values
    canAccess2FA: auth.hasOTPData && auth.otpData?.challengeId,
    needsReauth: !auth.isAuthenticated && !auth.hasOTPData,
  }
}

// Auto-refresh token hook
export const useAutoRefresh = () => {
  const queryClient = useQueryClient()
  const { logout } = useAuth()
  
  return useMutation({
    mutationFn: authAPI.refreshToken,
    onSuccess: (data) => {
      if (data.success && data.data?.token) {
        localStorage.setItem('authToken', data.data.token)
        // Invalidate all queries to refetch with new token
        queryClient.invalidateQueries()
      }
    },
    onError: (error) => {
      console.error('Token refresh failed:', error)
      // Handle token refresh failure (logout user)
      logout()
      window.location.href = '/login'
    },
  })
}

// ============================================================================
// FUTURE HOOKS (for when you add more features)
// ============================================================================

// Users management hooks
export const useUsers = (page = 1, limit = 10, search = '') => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: ['users', { page, limit, search }],
    queryFn: async () => {
      // Implement when you have users API
      const response = await fetch(`/api/users?page=${page}&limit=${limit}&search=${search}`)
      return response.json()
    },
    enabled: false, // Disable until you implement the API
    keepPreviousData: true,
  })
}

// Reports hooks
export const useReports = () => {
  const { isAuthenticated, token } = useAuth()

  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: async () => {
      // Implement when you have reports API
      const response = await fetch('/api/reports')
      return response.json()
    },
    enabled: false, // Disable until you implement the API
  })
}