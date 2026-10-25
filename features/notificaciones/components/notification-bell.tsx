'use client'

import { Bell, Clock3, Package, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { useNotifications } from '../context/notifications-context'

export function NotificationBell({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { notifications, isLoading, error, refresh } = useNotifications()
  const details = useRef<HTMLDetailsElement>(null)

  return (
    <details className={`notification-bell notification-bell-${variant}`} ref={details}>
      <summary className="icon-button" aria-label={`Notificaciones: ${notifications.length}`}>
        <Bell />
        {notifications.length > 0 && <span className="notification-count">{notifications.length > 9 ? '9+' : notifications.length}</span>}
      </summary>
      <div className="notification-popover">
        <div className="notification-heading">
          <span><b>Notificaciones</b><small>Se actualizan cada minuto</small></span>
          <button aria-label="Actualizar notificaciones" disabled={isLoading} onClick={() => void refresh()}><RotateCw className={isLoading ? 'spin' : ''} /></button>
        </div>
        {error && <p className="notification-error">{error}</p>}
        {!isLoading && notifications.length === 0 && <p className="notification-empty">No hay alertas pendientes.</p>}
        <div className="notification-list">
          {notifications.map((notification) => {
            const Icon = notification.kind === 'stock' ? Package : Clock3
            return (
              <Link key={notification.id} href={notification.href} onClick={() => details.current?.removeAttribute('open')}>
                <span className={`notification-icon notification-${notification.kind}`}><Icon /></span>
                <span><b>{notification.title}</b><small>{notification.detail}</small></span>
              </Link>
            )
          })}
        </div>
      </div>
    </details>
  )
}
