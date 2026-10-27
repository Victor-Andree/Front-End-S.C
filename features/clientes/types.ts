export type Client = {
  clienteId: number
  personaId: number
  nombre: string
  apellidos: string
  dni: string
  correo: string
  telefono: string
  fechaRegistro: string
}

export type CreateClientRequest = {
  nombre: string
  apellidos: string
  dni: string
  correo: string
  telefono: string
}
