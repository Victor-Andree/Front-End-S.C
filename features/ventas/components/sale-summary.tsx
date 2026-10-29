'use client'

import { ClientModal } from '@/features/clientes/components/client-modal'
import type { Client } from '@/features/clientes/types'
import { Check, Plus, ShoppingCart, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRef } from 'react'
import type { PaymentMethod, SaleCartItem } from '../types'
import type { CashRegister } from '@/features/caja/types'
import { getCashRegisters } from '@/features/caja/api/cash-register'
import { getApiErrorMessage } from '@/lib/api/error-message'

type Props = {
  items: SaleCartItem[]
  total: number
  clients: Client[]
  clientsLoading: boolean
  clientsError: string
  selectedClientId: number | null
  add: (id: number) => void
  remove: (id: number) => void
  onSelectClient: (id: number | null) => void
  onClientCreated: (client: Client) => void
  onSubmit: (mode: 'completed' | 'pending', payment?: { metodoPago: PaymentMethod; cajaId?: number }) => Promise<void>
}

export function SaleSummary({
  items, total, clients, clientsLoading, clientsError, selectedClientId,
  add, remove, onSelectClient, onClientCreated, onSubmit,
}: Props) {
  const [clientQuery, setClientQuery] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [submitting, setSubmitting] = useState<'completed' | 'pending' | null>(null)
  const [submitError, setSubmitError] = useState('')
  const requestInFlight = useRef(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO')
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [cashRegisterId, setCashRegisterId] = useState<number | null>(null)
  const [cashError, setCashError] = useState('')
  const loadCashRegisters = useCallback(async () => {
    const registers = await getCashRegisters()
    const opened = registers.filter((register) => register.sesionAbierta && register.activa)
    setCashRegisters(opened)
    setCashRegisterId((current) => opened.some((register) => register.cajaId === current)
      ? current : opened[0]?.cajaId ?? null)
    setCashError('')
    return opened
  }, [])
  useEffect(() => {
    void loadCashRegisters().catch(() => setCashError('No se pudieron consultar las cajas abiertas.'))
  }, [loadCashRegisters])
  const selectedClient = clients.find((client) => client.clienteId === selectedClientId)
  const matchingClients = useMemo(() => {
    const query = clientQuery.trim().toLowerCase()
    if (query.length < 2) return []
    return clients.filter((client) =>
      `${client.nombre} ${client.apellidos}`.toLowerCase().includes(query),
    ).slice(0, 5)
  }, [clientQuery, clients])
  const canSubmit = items.length > 0 && selectedClientId !== null && !submitting
  const canComplete = canSubmit

  async function submit(mode: 'completed' | 'pending') {
    if (requestInFlight.current || !canSubmit || (mode === 'completed' && !canComplete)) return
    requestInFlight.current = true
    setSubmitting(mode)
    setSubmitError('')
    try {
      let selectedCashRegisterId = cashRegisterId
      if (mode === 'completed' && paymentMethod === 'EFECTIVO') {
        const opened = await loadCashRegisters()
        selectedCashRegisterId = opened.some((register) => register.cajaId === cashRegisterId)
          ? cashRegisterId : opened[0]?.cajaId ?? null
        if (selectedCashRegisterId === null) {
          throw new Error('No hay una sesión de caja abierta para cobrar en efectivo.')
        }
      }
      await onSubmit(mode, mode === 'completed' ? {
        metodoPago: paymentMethod,
        ...(paymentMethod === 'EFECTIVO' && selectedCashRegisterId ? { cajaId: selectedCashRegisterId } : {}),
      } : undefined)
      setClientQuery('')
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(
        requestError,
        mode === 'pending'
          ? 'No se pudo guardar la venta pendiente.'
          : 'No se pudo completar la venta. Verifica el stock.',
      ))
    } finally {
      requestInFlight.current = false
      setSubmitting(null)
    }
  }

  return (
    <aside className="cart-panel">
      <div className="cart-heading">
        <div><h2>Venta actual</h2><p className="muted">{items.length} productos</p></div>
      </div>
      {items.length === 0 ? (
        <div className="cart-empty"><ShoppingCart /><b>Tu venta está vacía</b><span>Agrega productos de la lista para comenzar.</span></div>
      ) : (
        <div className="cart-items">
          {items.map(({ product, qty }) => (
            <div className="cart-item" key={product.id}>
              <span><b>{product.name}</b><small>S/ {product.price.toFixed(2)} c/u</small></span>
              <div className="qty">
                <button aria-label={`Reducir cantidad de ${product.name}`} onClick={() => remove(product.id)}>−</button>
                <b>{qty}</b>
                <button aria-label={`Aumentar cantidad de ${product.name}`} onClick={() => add(product.id)} disabled={qty >= product.stock}>+</button>
              </div>
              <strong>S/ {(product.price * qty).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="customer-select">
        <label>Cliente <span>Obligatorio</span></label>
        {selectedClient ? (
          <button className="selected-client" onClick={() => onSelectClient(null)}>
            <UserRound /><span><b>{selectedClient.nombre} {selectedClient.apellidos}</b><small>DNI {selectedClient.dni}</small></span><em>Cambiar</em>
          </button>
        ) : (
          <>
            <div className="client-search"><UserRound /><input aria-label="Buscar cliente por nombre" placeholder="Escribe el nombre del cliente" value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} /></div>
            {clientsLoading && <small>Cargando clientes…</small>}
            {clientsError && <small className="field-error">{clientsError}</small>}
            {!clientsLoading && !clientsError && clientQuery.trim().length < 2 && <small className="client-search-hint">Escribe al menos 2 caracteres para buscar.</small>}
            {!clientsLoading && !clientsError && clientQuery.trim().length >= 2 && (
              <div className="client-results">
                {matchingClients.map((client) => (
                  <button key={client.clienteId} onClick={() => onSelectClient(client.clienteId)}><b>{client.nombre} {client.apellidos}</b><small>DNI {client.dni}</small></button>
                ))}
                {!matchingClients.length && <small className="client-search-empty">No encontramos clientes con ese nombre.</small>}
              </div>
            )}
          </>
        )}
        <button className="text-link new-client" onClick={() => setShowClientModal(true)}><Plus /> Registrar cliente nuevo</button>
      </div>
      <div className="cart-total"><span>Subtotal</span><b>S/ {total.toFixed(2)}</b><span className="total-label">Total</span><strong>S/ {total.toFixed(2)}</strong></div>
      <div className="sale-payment">
        <label htmlFor="payment-method">Método de pago</label>
        <select id="payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={submitting !== null}>
          <option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="TRANSFERENCIA">Transferencia</option>
        </select>
        {paymentMethod === 'EFECTIVO' && <>
          <label htmlFor="cash-register">Caja</label>
          <select id="cash-register" value={cashRegisterId ?? ''} onChange={(event) => setCashRegisterId(Number(event.target.value))} disabled={submitting !== null || !cashRegisters.length}>
            {!cashRegisters.length && <option value="">No hay cajas abiertas</option>}
            {cashRegisters.map((register) => <option key={register.cajaId} value={register.cajaId}>{register.nombre}</option>)}
          </select>
          {cashError && <small className="field-error">{cashError}</small>}
        </>}
      </div>
      {submitError && <p className="form-error" role="alert">{submitError}</p>}
      <button className="primary-button full" disabled={!canComplete} onClick={() => void submit('completed')}>
        {submitting === 'completed' ? 'Completando…' : <>Completar venta <Check /></>}
      </button>
      <button className="secondary-button full" disabled={!canSubmit} onClick={() => void submit('pending')}>
        {submitting === 'pending' ? 'Guardando…' : 'Guardar como pendiente'}
      </button>
      <ClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onCreated={(client) => { onClientCreated(client); onSelectClient(client.clienteId) }} />
    </aside>
  )
}
