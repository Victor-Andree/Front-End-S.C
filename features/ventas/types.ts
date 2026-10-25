import type { Product } from '@/features/productos/types'

export type SaleCartItem = { product: Product; qty: number }

export type SaleRequest = {
  clienteId: number
  detalles: Array<{ productoId: number; cantidad: number }>
  tipoComprobante?: string
  observacion?: string
}

export type SaleResponse = {
  ventaId: number
  usuarioId: number
  usuarioNombre: string
  clienteId: number
  clienteNombre: string
  fechaVenta: string
  total: number
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA'
  comprobante: unknown
  detalles: Array<unknown>
}
