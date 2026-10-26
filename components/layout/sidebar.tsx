'use client'

import { useAuth } from '@/features/auth/context/auth-context'
import { getInitials } from '@/features/auth/utils/user-display'
import { navigation } from './navigation'
import { NavigationLink } from './navigation-link'
import { UserMenu } from './user-menu'

export function Sidebar() {
  const { session } = useAuth()
  const name = session?.nombre ?? 'Usuario'
  const initials = getInitials(name)
  const visibleNavigation = navigation.filter(
    (item) => !item.roles || (session?.role && item.roles.includes(session.role)),
  )

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
          <small>{session?.role === 'ADMIN' ? 'Administración' : 'Asistente de ventas'}</small>
        </span>
      </div>
      <nav aria-label="Navegación principal">
        {visibleNavigation
          .filter((item) => item.id !== 'admin')
          .map((item) => (
            <NavigationLink key={item.id} id={item.id} />
          ))}
      </nav>
      <div className="sidebar-bottom">
        {visibleNavigation
          .filter((item) => item.id === 'admin')
          .map((item) => (
            <NavigationLink key={item.id} id={item.id} />
          ))}
        <UserMenu variant="sidebar" />
      </div>
    </aside>
  )
}
