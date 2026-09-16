'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from './navigation'
import { pendingSales } from '@/features/ventas/data/mock-pending-sales'

export function NavigationLink({
  id,
  onNavigate,
}: {
  id: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const item = navigation.find((item) => item.id === id)
  if (!item) return null
  const active = pathname === item.href
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={active ? 'active' : ''}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <Icon />
      {item.label}
      {item.id === 'pendientes' && (
        <span className="nav-count">{pendingSales.length}</span>
      )}
    </Link>
  )
}
