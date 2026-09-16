'use client'

import { useAuth } from '@/features/auth/context/auth-context'
import { getInitials } from '@/features/auth/utils/user-display'
import { ChevronDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UserMenu({
  variant = 'topbar',
}: {
  variant?: 'topbar' | 'sidebar'
}) {
  const { session, logout } = useAuth()
  const router = useRouter()
  const name = session?.nombre ?? 'Usuario'
  const initials = getInitials(name)

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <details className={`user-menu user-menu-${variant}`}>
      <summary aria-label={`Abrir menú de ${name}`}>
        <span className="avatar">{initials}</span>
        {variant === 'sidebar' && (
          <>
            <span className="user-menu-label">
              <b>{name}</b>
              <small>Cuenta</small>
            </span>
            <ChevronDown />
          </>
        )}
      </summary>
      <div className="user-menu-popover">
        <div className="user-menu-name">
          <b>{name}</b>
          <small>Sesión activa</small>
        </div>
        <button type="button" onClick={handleLogout}>
          <LogOut /> Cerrar sesión
        </button>
      </div>
    </details>
  )
}
