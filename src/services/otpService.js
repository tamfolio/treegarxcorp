const API_BASE_URL = 'https://treegar-accounts-api.treegar.com:8443/api/company'
const API_KEY = 'treegaristhePnce@@!!!9801'

// OTP Service class
class OTPService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Generic API request method
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
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
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.')
      }
      throw error
    }
  }

  // Verify 2FA code
  async verify2FA(challengeId, code, email) {
    if (!challengeId || !code || !email) {
      throw new Error('Challenge ID, verification code, and email are required')
    }

    if (code.length !== 6) {
      throw new Error('Verification code must be 6 digits')
    }

    return await this.apiRequest('/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        email: email,
        otpCode: code.toString(),
        challengeId: challengeId,
      }),
    })
  }

  // Resend OTP
  async resendOTP(challengeId) {
    if (!challengeId) {
      throw new Error('Challenge ID is required')
    }

    return await this.apiRequest('/auth/resend-2fa', {
      method: 'POST',
      body: JSON.stringify({
        challengeId,
      }),
    })
  }

  // Get OTP session info
  getOTPData() {
    try {
      const otpData = sessionStorage.getItem('otpData')
      return otpData ? JSON.parse(otpData) : null
    } catch (error) {
      console.error('Error parsing OTP data:', error)
      return null
    }
  }

  // Store OTP data temporarily
  setOTPData(data) {
    try {
      sessionStorage.setItem('otpData', JSON.stringify(data))
    } catch (error) {
      console.error('Error storing OTP data:', error)
    }
  }

  // Clear OTP data
  clearOTPData() {
    try {
      sessionStorage.removeItem('otpData')
      localStorage.removeItem('twoFactorChallengeId')
    } catch (error) {
      console.error('Error clearing OTP data:', error)
    }
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return '***-***-****'
    
    // Simple phone number masking
    if (phone.length >= 10) {
      return phone.replace(/(\d{3})\d{3}(\d{4})/, '$1-***-$2')
    }
    return phone.replace(/\d(?=\d{4})/g, '*')
  }

  // Format email for display
  formatEmail(email) {
    if (!email) return '***@***'
    
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) return '***@***'
    
    // Show first 3 characters and last part after @
    const maskedLocal = localPart.length > 3 
      ? localPart.substring(0, 3) + '***' 
      : localPart.substring(0, 1) + '***'
    
    return `${maskedLocal}@${domain}`
  }

  // Generate masked contact info based on delivery channel
  getMaskedContact(email, phone, deliveryChannel) {
    switch (deliveryChannel?.toLowerCase()) {
      case 'email':
        return this.formatEmail(email)
      case 'sms':
      case 'phone':
        return this.formatPhoneNumber(phone)
      default:
        return this.formatEmail(email) // Default to email if unknown
    }
  }

  // Validate OTP code
  isValidOTPCode(code) {
    if (!code) return false
    const cleanCode = code.toString().replace(/\D/g, '')
    return cleanCode.length === 6
  }

  // Calculate time remaining for OTP expiry
  getTimeRemaining(expiresAt) {
    if (!expiresAt) return 0
    
    try {
      const expiry = new Date(expiresAt)
      const now = new Date()
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
      return remaining
    } catch (error) {
      console.error('Error calculating time remaining:', error)
      return 0
    }
  }

  // Format time remaining as MM:SS
  formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

// Create and export singleton instance
const otpService = new OTPService()
export default otpService

// Export class for testing or direct instantiation
export { OTPService }