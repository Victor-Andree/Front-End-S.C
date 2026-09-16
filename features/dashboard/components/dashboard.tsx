import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { products } from '@/features/productos/data/mock-products'
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Clock3,
  Package,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { recentActivity } from '../data/mock-activity'
import { dashboardSummary } from '../data/mock-summary'
import { pendingSales } from '@/features/ventas/data/mock-pending-sales'
export function Dashboard() {
  return (
    <div className="page">
      <PageHeader
        eyebrow={dashboardSummary.dateLabel}
        title={dashboardSummary.greeting}
        description="Esto es lo que está pasando en tu negocio hoy."
        action={
          <Link className="primary-button" href="/ventas/nueva">
            <Plus /> Nueva venta
          </Link>
        }
      />
      <section className="stats-grid">
        <div className="stat-card featured">
          <div className="stat-label">
            Ventas de hoy <BarChart3 />
          </div>
          <strong>{dashboardSummary.salesToday}</strong>
          <span className="stat-meta positive">
            {dashboardSummary.change} <small>vs. ayer</small>
          </span>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Número de ventas <ClipboardList />
          </div>
          <strong>{dashboardSummary.saleCount}</strong>
          <span className="stat-meta">{dashboardSummary.recentSalesLabel}</span>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Ventas pendientes <Clock3 />
          </div>
          <strong>{pendingSales.length}</strong>
          <Link className="text-link" href="/ventas/pendientes">
            Revisar pendientes <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Stock que necesita atención</h2>
              <p className="muted">
                Revisa estos productos antes de quedarte sin stock.
              </p>
            </div>
            <Link className="text-link" href="/inventario">
              Ver inventario <ArrowRight />
            </Link>
          </div>
          <div className="attention-list">
            {products
              .filter((p) => p.stock <= p.min)
              .map((p) => (
                <div className="attention-row" key={p.id}>
                  <span className="product-icon">
                    <Package />
                  </span>
                  <span className="row-main">
                    <b>{p.name}</b>
                    <small>{p.category}</small>
                  </span>
                  <span className="stock-value">
                    <b>{p.stock}</b>
                    <small>actual / mín. {p.min}</small>
                  </span>
                  <StatusBadge tone="warning">Bajo</StatusBadge>
                </div>
              ))}
          </div>
        </div>
        <div className="panel activity">
          <div className="panel-heading">
            <div>
              <h2>Actividad reciente</h2>
              <p className="muted">Últimos movimientos del equipo.</p>
            </div>
          </div>
          {recentActivity.map((item, i) => (
            <div className="activity-row" key={item}>
              <span className={`activity-dot dot-${i}`} />
              <span>
                <b>{item.split(' · ')[0]}</b>
                <small>
                  {item.includes(' · ')
                    ? item.split(' · ')[1]
                    : 'Hace ' + (i + 1) * 8 + ' min'}
                </small>
              </span>
              <time>{i + 1}h</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
