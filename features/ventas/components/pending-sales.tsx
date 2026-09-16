import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Archive, Search, SlidersHorizontal } from 'lucide-react'
import { pendingSales } from '../data/mock-pending-sales'
export function Pending() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Ventas"
        title="Ventas pendientes"
        description="Reservas guardadas que aún necesitan confirmación."
        action={
          <button className="secondary-button">
            <Archive /> Historial de ventas
          </button>
        }
      />
      <div className="toolbar">
        <div className="search-box compact">
          <Search />
          <input
            aria-label="Buscar por ID o cliente"
            placeholder="Buscar por ID o cliente..."
          />
        </div>
        <button className="filter-button">
          <SlidersHorizontal /> Filtrar
        </button>
      </div>
      <div className="panel table-panel">
        <div className="table-header">
          <span>Venta</span>
          <span>Cliente</span>
          <span>Fecha</span>
          <span>Productos</span>
          <span>Total</span>
          <span>Estado</span>
          <span />
        </div>
        {pendingSales.map((row) => (
          <div className="table-row" key={row.id}>
            <b>{row.id}</b>
            <span>{row.customer}</span>
            <span>{row.date}</span>
            <span>{row.products}</span>
            <strong>{row.total}</strong>
            <StatusBadge tone="warning">Pendiente</StatusBadge>
            <button className="small-button">Confirmar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
