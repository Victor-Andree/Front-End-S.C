'use client'

import { PageHeader } from '@/components/shared/page-header'
import { useAuth } from '@/features/auth/context/auth-context'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { dashboardSummary } from '../data/mock-summary'

export function DashboardHeader() {
  const { session } = useAuth()
  const name = session?.nombre?.trim() || 'Usuario'

  return (
    <PageHeader
      eyebrow={dashboardSummary.dateLabel}
      title={`Buenos días, ${name}`}
      description="Esto es lo que está pasando en tu negocio hoy."
      action={
        <Link className="primary-button" href="/ventas/nueva">
          <Plus /> Nueva venta
        </Link>
      }
    />
  )
}
