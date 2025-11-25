import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  otpData: null,
}

// Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  OTP_REQUIRED: 'OTP_REQUIRED',
  OTP_SUCCESS: 'OTP_SUCCESS',
  OTP_FAILURE: 'OTP_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  SET_LOADING: 'SET_LOADING',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        otpData: null,
      }
    
    case AUTH_ACTIONS.OTP_REQUIRED:
      return {
        ...state,
        isAuthenticated: false,
        otpData: action.payload,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.OTP_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        otpData: null,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.OTP_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        otpData: state.otpData, // Keep OTP data for retry
        isLoading: false,
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session on app start
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('userData')
        const isAuthenticated = localStorage.getItem('isAuthenticated')

        if (token && userData && isAuthenticated === 'true') {
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: {
              isAuthenticated: true,
              user: JSON.parse(userData),
              token,
            },
          })
        } else {
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: {
              isAuthenticated: false,
              user: null,
              token: null,
            },
          })
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        dispatch({
          type: AUTH_ACTIONS.RESTORE_SESSION,
          payload: {
            isAuthenticated: false,
            user: null,
            token: null,
          },
        })
      }
    }

    restoreSession()
  }, [])

  // Auth actions
  const login = (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    return credentials // Return for mutation to handle
  }

  const loginSuccess = (userData) => {
    // Store in localStorage
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: {
        user: userData,
        token: userData.token,
      },
    })
  }

  const loginFailure = () => {
    // Clear localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('twoFactorChallengeId')
    sessionStorage.removeItem('otpData')

    dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE })
  }

  const otpRequired = (otpData) => {
    // Store OTP data in sessionStorage for temporary access
    sessionStorage.setItem('otpData', JSON.stringify(otpData))
    localStorage.setItem('twoFactorChallengeId', otpData.challengeId)

    dispatch({
      type: AUTH_ACTIONS.OTP_REQUIRED,
      payload: otpData,
    })
  }

  const otpSuccess = (userData) => {
    // Store token and token-related data
    if (userData.token) {
      localStorage.setItem('authToken', userData.token)
      
      // Store token expiry information for better session management
      if (userData.expiresAt) {
        localStorage.setItem('tokenExpiresAt', userData.expiresAt)
      }
      if (userData.expiresIn) {
        localStorage.setItem('tokenExpiresIn', userData.expiresIn.toString())
      }
      if (userData.tokenType) {
        localStorage.setItem('tokenType', userData.tokenType)
      }
    }
    
    localStorage.setItem('isAuthenticated', 'true')
    
    // Clear OTP data since authentication is complete
    sessionStorage.removeItem('otpData')
    localStorage.removeItem('twoFactorChallengeId')

    // Get existing user data and merge with new data from OTP response
    const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}')
    const mergedUserData = { 
      ...existingUserData, 
      ...userData,
      // Ensure we keep important fields from the OTP verification response
      id: userData.id || existingUserData.id,
      companyId: userData.companyId || existingUserData.companyId,
      companyName: userData.companyName || existingUserData.companyName,
      firstName: userData.firstName || existingUserData.firstName,
      lastName: userData.lastName || existingUserData.lastName,
      status: userData.status || existingUserData.status,
    }
    localStorage.setItem('userData', JSON.stringify(mergedUserData))

    console.log('OTP Success - Token stored:', {
      token: userData.token ? 'Present' : 'Missing',
      expiresAt: userData.expiresAt,
      expiresIn: userData.expiresIn,
      user: `${userData.firstName} ${userData.lastName}`,
    })

    dispatch({
      type: AUTH_ACTIONS.OTP_SUCCESS,
      payload: {
        user: mergedUserData,
        token: userData.token || state.token,
      },
    })
  }

  const otpFailure = () => {
    dispatch({ type: AUTH_ACTIONS.OTP_FAILURE })
  }

  // Utility function to check if token is expired
  const isTokenExpired = () => {
    const expiresAt = localStorage.getItem('tokenExpiresAt')
    if (!expiresAt) return false
    
    try {
      const expiry = new Date(expiresAt)
      const now = new Date()
      return now >= expiry
    } catch (error) {
      console.error('Error checking token expiry:', error)
      return true // Assume expired if we can't parse
    }
  }

  // Enhanced logout that clears all token data
  const logout = () => {
    // Clear all stored data including token expiry info
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('twoFactorChallengeId')
    localStorage.removeItem('tokenExpiresAt')
    localStorage.removeItem('tokenExpiresIn')
    localStorage.removeItem('tokenType')
    sessionStorage.removeItem('otpData')

    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  const setLoading = (loading) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading })
  }

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    loginSuccess,
    loginFailure,
    otpRequired,
    otpSuccess,
    otpFailure,
    logout,
    setLoading,

    // Utilities
    isTokenExpired,

    // Computed values
    isLoggedIn: state.isAuthenticated && !!state.token && !isTokenExpired(),
    hasOTPData: !!state.otpData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AUTH_ACTIONS }