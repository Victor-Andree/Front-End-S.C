import type { AuthSession, LoginResponse } from '../types'

const SESSION_KEY = 'nexo.auth.session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function createSession(response: LoginResponse): AuthSession {
  return {
    token: response.token,
    nombre: response.nombre,
    tokenType: response.token_type,
    // Sistema-Gestion-Comercial returns expires_in in seconds.
    expiresAt: Date.now() + response.expires_in * 1000,
  }
}

export function setSession(session: AuthSession) {
  if (canUseStorage())
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (canUseStorage()) localStorage.removeItem(SESSION_KEY)
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null

  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null

  try {
    const session = JSON.parse(stored) as Partial<AuthSession>
    const valid =
      typeof session.token === 'string' &&
      typeof session.nombre === 'string' &&
      typeof session.tokenType === 'string' &&
      typeof session.expiresAt === 'number'

    if (!valid || (session.expiresAt ?? 0) <= Date.now()) {
      clearSession()
      return null
    }

    return {
      token: session.token as string,
      nombre: session.nombre as string,
      tokenType: session.tokenType as string,
      expiresAt: session.expiresAt as number,
    }
  } catch {
    clearSession()
    return null
  }
}

export function getToken() {
  return getSession()?.token ?? null
}
