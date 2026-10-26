'use client'

import { PageHeader } from '@/components/shared/page-header'
import { useAuth } from '@/features/auth/context/auth-context'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function DashboardHeader() {
  const { session } = useAuth()
  const name = session?.nombre?.trim() || 'Usuario'
  const dateLabel = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date())
  const description = session?.role === 'ADMIN'
    ? 'Resumen general de tu negocio.'
    : 'Resumen de tus ventas y alertas importantes.'

  return (
    <PageHeader
      eyebrow={dateLabel}
      title={`Buenos días, ${name}`}
      description={description}
      action={
        <Link className="primary-button" href="/ventas/nueva">
          <Plus /> Nueva venta
        </Link>
      }
    />
  )
}
