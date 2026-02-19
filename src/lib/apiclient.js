import axios from 'axios';

// Direct API configuration (no external config file needed)
const API_CONFIG = {
  BASE_URL: 'https://treegar-accounts-api.treegar.com:8443/api',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// 401 Error Tracking System
class UnauthorizedTracker {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.sessionStartTime = Date.now();
  }

  // Log 401 error with context
  logUnauthorizedError(error, context = {}) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      sessionTime: Date.now() - this.sessionStartTime,
      url: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'unknown',
      status: error.response?.status || 401,
      errorType: this.categorizeError(error, context),
      tokenPresent: !!localStorage.getItem('authToken'),
      refreshTokenPresent: !!localStorage.getItem('refreshToken'),
      isPayoutValidationError: context.isPayoutValidationError || false,
      userAgent: navigator.userAgent,
      errorData: error.response?.data || null,
      context: context,
    };

    this.errorLog.unshift(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console for debugging
    console.group('🚨 401 Unauthorized Error Tracked');
    console.log('Error Type:', errorEntry.errorType);
    console.log('URL:', errorEntry.url);
    console.log('Session Time:', `${Math.round(errorEntry.sessionTime / 1000)}s`);
    console.log('Full Entry:', errorEntry);
    console.groupEnd();

    // Send to analytics if configured
    this.sendToAnalytics(errorEntry);

    return errorEntry;
  }

  // Categorize the type of 401 error
  categorizeError(error, context) {
    if (context.isPayoutValidationError) {
      return 'PAYOUT_VALIDATION';
    }

    const errorMessage = (error.response?.data?.message || '').toLowerCase();
    const url = error.config?.url || '';

    // Token-related errors
    if (errorMessage.includes('token') && errorMessage.includes('expired')) {
      return 'TOKEN_EXPIRED';
    }
    if (errorMessage.includes('token') && errorMessage.includes('invalid')) {
      return 'TOKEN_INVALID';
    }
    if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication required')) {
      return 'TOKEN_MISSING';
    }

    // Session-related errors
    if (errorMessage.includes('session')) {
      return 'SESSION_EXPIRED';
    }

    // Refresh token errors
    if (url.includes('/refresh') || url.includes('/auth/refresh')) {
      return 'REFRESH_TOKEN_FAILED';
    }

    // OTP/PIN validation errors (backup detection)
    if (errorMessage.includes('otp') || errorMessage.includes('pin')) {
      return 'VALIDATION_ERROR';
    }

    return 'GENERIC_401';
  }

  // Send error data to analytics service
  sendToAnalytics(errorEntry) {
    // Only send non-sensitive data to analytics
    const analyticsData = {
      errorType: errorEntry.errorType,
      timestamp: errorEntry.timestamp,
      sessionTime: errorEntry.sessionTime,
      url: errorEntry.url.replace(/\/\d+/g, '/:id'), // Anonymize IDs
      method: errorEntry.method,
      tokenPresent: errorEntry.tokenPresent,
      refreshTokenPresent: errorEntry.refreshTokenPresent,
      isPayoutValidationError: errorEntry.isPayoutValidationError,
    };

    // Example analytics integration (replace with your service)
    try {
      // window.gtag?.('event', 'api_401_error', analyticsData);
      // or send to your custom analytics endpoint
      // fetch('/api/analytics/401-errors', { method: 'POST', body: JSON.stringify(analyticsData) });
      console.log('📊 Analytics data prepared:', analyticsData);
    } catch (err) {
      console.warn('Failed to send 401 analytics:', err);
    }
  }

  // Get error statistics
  getStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentErrors = this.errorLog.filter(e => (now - new Date(e.timestamp).getTime()) < oneHour);
    const dailyErrors = this.errorLog.filter(e => (now - new Date(e.timestamp).getTime()) < oneDay);

    const errorsByType = this.errorLog.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {});

    return {
      total: this.errorLog.length,
      lastHour: recentErrors.length,
      last24Hours: dailyErrors.length,
      byType: errorsByType,
      mostRecent: this.errorLog[0] || null,
      sessionDuration: now - this.sessionStartTime,
    };
  }

  // Get error log (for debugging)
  getErrorLog(limit = 20) {
    return this.errorLog.slice(0, limit);
  }

  // Clear error log
  clearLog() {
    this.errorLog = [];
    console.log('🧹 401 error log cleared');
  }
}

// Create global tracker instance
const unauthorizedTracker = new UnauthorizedTracker();

// Export for external access
window.__unauthorizedTracker = unauthorizedTracker;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const redirectToLogin = () => {
  console.log('🔄 Redirecting to login due to authentication failure');
  
  // Clear all auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('userData');
  
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
  }
};

