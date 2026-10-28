'use client'

import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Archive, Search } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { cancelSale, confirmSale, getPendingSales, getSales } from '../api/sales'
import type { SaleResponse } from '../types'
import { ApiError } from '@/lib/api/errors'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useRef } from 'react'
import { NOTIFICATIONS_REFRESH_EVENT } from '@/features/notificaciones/context/notifications-context'
import type { PaymentMethod } from '../types'
import type { CashRegister } from '@/features/caja/types'
import { getCashRegisters } from '@/features/caja/api/cash-register'

export function Pending() {
  const [sales, setSales] = useState<SaleResponse[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<SaleResponse | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const operationInFlight = useRef(false)
  const [view, setView] = useState<'pending' | 'history'>('pending')
  const [confirmTarget, setConfirmTarget] = useState<SaleResponse | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO')
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [cashRegisterId, setCashRegisterId] = useState<number | null>(null)

  useEffect(() => {
    getCashRegisters().then((registers) => {
      const opened = registers.filter((register) => register.activa && register.sesionAbierta)
      setCashRegisters(opened); setCashRegisterId(opened[0]?.cajaId ?? null)
    }).catch(() => setCashRegisters([]))
  }, [])

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
      let selectedCashRegisterId = cashRegisterId
      if (paymentMethod === 'EFECTIVO') {
        const registers = await getCashRegisters()
        const opened = registers.filter((register) => register.sesionAbierta && register.activa)
        setCashRegisters(opened)
        selectedCashRegisterId = opened.some((register) => register.cajaId === cashRegisterId)
          ? cashRegisterId : opened[0]?.cajaId ?? null
        setCashRegisterId(selectedCashRegisterId)
        if (selectedCashRegisterId === null) {
          throw new Error('No hay una sesión de caja abierta para confirmar el cobro en efectivo.')
        }
      }
      await confirmSale(id, {
        metodoPago: paymentMethod,
        ...(paymentMethod === 'EFECTIVO' && selectedCashRegisterId ? { cajaId: selectedCashRegisterId } : {}),
      })
      setSales((current) => current.filter((sale) => sale.ventaId !== id))
      setConfirmTarget(null)
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo confirmar la venta. El backend no modificó el estado.'))
    } finally {
      operationInFlight.current = false
      setConfirming(null)
    }
  }

  function closeCancelDialog() {
    if (cancelling === null) {
      setCancelTarget(null)
      setCancelReason('')
      setCancelError('')
    }
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!cancelTarget || !cancelReason.trim()) return
    if (operationInFlight.current) return
    operationInFlight.current = true
    setCancelling(cancelTarget.ventaId)
    setCancelError('')
    setError('')
    try {
      const cancelled = await cancelSale(cancelTarget.ventaId, cancelReason.trim())
      setSales((current) => view === 'pending'
        ? current.filter((sale) => sale.ventaId !== cancelTarget.ventaId)
        : current.map((sale) => sale.ventaId === cancelTarget.ventaId ? cancelled : sale))
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
      setCancelTarget(null)
      setCancelReason('')
    } catch (requestError) {
      setCancelError(getApiErrorMessage(requestError, 'No se pudo anular la reserva.'))
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
            <StatusBadge tone={sale.estado === 'COMPLETADA' ? 'success' : sale.estado === 'ANULADA' ? 'danger' : 'warning'}>
              {sale.estado === 'ANULADA' && sale.estadoDevolucionCaja === 'PENDIENTE'
                ? 'ANULADA · DEVOLUCIÓN PENDIENTE'
                : sale.estado === 'ANULADA' && sale.estadoDevolucionCaja === 'APLICADA'
                  ? 'ANULADA · REEMBOLSADA'
                  : sale.estado}
            </StatusBadge>
            {sale.estado === 'PENDIENTE' ? <span className="sale-actions"><button className="small-button" disabled={confirming !== null || cancelling !== null} onClick={() => { setConfirmTarget(sale); setError('') }}>Confirmar</button><button className="small-button danger-button" disabled={confirming !== null || cancelling !== null} onClick={() => { setCancelTarget(sale); setCancelError('') }}>{cancelling === sale.ventaId ? 'Anulando…' : 'Anular'}</button></span> : <span />}
          </div>
        ))}
        {!loading && !visible.length && <div className="request-state">{view === 'pending' ? 'No hay ventas pendientes.' : 'No hay ventas registradas.'}</div>}
      </div>
      {confirmTarget && <div className="modal-backdrop" role="presentation">
        <section className="cancel-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-sale-title">
          <h2 id="confirm-sale-title">Cobrar venta #{confirmTarget.ventaId}</h2>
          <div className="sale-payment">
            <label htmlFor="pending-payment-method">Método de pago</label>
            <select id="pending-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={confirming !== null}>
              <option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="TRANSFERENCIA">Transferencia</option>
            </select>
            {paymentMethod === 'EFECTIVO' && <><label htmlFor="pending-cash-register">Caja</label><select id="pending-cash-register" value={cashRegisterId ?? ''} onChange={(event) => setCashRegisterId(Number(event.target.value))} disabled={confirming !== null || !cashRegisters.length}>
              {!cashRegisters.length && <option value="">No hay cajas abiertas</option>}{cashRegisters.map((register) => <option key={register.cajaId} value={register.cajaId}>{register.nombre}</option>)}
            </select></>}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button className="secondary-button" disabled={confirming !== null} onClick={() => setConfirmTarget(null)}>Volver</button><button className="primary-button" disabled={confirming !== null} onClick={() => void handleConfirm(confirmTarget.ventaId)}>{confirming ? 'Confirmando…' : 'Confirmar cobro'}</button></div>
        </section>
      </div>}
      {cancelTarget && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeCancelDialog}>
          <section className="cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="cancel-title">Anular reserva #{cancelTarget.ventaId}</h2>
            <p className="muted">La venta cambiará a ANULADA y el stock permanecerá sin cambios.</p>
            <form onSubmit={handleCancel}>
              <label htmlFor="cancel-reason">Motivo de anulación</label>
              <textarea id="cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Ejemplo: el cliente canceló la reserva" required minLength={4} disabled={cancelling !== null} />
              {cancelError && <p className="form-error" role="alert">{cancelError}</p>}
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={closeCancelDialog} disabled={cancelling !== null}>Volver</button>
                <button className="danger-confirm-button" disabled={cancelling !== null || cancelReason.trim().length < 4}>{cancelling !== null ? 'Anulando…' : 'Confirmar anulación'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
