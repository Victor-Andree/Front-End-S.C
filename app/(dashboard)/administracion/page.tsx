import { RoleGuard } from '@/features/auth/components/role-guard'
import { UserManagement } from '@/features/usuarios/components/user-management'

export default function Page() {
  return (
    <RoleGuard allowed={['ADMIN']}>
      <UserManagement />
    </RoleGuard>
  )
}
