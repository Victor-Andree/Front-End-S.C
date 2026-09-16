'use client'

import { useRouter } from 'next/navigation'

// Demo navigation only. Replace this hook with the future authentication flow.
export function useDemoLogin() {
  const router = useRouter()
  return () => router.push('/inicio')
}
