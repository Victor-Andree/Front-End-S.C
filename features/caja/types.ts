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
