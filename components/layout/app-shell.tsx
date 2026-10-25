import { MobileNavigation } from './mobile-navigation'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { NotificationsProvider } from '@/features/notificaciones/context/notifications-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      <div className="app-shell">
        <Sidebar />
        <MobileNavigation />
        <main className="main-content">
          <Topbar />
          {children}
        </main>
      </div>
    </NotificationsProvider>
  )
}
