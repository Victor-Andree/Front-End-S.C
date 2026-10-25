export type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  min: number
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
