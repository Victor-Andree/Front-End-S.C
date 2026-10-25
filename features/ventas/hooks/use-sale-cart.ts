'use client'

import { useProducts } from '@/features/productos/hooks/use-products'
import { useMemo, useState } from 'react'
import type { SaleCartItem } from '../types'

export function useSaleCart() {
  const { products, isLoading, error, reload } = useProducts()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [cart, setCart] = useState<Record<number, number>>({})
  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(products.map((product) => product.category))).sort()],
    [products],
  )
  const visible = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) &&
        (category === 'Todos' || product.category === category),
      ),
    [category, products, query],
  )
  const add = (id: number) =>
    setCart((current) => {
      const product = products.find((item) => item.id === id)
      if (!product) return current
      const quantity = current[id] || 0
      if (quantity >= product.stock) return current
      return { ...current, [id]: quantity + 1 }
    })
  const remove = (id: number) =>
    setCart((current) => {
      const next = { ...current }
      if (next[id] > 1) next[id]--
      else delete next[id]
      return next
    })
  const items: SaleCartItem[] = Object.entries(cart).flatMap(([id, qty]) => {
    const product = products.find((product) => product.id === Number(id))
    return product ? [{ product, qty }] : []
  })
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  )
  const clear = () => setCart({})
  return {
    query,
    setQuery,
    category,
    setCategory,
    categories,
    visible,
    add,
    remove,
    items,
    total,
    isLoading,
    error,
    reload,
    clear,
  }
}
