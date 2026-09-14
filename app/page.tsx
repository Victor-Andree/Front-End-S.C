'use client'

import { useMemo, useState } from 'react'
import {
  Archive,
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from 'lucide-react'

type View = 'inicio' | 'ventas' | 'pendientes' | 'clientes' | 'productos' | 'inventario' | 'admin'
type Product = { id: number; name: string; category: string; price: number; stock: number; min: number }

const products: Product[] = [
  { id: 1, name: 'Guppy Macho', category: 'Peces', price: 12.5, stock: 18, min: 8 },
  { id: 2, name: 'Betta Splendens', category: 'Peces', price: 24.9, stock: 6, min: 8 },
  { id: 3, name: 'Neón Tetra', category: 'Peces', price: 4.5, stock: 42, min: 15 },
  { id: 4, name: 'Goldfish', category: 'Peces', price: 18, stock: 3, min: 6 },
  { id: 5, name: 'Alimento Tropical 100g', category: 'Alimentos', price: 16.9, stock: 25, min: 10 },
  { id: 6, name: 'Filtro Interno 600 L/H', category: 'Filtros', price: 59.9, stock: 9, min: 5 },
  { id: 7, name: 'Anticloro 120ml', category: 'Acondicionadores', price: 11.9, stock: 14, min: 8 },
  { id: 8, name: 'Lámpara LED 30cm', category: 'Iluminación', price: 74.9, stock: 4, min: 5 },
]

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'pendientes', label: 'Pendientes', icon: Clock3 },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'inventario', label: 'Inventario', icon: Box },
]

function StatusBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'warning' | 'success' | 'danger' }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-mark">N</div>
        <div className="brand-word">Nexo</div>
        <div className="brand-copy"><h1>Tu negocio,<br /><em>conectado.</em></h1><p>Ventas, inventario y clientes<br />en un solo lugar.</p></div>
        <div className="brand-footer"><span className="signal" />Diseñado para operar mejor</div>
      </section>
      <section className="login-form-wrap"><div className="mobile-brand"><div className="brand-mark">N</div><b>Nexo</b></div><div className="login-form"><p className="eyebrow">Bienvenido de nuevo</p><h2>Entra a tu cuenta</h2><p className="muted">Continúa gestionando tu negocio.</p><form onSubmit={(e) => { e.preventDefault(); onLogin() }}><label>Usuario<input defaultValue="maria.garcia" autoComplete="username" /></label><label>Contraseña<div className="input-icon"><input type={showPassword ? 'text' : 'password'} defaultValue="nexo1234" autoComplete="current-password" /><button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label><button className="primary-button full" type="submit">Entrar <ArrowRight /></button></form><p className="login-help">¿Necesitas ayuda? <a href="#ayuda">Contacta al administrador</a></p></div></section>
    </main>
  )
}

function AppShell({ view, setView, children }: { view: View; setView: (v: View) => void; children: React.ReactNode }) {
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><div className="brand-mark small">N</div><b>Nexo</b></div><div className="workspace"><span className="avatar">MG</span><span><b>Mar Azul Acuarios</b><small>Administración</small></span><ChevronDown /></div><nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}><Icon />{label}{id === 'pendientes' && <span className="nav-count">3</span>}</button>)}</nav><div className="sidebar-bottom"><button onClick={() => setView('admin')} className={view === 'admin' ? 'active' : ''}><Settings />Administración</button><div className="user-line"><span className="avatar">MG</span><span><b>María García</b><small>Administrador</small></span><Menu /></div></div></aside><div className="mobile-top"><div className="sidebar-brand"><div className="brand-mark small">N</div><b>Nexo</b></div><button aria-label="Abrir menú"><Menu /></button></div><main className="main-content"><header className="topbar"><div><span className="breadcrumb">Mar Azul Acuarios <span>/</span> {view === 'inicio' ? 'Inicio' : navItems.find(n => n.id === view)?.label || 'Administración'}</span></div><div className="top-actions"><button className="icon-button" aria-label="Notificaciones"><Bell /><i /></button><button className="avatar">MG</button></div></header>{children}</main></div>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="muted">{description}</p>}</div>{action}</div> }

