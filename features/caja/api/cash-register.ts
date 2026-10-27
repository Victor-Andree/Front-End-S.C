import { apiRequest } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import type { CashRegister, CashSession } from '../types'

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
