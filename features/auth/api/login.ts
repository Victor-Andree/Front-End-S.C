import { apiRequest } from '@/lib/api/client'
import type { LoginRequest, LoginResponse } from '../types'

export function login(credentials: LoginRequest) {
  return apiRequest<LoginResponse>('/api/v1/authentication/login', {
    method: 'POST',
    body: credentials,
  })
}