function Dashboard({ setView }: { setView: (v: View) => void }) {
  return <div className="page"><PageHeader eyebrow="Lunes, 14 de septiembre" title="Buenos días, María" description="Esto es lo que está pasando en tu negocio hoy." action={<button className="primary-button" onClick={() => setView('ventas')}><Plus /> Nueva venta</button>} /><section className="stats-grid"><div className="stat-card featured"><div className="stat-label">Ventas de hoy <BarChart3 /></div><strong>S/ 1,248.50</strong><span className="stat-meta positive">↑ 12.5% <small>vs. ayer</small></span></div><div className="stat-card"><div className="stat-label">Número de ventas <ClipboardList /></div><strong>24</strong><span className="stat-meta">8 desde las 12:00</span></div><div className="stat-card"><div className="stat-label">Ventas pendientes <Clock3 /></div><strong>3</strong><button className="text-link" onClick={() => setView('pendientes')}>Revisar pendientes <ArrowRight /></button></div></section><section className="dashboard-grid"><div className="panel"><div className="panel-heading"><div><h2>Stock que necesita atención</h2><p className="muted">Revisa estos productos antes de quedarte sin stock.</p></div><button className="text-link" onClick={() => setView('inventario')}>Ver inventario <ArrowRight /></button></div><div className="attention-list">{products.filter(p => p.stock <= p.min).map(p => <div className="attention-row" key={p.id}><span className="product-icon"><Package /></span><span className="row-main"><b>{p.name}</b><small>{p.category}</small></span><span className="stock-value"><b>{p.stock}</b><small>actual / mín. {p.min}</small></span><StatusBadge tone="warning">Bajo</StatusBadge></div>)}</div></div><div className="panel activity"><div className="panel-heading"><div><h2>Actividad reciente</h2><p className="muted">Últimos movimientos del equipo.</p></div></div>{['Venta #1048 completada · S/ 86.80','Reserva #1047 confirmada · S/ 145.00','Nuevo cliente registrado','Reserva #1046 creada · S/ 320.40'].map((item, i) => <div className="activity-row" key={item}><span className={`activity-dot dot-${i}`} /><span><b>{item.split(' · ')[0]}</b><small>{item.includes(' · ') ? item.split(' · ')[1] : 'Hace ' + (i + 1) * 8 + ' min'}</small></span><time>{i + 1}h</time></div>)}</div></section></div>
}

