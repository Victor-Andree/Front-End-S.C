export type CashRegister = {
  cajaId: number
  nombre: string
  activa: boolean
  sesionAbierta: boolean
}

export type CashSession = {
  sesionCajaId: number
  cajaId: number
  cajaNombre: string
  estado: 'ABIERTA' | 'CERRADA'
  montoInicial: number
  fechaApertura: string
  usuarioAperturaId: number
  usuarioApertura: string
  saldoEsperado: number | null
  montoContado: number | null
  diferencia: number | null
  fechaCierre: string | null
  usuarioCierreId: number | null
  usuarioCierre: string | null
  observacionCierre: string | null
}

export type CashMovementType = 'INGRESO' | 'EGRESO'

export type CashMovement = {
  movimientoCajaId: number
  sesionCajaId: number
  tipo: CashMovementType
  monto: number
  concepto: string
  fechaMovimiento: string
  usuarioResponsableId: number
  usuarioResponsable: string
  origen: 'MANUAL' | 'VENTA'
  ventaId: number | null
  movimientoOriginalId: number | null
}

export type CashSummary = {
  sesionCajaId: number
  montoInicial: number
  totalIngresos: number
  totalEgresos: number
  saldoProvisional: number
}
