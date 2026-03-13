import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const AUTH_KEY = 'eid_auth_v1'
const VALID_USER = 'testuser'
const VALID_PASS = 'Test123'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === '1'
  })

  const login = useCallback((username, password) => {
    if (username === VALID_USER && password === VALID_PASS) {
      localStorage.setItem(AUTH_KEY, '1')
      setIsAuthenticated(true)
      return { success: true }
    }
    return { success: false, error: 'Invalid username or password' }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
