export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  nombre: string
  token_type: string
  expires_in: number
}

export type AuthSession = {
  token: string
  nombre: string
  tokenType: string
  expiresAt: number
}
