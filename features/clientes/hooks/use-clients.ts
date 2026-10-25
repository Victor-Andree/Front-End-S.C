'use client'

import { ApiError } from '@/lib/api/errors'
import { useCallback, useEffect, useState } from 'react'
import { getClients } from '../api/clients'
import type { Client } from '../types'

function getMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403)
    return 'No tienes permisos para consultar clientes.'
  if (error instanceof ApiError && error.status === 0)
    return 'No se pudo conectar con la API.'
  return 'No se pudieron cargar los clientes.'
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      setClients(await getClients())
    } catch (requestError) {
      setError(getMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  function addClient(client: Client) {
    setClients((current) => [...current, client])
  }

  return { clients, isLoading, error, reload, addClient }
}
