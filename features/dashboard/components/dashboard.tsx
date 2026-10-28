'use client'

import { StatusBadge } from '@/components/shared/status-badge'
import { useAuth } from '@/features/auth/context/auth-context'
import { useProducts } from '@/features/productos/hooks/use-products'
import { getPendingSales, getSales } from '@/features/ventas/api/sales'
import type { SaleResponse } from '@/features/ventas/types'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { ArrowRight, BarChart3, ClipboardList, Clock3, Package } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from './dashboard-header'

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

function isToday(value: string) {
  const date = new Date(value)
  const today = new Date()
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(new Date(value))
}

export function Dashboard() {
  const { session } = useAuth()
  const isAdmin = session?.role === 'ADMIN'
  const { products, isLoading: loadingProducts, error: productsError } = useProducts()
  const [sales, setSales] = useState<SaleResponse[]>([])
  const [pending, setPending] = useState<SaleResponse[]>([])
  const [loadingSales, setLoadingSales] = useState(true)
  const [salesError, setSalesError] = useState('')

  useEffect(() => {
    let active = true
    setLoadingSales(true)
    setSalesError('')
    Promise.all([getSales(), getPendingSales()])
      .then(([allSales, pendingSales]) => {
        if (!active) return
        setSales(allSales)
        setPending(pendingSales)
      })
      .catch((error) => {
        if (active) setSalesError(getApiErrorMessage(error, 'No se pudieron cargar las métricas de ventas.'))
      })
      .finally(() => { if (active) setLoadingSales(false) })
    return () => { active = false }
  }, [session?.username])

  const completedToday = useMemo(
    () => sales.filter((sale) => sale.estado === 'COMPLETADA' && isToday(sale.fechaVenta)),
    [sales],
  )
  const totalToday = completedToday.reduce((total, sale) => total + sale.total, 0)
  const lowStock = products.filter((product) => product.stock <= product.min)
  const recentSales = [...sales]
    .sort((left, right) => new Date(right.fechaVenta).getTime() - new Date(left.fechaVenta).getTime())
    .slice(0, 4)

  return (
    <div className="page dashboard-page">
      <DashboardHeader />
      {salesError && <p className="form-error" role="alert">{salesError}</p>}
      <section className="stats-grid">
        <div className="stat-card featured">
          <div className="stat-label">{isAdmin ? 'Ventas del negocio hoy' : 'Mis ventas de hoy'} <BarChart3 /></div>
          <strong>{loadingSales ? '—' : currency.format(totalToday)}</strong>
          <span className="stat-meta positive">{isAdmin ? 'Total del equipo' : 'Total registrado por ti'}</span>
        </div>
        <div className="stat-card">
          <div className="stat-label">{isAdmin ? 'Número de ventas' : 'Mis ventas'} <ClipboardList /></div>
          <strong>{loadingSales ? '—' : completedToday.length}</strong>
          <span className="stat-meta">Completadas hoy</span>
        </div>
        <div className="stat-card">
          <div className="stat-label">{isAdmin ? 'Ventas pendientes' : 'Mis pendientes'} <Clock3 /></div>
          <strong>{loadingSales ? '—' : pending.length}</strong>
          <Link className="text-link" href="/ventas/pendientes">Revisar pendientes <ArrowRight /></Link>
        </div>
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <div><h2>Stock que necesita atención</h2><p className="muted">{isAdmin ? 'Gestiona la reposición antes de quedarte sin stock.' : 'Informa al administrador sobre estos productos.'}</p></div>
            <Link className="text-link" href="/inventario">Ver inventario <ArrowRight /></Link>
          </div>
          {productsError && <p className="form-error" role="alert">{productsError}</p>}
          <div className="attention-list">
            {loadingProducts && <div className="request-state">Cargando inventario…</div>}
            {!loadingProducts && !productsError && lowStock.map((product) => (
              <div className="attention-row" key={product.id}>
                <span className="product-icon"><Package /></span>
                <span className="row-main"><b>{product.name}</b><small>{product.category}</small></span>
                <span className="stock-value"><b>{product.stock}</b><small>actual / mín. {product.min}</small></span>
                <StatusBadge tone="warning">Bajo</StatusBadge>
              </div>
            ))}
            {!loadingProducts && !productsError && !lowStock.length && <div className="request-state">No hay productos con stock bajo.</div>}
          </div>
        </div>
        <div className="panel activity">
          <div className="panel-heading"><div><h2>{isAdmin ? 'Actividad reciente' : 'Mi actividad reciente'}</h2><p className="muted">{isAdmin ? 'Últimas ventas del equipo.' : 'Tus últimas ventas y reservas.'}</p></div></div>
          {!loadingSales && recentSales.map((sale, index) => (
            <div className="activity-row" key={sale.ventaId}>
              <span className={`activity-dot dot-${index}`} />
              <span><b>Venta #{sale.ventaId} {sale.estado.toLowerCase()}</b><small>{sale.clienteNombre} · {currency.format(sale.total)}</small></span>
              <time>{relativeTime(sale.fechaVenta)}</time>
            </div>
          ))}
          {loadingSales && <div className="request-state">Cargando actividad…</div>}
          {!loadingSales && !salesError && !recentSales.length && <div className="request-state">Todavía no hay actividad.</div>}
        </div>
      </section>
    </div>
  )
}
