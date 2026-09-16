'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../context/auth-context'

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && session) router.replace('/inicio')
  }, [isLoading, router, session])

  if (isLoading || session) {
    return (
      <main className="auth-loading" aria-live="polite">
        Cargando sesión…
      </main>
    )
  }

  return children
}
