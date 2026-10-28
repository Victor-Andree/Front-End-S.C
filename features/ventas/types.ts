import type { Product } from '@/features/productos/types'

export type SaleCartItem = { product: Product; qty: number }

export type SaleRequest = {
  clienteId: number
  detalles: Array<{ productoId: number; cantidad: number }>
  tipoComprobante?: string
  observacion?: string
  metodoPago?: PaymentMethod
  cajaId?: number
}

export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'TRANSFERENCIA'

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
  metodoPago: PaymentMethod | 'NO_REGISTRADO'
  estadoDevolucionCaja?: 'PENDIENTE' | 'APLICADA' | null
}
