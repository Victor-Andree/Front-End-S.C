import { Login } from '@/features/auth/components/login'
import { GuestGuard } from '@/features/auth/components/guest-guard'

export default function LoginPage() {
  return (
    <GuestGuard>
      <Login />
    </GuestGuard>
  )
}
