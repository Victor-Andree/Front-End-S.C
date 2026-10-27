import type { Role } from '@/types/role'
import type { LucideIcon } from 'lucide-react'
import {
  Box,
  Clock3,
  LayoutDashboard,
  Package,
  ChartNoAxesCombined,
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
    id: 'reportes',
    label: 'Reportes',
    icon: ChartNoAxesCombined,
    href: '/reportes',
    roles: ['ADMIN'],
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: Settings,
    href: '/administracion',
    roles: ['ADMIN'],
  },
]
