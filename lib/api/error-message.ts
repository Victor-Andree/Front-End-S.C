import { ApiError } from './errors'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return fallback
  if (error.status === 0) return 'No se pudo conectar con Spring Boot.'
  if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (error.status === 403) return 'No tienes permisos para realizar esta operación.'

  if (error.body && typeof error.body === 'object') {
    const body = error.body as Record<string, unknown>
    if (typeof body.mensaje === 'string') return body.mensaje
    if (typeof body.message === 'string') return body.message
    if (typeof body.error === 'string' && body.error.length < 180) return body.error
  }
  if (typeof error.body === 'string' && error.body.length < 180) return error.body
  return fallback
}
