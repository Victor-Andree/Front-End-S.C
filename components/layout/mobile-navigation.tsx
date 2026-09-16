'use client'

import { Menu, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { navigation } from './navigation'
import { NavigationLink } from './navigation-link'

export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  function close() {
    setOpen(false)
    toggle.current?.focus()
  }
  return (
    <div
      className="mobile-navigation"
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      <div className="mobile-top">
        <div className="sidebar-brand">
          <div className="brand-mark small">N</div>
          <b>Nexo</b>
        </div>
        <button
          ref={toggle}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Navegación móvil"
        hidden={!open}
      >
        {navigation.map((item) => (
          <NavigationLink key={item.id} id={item.id} onNavigate={close} />
        ))}
      </nav>
    </div>
  )
}
