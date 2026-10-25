'use client'

import { ClientModal } from '@/features/clientes/components/client-modal'
import type { Client } from '@/features/clientes/types'
import { Check, Plus, ShoppingCart, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useRef } from 'react'
import type { SaleCartItem } from '../types'
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
  onSubmit: (mode: 'completed' | 'pending') => Promise<void>
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
  const selectedClient = clients.find((client) => client.clienteId === selectedClientId)
  const matchingClients = useMemo(() => {
    const query = clientQuery.trim().toLowerCase()
    if (!query) return clients.slice(0, 5)
    return clients.filter((client) =>
      `${client.nombre} ${client.apellidos} ${client.dni}`.toLowerCase().includes(query),
    ).slice(0, 5)
  }, [clientQuery, clients])
  const canSubmit = items.length > 0 && selectedClientId !== null && !submitting

  async function submit(mode: 'completed' | 'pending') {
    if (requestInFlight.current || !canSubmit) return
    requestInFlight.current = true
    setSubmitting(mode)
    setSubmitError('')
    try {
      await onSubmit(mode)
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
            <div className="client-search"><UserRound /><input aria-label="Buscar cliente" placeholder="Nombre o DNI" value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} /></div>
            {clientsLoading && <small>Cargando clientes…</small>}
            {clientsError && <small className="field-error">{clientsError}</small>}
            {!clientsLoading && !clientsError && (
              <div className="client-results">
                {matchingClients.map((client) => (
                  <button key={client.clienteId} onClick={() => onSelectClient(client.clienteId)}><b>{client.nombre} {client.apellidos}</b><small>DNI {client.dni}</small></button>
                ))}
              </div>
            )}
          </>
        )}
        <button className="text-link new-client" onClick={() => setShowClientModal(true)}><Plus /> Registrar cliente nuevo</button>
      </div>
      <div className="cart-total"><span>Subtotal</span><b>S/ {total.toFixed(2)}</b><span className="total-label">Total</span><strong>S/ {total.toFixed(2)}</strong></div>
      {submitError && <p className="form-error" role="alert">{submitError}</p>}
      <button className="primary-button full" disabled={!canSubmit} onClick={() => void submit('completed')}>
        {submitting === 'completed' ? 'Completando…' : <>Completar venta <Check /></>}
      </button>
      <button className="secondary-button full" disabled={!canSubmit} onClick={() => void submit('pending')}>
        {submitting === 'pending' ? 'Guardando…' : 'Guardar como pendiente'}
      </button>
      <ClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onCreated={(client) => { onClientCreated(client); onSelectClient(client.clienteId) }} />
    </aside>
  )
}
