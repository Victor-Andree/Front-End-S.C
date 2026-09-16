import { ChevronDown, Menu } from 'lucide-react'
import { navigation } from './navigation'
import { NavigationLink } from './navigation-link'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark small">N</div>
        <b>Nexo</b>
      </div>
      <div className="workspace">
        <span className="avatar">MG</span>
        <span>
          <b>Mar Azul Acuarios</b>
          <small>Administración</small>
        </span>
        <ChevronDown />
      </div>
      <nav aria-label="Navegación principal">
        {navigation
          .filter((item) => item.id !== 'admin')
          .map((item) => (
            <NavigationLink key={item.id} id={item.id} />
          ))}
      </nav>
      <div className="sidebar-bottom">
        {navigation
          .filter((item) => item.id === 'admin')
          .map((item) => (
            <NavigationLink key={item.id} id={item.id} />
          ))}
        <div className="user-line">
          <span className="avatar">MG</span>
          <span>
            <b>María García</b>
            <small>Administrador</small>
          </span>
          <Menu />
        </div>
      </div>
    </aside>
  )
}
