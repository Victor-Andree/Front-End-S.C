import { apiRequest } from '@/lib/api/client'
import type { Product, ProductResponse, StockResponse } from '../types'

export async function getProducts({ includeInactive = false } = {}): Promise<Product[]> {
  const [products, stocks] = await Promise.all([
    apiRequest<ProductResponse[]>('/api/v1/productos', { authenticated: true }),
    apiRequest<StockResponse[]>('/api/v1/stocks', { authenticated: true }),
  ])

  const stockByProduct = new Map(
    stocks.map((stock) => [stock.productoId, stock.cantidadActual]),
  )

  return products
    .filter((product) => includeInactive || product.estadoProducto === 'ACTIVO')
    .map((product) => ({
      id: product.productoId,
      name: product.nombre,
      category: product.tipoProductoNombre,
      price: product.precioVenta,
      stock: stockByProduct.get(product.productoId) ?? 0,
      min: product.stockMinimo,
      description: product.descripcion,
      categoryId: product.tipoProductoId,
      status: product.estadoProducto,
    }))
}
