'use client'

import { products } from '@/features/productos/data/mock-products'
import { useState } from 'react'
import type { SaleCartItem } from '../types'

export function useSaleCart() {
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<Record<number, number>>({})
  const visible = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  )
  const add = (id: number) =>
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }))
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
  return { query, setQuery, visible, add, remove, items, total }
}
