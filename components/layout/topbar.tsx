'use client'

import { usePathname } from 'next/navigation'
import { navigation } from './navigation'
import { UserMenu } from './user-menu'
import { NotificationBell } from '@/features/notificaciones/components/notification-bell'
export function Topbar() {
  const pathname = usePathname()
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">
          Mar Azul Acuarios <span>/</span>{' '}
          {navigation.find((item) => item.href === pathname)?.label ||
            'Administración'}
        </span>
      </div>
      <div className="top-actions">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
