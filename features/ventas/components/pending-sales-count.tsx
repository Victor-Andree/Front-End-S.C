'use client'

import { useEffect, useState } from 'react'
import { getPendingSales } from '../api/sales'

export function PendingSalesCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    getPendingSales().then((sales) => setCount(sales.length)).catch(() => setCount(null))
  }, [])

  return <strong>{count ?? '—'}</strong>
}
