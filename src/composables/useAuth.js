import { ref } from 'vue'

// Simple auth state management
// In production, you'd want to use proper session management or JWT tokens
const isAuthenticated = ref(false)
const authToken = ref(null)

// Check if user is authenticated (checks localStorage for persistence)
export function useAuth() {
  // Initialize from localStorage
  const initAuth = () => {
    const stored = localStorage.getItem('admin_auth')
    if (stored) {
      try {
        const authData = JSON.parse(stored)
        // Simple check - in production, validate token with server
        if (authData.token && authData.expires && new Date(authData.expires) > new Date()) {
          isAuthenticated.value = true
          authToken.value = authData.token
          return true
        } else {
          // Token expired, clear it
          localStorage.removeItem('admin_auth')
        }
      } catch (e) {
        localStorage.removeItem('admin_auth')
      }
    }
    return false
  }

  // Login function
  const login = async (username, password) => {
    // In production, this would make an API call to verify credentials
    // For now, using environment variables or a simple check
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'
    
    if (username === adminUsername && password === adminPassword) {
      // Generate a simple token (in production, use proper JWT)
      const token = btoa(`${username}:${Date.now()}`)
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      authToken.value = token
      isAuthenticated.value = true
      
      // Store in localStorage
      localStorage.setItem('admin_auth', JSON.stringify({
        token,
        expires: expires.toISOString()
      }))
      
      return { success: true }
    } else {
      return { success: false, error: 'Invalid username or password' }
    }
  }

  // Logout function
  const logout = () => {
    isAuthenticated.value = false
    authToken.value = null
    localStorage.removeItem('admin_auth')
  }

  // Check authentication status
  const checkAuth = () => {
    return isAuthenticated.value || initAuth()
  }

  // Initialize on import
  initAuth()

  return {
    isAuthenticated,
    authToken,
    login,
    logout,
    checkAuth,
    initAuth
  }
}





