export type SalesReport = {
  desde: string
  hasta: string
  cantidadVentas: number
  ingresosTotales: number
  ticketPromedio: number
  evolucion: Array<{ fecha: string; cantidadVentas: number; ingresos: number }>
  productosMasVendidos: Array<{
    productoId: number
    nombre: string
    unidades: number
    ingresos: number
  }>
}
