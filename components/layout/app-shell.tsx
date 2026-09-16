import { MobileNavigation } from './mobile-navigation'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <MobileNavigation />
      <main className="main-content">
        <Topbar />
        {children}
      </main>
    </div>
  )
}
