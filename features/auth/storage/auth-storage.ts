import type { AuthSession, LoginResponse } from '../types'
import type { Role } from '@/types/role'

const SESSION_KEY = 'nexo.auth.session'

function readTokenClaims(token: string): { role: Role | null; username: string | null } {
  try {
    const payload = token.split('.')[1]
    if (!payload) return { role: null, username: null }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const claims = JSON.parse(atob(normalized)) as { rol?: unknown; sub?: unknown }
    return {
      role: claims.rol === 'ADMIN' || claims.rol === 'ASISTENTE' ? claims.rol : null,
      username: typeof claims.sub === 'string' ? claims.sub : null,
    }
  } catch {
    return { role: null, username: null }
  }
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function createSession(response: LoginResponse): AuthSession {
  const claims = readTokenClaims(response.token)
  return {
    token: response.token,
    username: claims.username ?? response.nombre,
    nombre: response.nombre,
    tokenType: response.token_type,
    // Sistema-Gestion-Comercial returns expires_in in seconds.
    expiresAt: Date.now() + response.expires_in * 1000,
    role: claims.role,
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

    const claims = readTokenClaims(session.token as string)
    return {
      token: session.token as string,
      username:
        typeof session.username === 'string'
          ? session.username
          : claims.username ?? (session.nombre as string),
      nombre: session.nombre as string,
      tokenType: session.tokenType as string,
      expiresAt: session.expiresAt as number,
      role:
        session.role === 'ADMIN' || session.role === 'ASISTENTE'
          ? session.role
          : claims.role,
    }
  } catch {
    clearSession()
    return null
  }
}

export function getToken() {
  return getSession()?.token ?? null
}
