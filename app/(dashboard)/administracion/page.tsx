import { ModulePlaceholder } from '@/components/shared/module-placeholder'
import { RoleGuard } from '@/features/auth/components/role-guard'

export default function Page() {
  return (
    <RoleGuard allowed={['ADMIN']}>
      <ModulePlaceholder view="admin" />
    </RoleGuard>
  )
}
