import { apiRequest } from '@/lib/api/client'
import type { Client, CreateClientRequest } from '../types'

export function getClients() {
  return apiRequest<Client[]>('/api/v1/clientes', { authenticated: true })
}

export function createClient(client: CreateClientRequest) {
  return apiRequest<Client>('/api/v1/clientes', {
    method: 'POST',
    authenticated: true,
    body: client,
  })
}
