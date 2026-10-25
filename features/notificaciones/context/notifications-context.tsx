'use client'

import { getProducts } from '@/features/productos/api/get-products'
import { getPendingSales } from '@/features/ventas/api/sales'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type AppNotification = {
  id: string
  title: string
  detail: string
  href: string
  kind: 'stock' | 'sale'
}

type NotificationsContextValue = {
  notifications: AppNotification[]
  isLoading: boolean
  error: string
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)
export const NOTIFICATIONS_REFRESH_EVENT = 'nexo:notifications-refresh'

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const [productsResult, salesResult] = await Promise.allSettled([
      getProducts(),
      getPendingSales(),
    ])
    const next: AppNotification[] = []

    if (productsResult.status === 'fulfilled') {
      productsResult.value
        .filter((product) => product.stock <= product.min)
        .forEach((product) => next.push({
          id: `stock-${product.id}`,
          kind: 'stock',
          title: `${product.name} necesita reposición`,
          detail: `${product.stock} disponibles · mínimo ${product.min}`,
          href: '/inventario',
        }))
    }

    if (salesResult.status === 'fulfilled' && salesResult.value.length > 0) {
      next.push({
        id: 'pending-sales',
        kind: 'sale',
        title: `${salesResult.value.length} venta${salesResult.value.length === 1 ? '' : 's'} pendiente${salesResult.value.length === 1 ? '' : 's'}`,
        detail: 'Reservas que necesitan confirmación o anulación.',
        href: '/ventas/pendientes',
      })
    }

    setNotifications(next)
    setError(
      productsResult.status === 'rejected' || salesResult.status === 'rejected'
        ? 'Algunas alertas no pudieron actualizarse.'
        : '',
    )
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const interval = window.setInterval(() => void refresh(), 60_000)
    const handleRefresh = () => void refresh()
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh)
    }
  }, [refresh])

  const value = useMemo(
    () => ({ notifications, isLoading, error, refresh }),
    [notifications, isLoading, error, refresh],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used inside NotificationsProvider')
  return context
}
