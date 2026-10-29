import type { Role } from '@/types/role'
import type { LucideIcon } from 'lucide-react'
import {
  Box,
  Clock3,
  LayoutDashboard,
  Package,
  ChartNoAxesCombined,
  History,
  Settings,
  ShoppingCart,
  Users,
  Landmark,
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
    label: 'Pagos pendientes',
    icon: Clock3,
    href: '/ventas/pendientes',
  },
  {
    id: 'historial-ventas',
    label: 'Historial de ventas',
    icon: History,
    href: '/ventas/historial',
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
    id: 'caja',
    label: 'Caja',
    icon: Landmark,
    href: '/caja',
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
