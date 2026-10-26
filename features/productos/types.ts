export type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  min: number
  description?: string
  categoryId?: number
  status?: 'ACTIVO' | 'INACTIVO'
}

export type ProductCategory = { tipoProductoId: number; nombre: string }

export type ProductRequest = {
  nombre: string
  descripcion: string
  precioVenta: number
  stockMinimo: number
  tipoProductoId: number
  estado: 'ACTIVO' | 'INACTIVO'
  cantidadInicial?: number
}

export type ProductResponse = {
  productoId: number
  nombre: string
  descripcion: string
  precioVenta: number
  stockMinimo: number
  estadoProducto: 'ACTIVO' | 'INACTIVO'
  tipoProductoId: number
  tipoProductoNombre: string
}

export type StockResponse = {
  stockId: number
  productoId: number
  productoNombre: string
  cantidadActual: number
  stockMinimo: number
  fechaActualizacion: string
  estadoStock: string
}
