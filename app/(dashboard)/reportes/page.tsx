import { RoleGuard } from '@/features/auth/components/role-guard'
import { SalesReportView } from '@/features/reportes/components/sales-report'

export default function ReportsPage() {
  return <RoleGuard allowed={['ADMIN']}><SalesReportView /></RoleGuard>
}
