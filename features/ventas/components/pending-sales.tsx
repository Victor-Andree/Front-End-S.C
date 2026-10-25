'use client'

import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Archive, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { cancelSale, confirmSale, getPendingSales, getSales } from '../api/sales'
import type { SaleResponse } from '../types'
import { ApiError } from '@/lib/api/errors'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useRef } from 'react'
import { NOTIFICATIONS_REFRESH_EVENT } from '@/features/notificaciones/context/notifications-context'

export function Pending() {
  const [sales, setSales] = useState<SaleResponse[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const operationInFlight = useRef(false)
  const [view, setView] = useState<'pending' | 'history'>('pending')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSales(view === 'pending' ? await getPendingSales() : await getSales())
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 403) {
        setError('El backend rechazó el rol del usuario (403).')
      } else if (requestError instanceof ApiError && requestError.status === 0) {
        setError('No se pudo conectar con Spring Boot.')
      } else {
        setError(view === 'pending' ? 'No se pudieron cargar las ventas pendientes.' : 'No se pudo cargar el historial de ventas.')
      }
    } finally {
      setLoading(false)
    }
  }, [view])

  useEffect(() => { void load() }, [load])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return sales.filter((sale) =>
      !normalized || String(sale.ventaId).includes(normalized) || sale.clienteNombre.toLowerCase().includes(normalized),
    )
  }, [query, sales])

  async function handleConfirm(id: number) {
    if (operationInFlight.current) return
    operationInFlight.current = true
    setConfirming(id)
    setError('')
    try {
      await confirmSale(id)
      setSales((current) => current.filter((sale) => sale.ventaId !== id))
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo confirmar la venta. El backend no modificó el estado.'))
    } finally {
      operationInFlight.current = false
      setConfirming(null)
    }
  }

  async function handleCancel(id: number) {
    if (operationInFlight.current) return
    operationInFlight.current = true
    setCancelling(id)
    setError('')
    try {
      await cancelSale(id, 'Reserva anulada por el usuario')
      setSales((current) => view === 'pending'
        ? current.filter((sale) => sale.ventaId !== id)
        : current.map((sale) => sale.ventaId === id ? { ...sale, estado: 'ANULADA' } : sale))
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo anular la reserva.'))
    } finally {
      operationInFlight.current = false
      setCancelling(null)
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Ventas"
        title={view === 'pending' ? 'Ventas pendientes' : 'Historial de ventas'}
        description={view === 'pending' ? 'Reservas guardadas que aún necesitan confirmación.' : 'Registro de ventas pendientes, completadas y anuladas.'}
        action={<button className="secondary-button" onClick={() => setView((current) => current === 'pending' ? 'history' : 'pending')}><Archive /> {view === 'pending' ? 'Historial de ventas' : 'Ver pendientes'}</button>}
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
            <StatusBadge tone={sale.estado === 'COMPLETADA' ? 'success' : sale.estado === 'ANULADA' ? 'danger' : 'warning'}>{sale.estado}</StatusBadge>
            {sale.estado === 'PENDIENTE' ? <span className="sale-actions"><button className="small-button" disabled={confirming !== null || cancelling !== null} onClick={() => void handleConfirm(sale.ventaId)}>{confirming === sale.ventaId ? 'Confirmando…' : 'Confirmar'}</button><button className="small-button danger-button" disabled={confirming !== null || cancelling !== null} onClick={() => void handleCancel(sale.ventaId)}>{cancelling === sale.ventaId ? 'Anulando…' : 'Anular'}</button></span> : <span />}
          </div>
        ))}
        {!loading && !visible.length && <div className="request-state">{view === 'pending' ? 'No hay ventas pendientes.' : 'No hay ventas registradas.'}</div>}
      </div>
    </div>
  )
}
