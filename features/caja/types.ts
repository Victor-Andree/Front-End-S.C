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
}

export type CashSummary = {
  sesionCajaId: number
  montoInicial: number
  totalIngresos: number
  totalEgresos: number
  saldoProvisional: number
}