function Sales({ setView }: { setView: (v: View) => void }) {
  const [query, setQuery] = useState(''); const [cart, setCart] = useState<Record<number, number>>({})
  const visible = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  const add = (id: number) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const remove = (id: number) => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n })
  const items = Object.entries(cart).map(([id, qty]) => ({ product: products.find(p => p.id === Number(id))!, qty }))
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  return <div className="page sales-page"><PageHeader eyebrow="Ventas / Nueva venta" title="Nueva venta" description="Agrega productos y completa la venta en pocos pasos." /><div className="sales-layout"><section className="product-browser"><div className="search-row"><div className="search-box"><Search /><input placeholder="Buscar productos por nombre..." value={query} onChange={e => setQuery(e.target.value)} /></div><button className="filter-button"><SlidersHorizontal /> Categoría</button></div><div className="category-row"><button className="category active">Todos</button>{['Peces', 'Alimentos', 'Filtros', 'Acondicionadores'].map(c => <button className="category" key={c}>{c}</button>)}</div><div className="product-list">{visible.map(p => <div className="product-row" key={p.id}><span className="product-icon large"><Package /></span><span className="row-main"><b>{p.name}</b><small>{p.category}</small></span><span className="product-price">S/ {p.price.toFixed(2)}</span><span className={p.stock <= p.min ? 'stock low' : 'stock'}>{p.stock} disponibles</span><button className="add-button" onClick={() => add(p.id)}><Plus /> Agregar</button></div>)}</div></section><aside className="cart-panel"><div className="cart-heading"><div><h2>Venta actual</h2><p className="muted">{items.length} productos</p></div><button className="icon-button"><X /></button></div>{items.length === 0 ? <div className="cart-empty"><ShoppingCart /><b>Tu venta está vacía</b><span>Agrega productos de la lista para comenzar.</span></div> : <div className="cart-items">{items.map(({ product, qty }) => <div className="cart-item" key={product.id}><span><b>{product.name}</b><small>S/ {product.price.toFixed(2)} c/u</small></span><div className="qty"><button onClick={() => remove(product.id)}>−</button><b>{qty}</b><button onClick={() => add(product.id)}>+</button></div><strong>S/ {(product.price * qty).toFixed(2)}</strong></div>)}</div>}<div className="customer-select"><label>Cliente <span>Opcional</span></label><div className="select-fake"><UserRound /> Buscar cliente <ChevronDown /></div></div><div className="cart-total"><span>Subtotal</span><b>S/ {total.toFixed(2)}</b><span className="total-label">Total</span><strong>S/ {total.toFixed(2)}</strong></div><button className="primary-button full" disabled={!items.length} onClick={() => setView('pendientes')}>Completar venta <Check /></button><button className="secondary-button full" disabled={!items.length}>Guardar como pendiente</button></aside></div></div>
}

function Pending() { return <div className="page"><PageHeader eyebrow="Ventas" title="Ventas pendientes" description="Reservas guardadas que aún necesitan confirmación." action={<button className="secondary-button"><Archive /> Historial de ventas</button>} /><div className="toolbar"><div className="search-box compact"><Search /><input placeholder="Buscar por ID o cliente..." /></div><button className="filter-button"><SlidersHorizontal /> Filtrar</button></div><div className="panel table-panel"><div className="table-header"><span>Venta</span><span>Cliente</span><span>Fecha</span><span>Productos</span><span>Total</span><span>Estado</span><span /></div>{[['#1047','Carlos Ramírez','Hoy, 10:32','4 productos','S/ 145.00'],['#1046','Acuario Norte','Ayer, 16:48','8 productos','S/ 320.40'],['#1042','Lucía Torres','12 sep, 11:20','2 productos','S/ 58.00']].map(row => <div className="table-row" key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><strong>{row[4]}</strong><StatusBadge tone="warning">Pendiente</StatusBadge><button className="small-button">Confirmar</button></div>)}</div></div> }

function Generic({ view }: { view: View }) { const title = view === 'clientes' ? 'Clientes' : view === 'productos' ? 'Productos' : view === 'inventario' ? 'Inventario' : 'Administración'; return <div className="page"><PageHeader title={title} description={view === 'inventario' ? 'Consulta y actualiza las existencias de tu negocio.' : 'Gestiona la información de tu negocio con claridad.'} action={view !== 'admin' && <button className="primary-button"><Plus /> {view === 'clientes' ? 'Nuevo cliente' : view === 'productos' ? 'Nuevo producto' : 'Ajustar inventario'}</button>} /><div className="panel empty-state"><div className="empty-icon"><Search /></div><h2>Vista preparada para crecer</h2><p>La estructura de {title.toLowerCase()} ya está lista para conectarse con tu API REST.</p></div></div> }

export default function Page() { const [logged, setLogged] = useState(false); const [view, setView] = useState<View>('inicio'); const content = useMemo(() => view === 'inicio' ? <Dashboard setView={setView} /> : view === 'ventas' ? <Sales setView={setView} /> : view === 'pendientes' ? <Pending /> : <Generic view={view} />, [view]); return logged ? <AppShell view={view} setView={setView}>{content}</AppShell> : <Login onLogin={() => setLogged(true)} /> }