// Function to check if 401 is from payout validation vs token expiry
const isPayoutValidationError = (error) => {
  const requestUrl = error.config?.url || '';
  const requestData = error.config?.data;
  const errorData = error.response?.data;
  
  console.log('🔍 Analyzing 401 error:', {
    url: requestUrl,
    hasOtpInRequest: requestData?.includes('otpCode') || requestData?.includes('pin'),
    errorData: errorData
  });
  
  // Check if request URL indicates payout/transfer operations
  const payoutEndpoints = [
    '/customer/transfers/payout',
    '/customer/transfers/payout/bulk', 
    '/customer/transfers/p2p',
    '/customer/transfers/queue/',  // for approvals
  ];
  
  const isPayoutRequest = payoutEndpoints.some(endpoint => 
    requestUrl.includes(endpoint)
  );
  
  // Check if request contains OTP/PIN data (indicates validation attempt)
  const hasOtpPinData = requestData && (
    requestData.includes('otpCode') || 
    requestData.includes('otpChallengeId') ||
    requestData.includes('"pin"')
  );
  
  // Check error response for validation-specific messages
  const errorMessage = JSON.stringify(errorData || {}).toLowerCase();
  const validationKeywords = [
    'pin', 'otp', 'invalid', 'incorrect', 'expired', 
    'challenge', 'verification', 'code'
  ];
  
  const hasValidationKeywords = validationKeywords.some(keyword => 
    errorMessage.includes(keyword)
  );
  
  const isValidationError = isPayoutRequest && (hasOtpPinData || hasValidationKeywords);
  
  console.log('📊 Validation error analysis:', {
    isPayoutRequest,
    hasOtpPinData, 
    hasValidationKeywords,
    isValidationError
  });
  
  return isValidationError;
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for tracking
    config.__requestStart = Date.now();
    
    // Log requests in development
    if (import.meta.env?.MODE === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        hasOtpPin: config.data && (
          JSON.stringify(config.data).includes('otpCode') || 
          JSON.stringify(config.data).includes('pin')
        )
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env?.MODE === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        responseTime: `${Date.now() - response.config.__requestStart}ms`,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log errors in development
    if (import.meta.env?.MODE === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        responseTime: error.config?.__requestStart ? `${Date.now() - error.config.__requestStart}ms` : 'unknown',
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Check if this is a payout validation error vs token expiry
      const isValidationError = isPayoutValidationError(error);
      
      // Track the 401 error with context
      unauthorizedTracker.logUnauthorizedError(error, {
        isPayoutValidationError: isValidationError,
        requestDuration: error.config?.__requestStart ? Date.now() - error.config.__requestStart : null,
        wasRetry: !!originalRequest._retry,
        queueLength: failedQueue.length,
      });
      
      if (isValidationError) {
        console.log('❌ Detected payout validation error - NOT attempting token refresh');
        return Promise.reject(error);
      }
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      // If no refresh token, immediately redirect
      if (!refreshToken) {
        console.log('❌ No refresh token available - redirecting to login');
        
        // Track this specific scenario
        unauthorizedTracker.logUnauthorizedError(error, {
          isPayoutValidationError: false,
          noRefreshToken: true,
        });
        
        redirectToLogin();
        return Promise.reject(error);
      }
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('🔄 Token refresh in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      // Mark as retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('🔄 Attempting token refresh for expired token');
        const response = await axios.post(`${API_CONFIG.BASE_URL}/customer/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data.success) {
          const { token, expiresAt } = response.data.data;
          
          // Update stored tokens
          localStorage.setItem('authToken', token);
          if (expiresAt) {
            localStorage.setItem('tokenExpiresAt', expiresAt);
          }
          
          console.log('✅ Token refreshed successfully');
          
          // Process queued requests
          processQueue(null, token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
          
        } else {
          throw new Error('Token refresh failed - invalid response');
        }
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Track refresh failure
        unauthorizedTracker.logUnauthorizedError(refreshError, {
          isPayoutValidationError: false,
          isRefreshFailure: true,
          originalError: error.config?.url,
        });
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Redirect to login
        redirectToLogin();
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Access forbidden - insufficient permissions');
    }
    
    // Handle 500+ Server Errors
    if (error.response?.status >= 500) {
      console.error('❌ Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Export tracker functions for external use
export const get401Stats = () => unauthorizedTracker.getStats();
export const get401Log = (limit) => unauthorizedTracker.getErrorLog(limit);
export const clear401Log = () => unauthorizedTracker.clearLog();

export default apiClient;