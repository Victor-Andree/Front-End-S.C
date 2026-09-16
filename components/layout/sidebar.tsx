'use client'

import { useAuth } from '@/features/auth/context/auth-context'
import { getInitials } from '@/features/auth/utils/user-display'
import { ChevronDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { navigation } from './navigation'
import { NavigationLink } from './navigation-link'

export function Sidebar() {
  const { session, logout } = useAuth()
  const router = useRouter()
  const name = session?.nombre ?? 'Usuario'
  const initials = getInitials(name)

  function handleLogout() {
    logout()
    router.replace('/login')
  }

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
        <button
          className="user-line logout-button"
          type="button"
          onClick={handleLogout}
          aria-label={`Cerrar sesión de ${name}`}
        >
          <span className="avatar">{initials}</span>
          <span>
            <b>{name}</b>
            <small>Cerrar sesión</small>
          </span>
          <LogOut />
        </button>
      </div>
    </aside>
  )
}
