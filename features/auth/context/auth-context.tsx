'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as requestLogin } from '../api/login'
import {
  clearSession,
  createSession,
  getSession,
  setSession,
} from '../storage/auth-storage'
import type { AuthSession, LoginRequest } from '../types'

type AuthContextValue = {
  session: AuthSession | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, updateSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    updateSession(getSession())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!session) return

    const remaining = session.expiresAt - Date.now()
    if (remaining <= 0) {
      clearSession()
      updateSession(null)
      return
    }

    const timeout = window.setTimeout(
      () => {
        clearSession()
        updateSession(null)
      },
      Math.min(remaining, 2_147_483_647),
    )

    return () => window.clearTimeout(timeout)
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      async login(credentials) {
        const response = await requestLogin(credentials)
        const nextSession = createSession(response)
        setSession(nextSession)
        updateSession(nextSession)
      },
      logout() {
        clearSession()
        updateSession(null)
      },
    }),
    [isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
