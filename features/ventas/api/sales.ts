import { apiRequest } from '@/lib/api/client'
import type { PaymentMethod, SaleRequest, SaleResponse } from '../types'

export function createSale(request: SaleRequest) {
  return apiRequest<SaleResponse>('/api/v1/ventas', {
    method: 'POST',
    authenticated: true,
    body: request,
  })
}

export function createPendingSale(request: SaleRequest) {
  return apiRequest<SaleResponse>('/api/v1/ventas/pendiente', {
    method: 'POST',
    authenticated: true,
    body: request,
  })
}

export function getPendingSales() {
  return apiRequest<SaleResponse[]>('/api/v1/ventas/pendientes', {
    authenticated: true,
  })
}

export function getSales() {
  return apiRequest<SaleResponse[]>('/api/v1/ventas', {
    authenticated: true,
  })
}

export function confirmSale(id: number, payment: { metodoPago: PaymentMethod; cajaId?: number }) {
  return apiRequest<SaleResponse>(`/api/v1/ventas/${id}/confirmar`, {
    method: 'PUT',
    authenticated: true,
    body: payment,
  })
}

export function cancelSale(id: number, reason: string) {
  const query = new URLSearchParams({ motivo: reason })
  return apiRequest<SaleResponse>(`/api/v1/ventas/${id}/anular?${query}`, {
    method: 'PUT',
    authenticated: true,
  })
}
