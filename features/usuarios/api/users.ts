import { apiRequest } from '@/lib/api/client'
import type { CreateUserRequest, ManagedUser, UpdateUserRequest, UserStatus } from '../types'

export function getUsers() { return apiRequest<ManagedUser[]>('/api/v1/usuarios', { authenticated: true }) }
export function createUser(body: CreateUserRequest) { return apiRequest<ManagedUser>('/api/v1/usuarios', { method: 'POST', body, authenticated: true }) }
export function updateUser(id: number, body: UpdateUserRequest) { return apiRequest<ManagedUser>(`/api/v1/usuarios/${id}`, { method: 'PUT', body, authenticated: true }) }
export function changeUserStatus(id: number, estado: UserStatus) { return apiRequest<ManagedUser>(`/api/v1/usuarios/${id}/estado`, { method: 'PATCH', body: { estado }, authenticated: true }) }
