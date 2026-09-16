'use client'

import { useAuth } from '@/features/auth/context/auth-context'
import { getInitials } from '@/features/auth/utils/user-display'
import { ChevronDown } from 'lucide-react'
import { navigation } from './navigation'
import { NavigationLink } from './navigation-link'
import { UserMenu } from './user-menu'

export function Sidebar() {
  const { session } = useAuth()
  const name = session?.nombre ?? 'Usuario'
  const initials = getInitials(name)

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark small">N</div>
        <b>Nexo</b>
      </div>
      <div className="workspace">
        <span className="avatar">{initials}</span>
        <span>
          <b>Mar Azul Acuarios</b>
          <small>Administración</small>
        </span>
        <ChevronDown />
      </div>
      <nav aria-label="Navegación principal">
        {navigation
          .filter((item) => item.id !== 'admin')
          .map((item) => (
            <NavigationLink key={item.id} id={item.id} />
          ))}
      </nav>
      <div className="sidebar-bottom">
        {navigation
          .filter((item) => item.id === 'admin')
          .map((item) => (
            <NavigationLink key={item.id} id={item.id} />
          ))}
        <UserMenu variant="sidebar" />
      </div>
    </aside>
  )
}
