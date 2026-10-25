'use client'

import type { Role } from '@/types/role'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../context/auth-context'

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: readonly Role[]
  children: React.ReactNode
}) {
  const { session, isLoading } = useAuth()
  const router = useRouter()
  const authorized = Boolean(session?.role && allowed.includes(session.role))

  useEffect(() => {
    if (!isLoading && session && !authorized) router.replace('/inicio')
  }, [authorized, isLoading, router, session])

  if (isLoading || !authorized) {
    return <main className="auth-loading">Validando permisos…</main>
  }

  return children
}
