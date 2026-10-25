'use client'

import { ApiError } from '@/lib/api/errors'
import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '../api/get-products'
import type { Product } from '../types'

function getMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'No tienes permisos para consultar productos.'
    if (error.status === 0) return 'No se pudo conectar con la API.'
  }
  return 'No se pudieron cargar los productos.'
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      setProducts(await getProducts())
    } catch (requestError) {
      setError(getMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { products, isLoading, error, reload }
}
