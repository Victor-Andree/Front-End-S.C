import { apiRequest } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import type { CashMovement, CashMovementType, CashRegister, CashSession, CashSummary } from '../types'

export function getCashRegisters() {
  return apiRequest<CashRegister[]>('/api/v1/cajas', { authenticated: true })
}

export async function getCurrentCashSession(cajaId: number) {
  try {
    return await apiRequest<CashSession>(`/api/v1/cajas/${cajaId}/sesion-actual`, { authenticated: true })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function openCashSession(cajaId: number, montoInicial: number) {
  return apiRequest<CashSession>(`/api/v1/cajas/${cajaId}/aperturas`, {
    authenticated: true,
    method: 'POST',
    body: { montoInicial },
  })
}

export function getCashMovements(sessionId: number) {
  return apiRequest<CashMovement[]>(`/api/v1/cajas/sesiones/${sessionId}/movimientos`, {
    authenticated: true,
  })
}

export function getCashSummary(sessionId: number) {
  return apiRequest<CashSummary>(`/api/v1/cajas/sesiones/${sessionId}/resumen`, {
    authenticated: true,
  })
}

export function createCashMovement(sessionId: number, input: {
  tipo: CashMovementType
  monto: number
  concepto: string
}) {
  return apiRequest<CashMovement>(`/api/v1/cajas/sesiones/${sessionId}/movimientos`, {
    authenticated: true,
    method: 'POST',
    body: input,
  })
}
