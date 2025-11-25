// API Configuration
const API_BASE_URL = 'https://treegar-accounts-api.treegar.com:8443/api/company'
const API_KEY = 'treegaristhePnce@@!!!9801'

// API Error class for better error handling
export class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError('Network error. Please check your connection.', 0, null)
    }
    
    throw new APIError(error.message, 0, null)
  }
}

// Authentication API functions
export const authAPI = {
  // Login function with API key
  login: async (credentials) => {
    // Try direct fetch to troubleshoot 415 error
    const url = `${API_BASE_URL}/auth/login`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new APIError(
          data.message || `Login failed: ${response.status} ${response.statusText}`,
          response.status,
          data
        )
      }
      
      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      // Log the full error for debugging
      console.error('Login error details:', {
        message: error.message,
        credentials: credentials,
        url: url
      })
      
      throw new APIError(error.message || 'Login request failed', 0, null)
    }
  },

  // Backup login method with form data (if JSON doesn't work)
  loginFormData: async (credentials) => {
    const url = `${API_BASE_URL}/auth/login`
    
    const formData = new FormData()
    formData.append('email', credentials.email)
    formData.append('password', credentials.password)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Accept': 'application/json',
          // Don't set Content-Type for FormData - let browser set it
        },
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new APIError(
          data.message || `Login failed: ${response.status} ${response.statusText}`,
          response.status,
          data
        )
      }
      
      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError(error.message || 'Login request failed', 0, null)
    }
  },

  // Verify 2FA function with API key
  verify2FA: async (verificationData) => {
    const data = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        email: verificationData.email,
        otpCode: verificationData.code,
        challengeId: verificationData.challengeId,
      }),
    })
    return data
  },

  // Resend OTP function
  resendOTP: async (challengeId) => {
    const data = await apiRequest('/auth/resend-2fa', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    })
    return data
  },

  // Refresh token function
  refreshToken: async (refreshToken) => {
    const data = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
    return data
  },

  // Logout function
  logout: async () => {
    const data = await apiRequest('/auth/logout', {
      method: 'POST',
    })
    return data
  },

  // Get current user profile
  getProfile: async () => {
    const data = await apiRequest('/auth/profile', {
      method: 'GET',
    })
    return data
  },
}

// Other API functions can be added here
export const dashboardAPI = {
  // Get dashboard data
  getDashboardData: async () => {
    const data = await apiRequest('/dashboard/overview', {
      method: 'GET',
    })
    return data
  },

  // Get analytics data
  getAnalytics: async (dateRange = '7d') => {
    const data = await apiRequest(`/analytics?range=${dateRange}`, {
      method: 'GET',
    })
    return data
  },
}