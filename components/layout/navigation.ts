import type { Role } from '@/types/role'
import type { LucideIcon } from 'lucide-react'
import {
  Box,
  Clock3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'

export type NavigationItem = {
  id: string
  label: string
  icon: LucideIcon
  href: string
  roles?: readonly Role[]
}

// Role visibility is intentionally unset until the real user contract exists.
export const navigation: NavigationItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: LayoutDashboard,
    href: '/inicio',
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: ShoppingCart,
    href: '/ventas/nueva',
  },
  {
    id: 'pendientes',
    label: 'Pendientes',
    icon: Clock3,
    href: '/ventas/pendientes',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    href: '/clientes',
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: Package,
    href: '/productos',
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Box,
    href: '/inventario',
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: Settings,
    href: '/administracion',
  },
]
