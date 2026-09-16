import type { Product } from '@/features/productos/types'

export type SaleCartItem = { product: Product; qty: number }
export type PendingSale = {
  id: string
  customer: string
  date: string
  products: string
  total: string
}
