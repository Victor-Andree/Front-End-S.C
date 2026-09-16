'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { navigation } from './navigation'
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
        <button className="icon-button" aria-label="Notificaciones">
          <Bell />
          <i />
        </button>
        <button className="avatar" aria-label="Perfil de María García">
          MG
        </button>
      </div>
    </header>
  )
}
