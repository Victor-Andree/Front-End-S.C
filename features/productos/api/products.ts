import { apiRequest } from '@/lib/api/client'
import type { ProductRequest, ProductResponse, ProductCategory } from '../types'

export function getProductCategories() {
  return apiRequest<ProductCategory[]>('/api/v1/tiposproducto', { authenticated: true })
}

export function saveProduct(product: ProductRequest, id?: number) {
  return apiRequest<ProductResponse>(`/api/v1/productos${id === undefined ? '' : `/${id}`}`, {
    authenticated: true,
    method: id === undefined ? 'POST' : 'PUT',
    body: product,
  })
}
