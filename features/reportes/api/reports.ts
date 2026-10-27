import { apiRequest } from '@/lib/api/client'
import { getApiBaseUrl } from '@/lib/api/config'
import { getToken } from '@/features/auth/storage/auth-storage'
import type { SalesReport } from '../types'

function query(desde: string, hasta: string) {
  return new URLSearchParams({ desde, hasta }).toString()
}

export function getSalesReport(desde: string, hasta: string) {
  return apiRequest<SalesReport>(`/api/v1/reportes/ventas?${query(desde, hasta)}`, {
    authenticated: true,
  })
}

export async function downloadSalesReport(desde: string, hasta: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/reportes/ventas.csv?${query(desde, hasta)}`, {
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  })
  if (!response.ok) throw new Error('No se pudo exportar el reporte')
  const url = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `ventas-${desde}-${hasta}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
