import { apiRequest } from '@/lib/api/client'
import type { StockResponse } from '@/features/productos/types'

export function getInventory() {
  return apiRequest<StockResponse[]>('/api/v1/stocks', { authenticated: true })
}

export function registerMovement(productId: number, quantity: number, type: 'INCOME' | 'OUTCOME') {
  const query = new URLSearchParams({ quantity: String(quantity), type })
  return apiRequest<StockResponse>(`/api/v1/stocks/${productId}?${query}`, {
    authenticated: true,
    method: 'PUT',
  })
}

export function adjustInventory(productId: number, realQuantity: number, observation: string) {
  const query = new URLSearchParams({ realQuantity: String(realQuantity) })
  if (observation.trim()) query.set('observation', observation.trim())
  return apiRequest<StockResponse>(`/api/v1/stocks/adjust/${productId}?${query}`, {
    authenticated: true,
    method: 'PATCH',
  })
}
