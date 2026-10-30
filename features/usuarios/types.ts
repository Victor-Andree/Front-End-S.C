export type UserRole = 'ADMIN' | 'ASISTENTE'
export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'
export type ManagedUser = { usuarioId: number; personaId: number; nombre: string; apellidos: string; dni: string; correo: string; telefono: string; username: string; rol: UserRole; estado: UserStatus; fechaRegistro: string }
export type CreateUserRequest = Omit<ManagedUser, 'usuarioId' | 'personaId' | 'estado' | 'fechaRegistro'> & { password: string }
export type UpdateUserRequest = Omit<CreateUserRequest, 'password'> & { password?: string; estado: UserStatus }
