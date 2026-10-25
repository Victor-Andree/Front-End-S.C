'use client'

import { Bell, CheckCheck, Clock3, Package, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useNotifications } from '../context/notifications-context'

export function NotificationBell({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { notifications, unreadCount, isLoading, error, refresh, markAllRead, markRead } = useNotifications()
  const details = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (details.current && !details.current.contains(event.target as Node)) {
        details.current.removeAttribute('open')
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') details.current?.removeAttribute('open')
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <details
      className={`notification-bell notification-bell-${variant}`}
      ref={details}
    >
      <summary className="icon-button" aria-label={`${unreadCount} notificaciones sin leer`}>
        <Bell />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </summary>
      <div className="notification-popover">
        <div className="notification-heading">
          <span><b>Notificaciones</b><small>Se actualizan cada minuto</small></span>
          <div className="notification-heading-actions">
            {unreadCount > 0 && <button aria-label="Marcar todas como leídas" title="Marcar todas como leídas" onClick={markAllRead}><CheckCheck /></button>}
            <button aria-label="Actualizar notificaciones" title="Actualizar notificaciones" disabled={isLoading} onClick={() => void refresh()}><RotateCw className={isLoading ? 'spin' : ''} /></button>
          </div>
        </div>
        {error && <p className="notification-error">{error}</p>}
        {!isLoading && notifications.length === 0 && <p className="notification-empty">No hay alertas pendientes.</p>}
        <div className="notification-list">
          {notifications.map((notification) => {
            const Icon = notification.kind === 'stock' ? Package : Clock3
            return (
              <Link key={notification.id} href={notification.href} onClick={() => { markRead(notification); details.current?.removeAttribute('open') }}>
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
