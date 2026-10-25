'use client'

import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Archive, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { confirmSale, getPendingSales } from '../api/sales'
import type { SaleResponse } from '../types'

export function Pending() {
  const [sales, setSales] = useState<SaleResponse[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSales(await getPendingSales())
    } catch {
      setError('No se pudieron cargar las ventas pendientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return sales.filter((sale) =>
      !normalized || String(sale.ventaId).includes(normalized) || sale.clienteNombre.toLowerCase().includes(normalized),
    )
  }, [query, sales])

  async function handleConfirm(id: number) {
    setConfirming(id)
    setError('')
    try {
      await confirmSale(id)
      setSales((current) => current.filter((sale) => sale.ventaId !== id))
    } catch {
      setError('No se pudo confirmar la venta. El backend no modificó el estado.')
    } finally {
      setConfirming(null)
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Ventas"
        title="Ventas pendientes"
        description="Reservas guardadas que aún necesitan confirmación."
        action={<button className="secondary-button"><Archive /> Historial de ventas</button>}
      />
      <div className="toolbar">
        <div className="search-box compact"><Search /><input aria-label="Buscar por ID o cliente" placeholder="Buscar por ID o cliente..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="panel table-panel">
        <div className="table-header"><span>Venta</span><span>Cliente</span><span>Fecha</span><span>Productos</span><span>Total</span><span>Estado</span><span /></div>
        {loading && <div className="request-state">Cargando ventas pendientes…</div>}
        {!loading && visible.map((sale) => (
          <div className="table-row" key={sale.ventaId}>
            <b>#{sale.ventaId}</b>
            <span>{sale.clienteNombre}</span>
            <span>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(sale.fechaVenta))}</span>
            <span>{sale.detalles.length} productos</span>
            <strong>S/ {sale.total.toFixed(2)}</strong>
            <StatusBadge tone="warning">Pendiente</StatusBadge>
            <button className="small-button" disabled={confirming === sale.ventaId} onClick={() => void handleConfirm(sale.ventaId)}>{confirming === sale.ventaId ? 'Confirmando…' : 'Confirmar'}</button>
          </div>
        ))}
        {!loading && !visible.length && <div className="request-state">No hay ventas pendientes.</div>}
      </div>
    </div>
  )
}
