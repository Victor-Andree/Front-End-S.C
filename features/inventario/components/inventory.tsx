'use client'

import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { useAuth } from '@/features/auth/context/auth-context'
import { NOTIFICATIONS_REFRESH_EVENT } from '@/features/notificaciones/context/notifications-context'
import type { StockResponse } from '@/features/productos/types'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { RotateCw, Search } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adjustInventory, getInventory, registerMovement } from '../api/inventory'

type Action = 'INCOME' | 'OUTCOME' | 'ADJUST'

function tone(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'NORMAL') return 'success'
  if (status === 'AGOTADO' || status === 'CRITICO') return 'danger'
  return 'warning'
}

function MovementDialog({ stock, action, onClose, onSaved }: {
  stock: StockResponse
  action: Action
  onClose: () => void
  onSaved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  const title = action === 'INCOME' ? 'Registrar ingreso' : action === 'OUTCOME' ? 'Registrar salida' : 'Ajustar stock físico'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const data = new FormData(event.currentTarget)
    const quantity = Number(data.get('quantity'))
    const observation = String(data.get('observation') ?? '')
    if (!Number.isInteger(quantity) || quantity < (action === 'ADJUST' ? 0 : 1)) {
      setError(action === 'ADJUST' ? 'Ingresa un stock final entero mayor o igual a cero.' : 'Ingresa una cantidad entera mayor a cero.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (action === 'ADJUST') await adjustInventory(stock.productoId, quantity, observation)
      else await registerMovement(stock.productoId, quantity, action)
      onSaved()
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'No se pudo registrar el movimiento.'))
    } finally { setSaving(false) }
  }

  return (
    <dialog ref={dialog} className="client-modal product-modal" aria-labelledby="movement-title"
      onCancel={(event) => { event.preventDefault(); if (!saving) onClose() }}>
      <h2 id="movement-title">{title}</h2>
      <p className="muted">{stock.productoNombre} · Stock actual: {stock.cantidadActual}</p>
      <form onSubmit={submit}>
        <fieldset disabled={saving}>
          <label>{action === 'ADJUST' ? 'Cantidad física real' : 'Cantidad'}
            <input name="quantity" type="number" min={action === 'ADJUST' ? 0 : 1} step="1" required autoFocus />
          </label>
          {action === 'ADJUST' && <label className="full-width">Observación
            <textarea name="observation" rows={3} maxLength={250} placeholder="Motivo o referencia del ajuste" />
          </label>}
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" disabled={saving} onClick={onClose}>Cancelar</button>
          <button className="primary-button" disabled={saving}>{saving ? 'Guardando…' : 'Confirmar movimiento'}</button>
        </div>
      </form>
    </dialog>
  )
}

export function Inventory() {
  const { session } = useAuth()
  const canManage = session?.role === 'ADMIN'
  const [stocks, setStocks] = useState<StockResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [selected, setSelected] = useState<{ stock: StockResponse; action: Action } | null>(null)
  const [notice, setNotice] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setStocks(await getInventory()) }
    catch (cause) { setError(getApiErrorMessage(cause, 'No se pudo cargar el inventario.')) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void reload() }, [reload])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return stocks.filter((stock) =>
      (status === 'TODOS' || stock.estadoStock === status)
      && (!normalized || stock.productoNombre.toLowerCase().includes(normalized)))
  }, [query, status, stocks])

  function open(stock: StockResponse, action: Action) {
    setNotice('')
    setSelected({ stock, action })
  }

  return (
    <div className="page">
      <PageHeader title="Inventario" description={canManage ? 'Registra ingresos, salidas y ajustes físicos de existencias.' : 'Consulta existencias y comunica al administrador cualquier diferencia.'} />
      <div className="toolbar">
        <div className="search-box compact"><Search /><input aria-label="Buscar inventario" placeholder="Buscar producto..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <select className="filter-select" aria-label="Filtrar por estado de stock" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="TODOS">Todos los estados</option><option value="NORMAL">Normal</option><option value="BAJO">Bajo</option><option value="CRITICO">Crítico</option><option value="AGOTADO">Agotado</option>
        </select>
        <button className="secondary-button" disabled={loading} onClick={() => void reload()}><RotateCw /> Actualizar</button>
      </div>
      {notice && <p className="product-notice" role="status">{notice}</p>}
      {loading ? <div className="panel request-state">Cargando inventario…</div> : error ? (
        <div className="panel request-state request-error" role="alert"><p>{error}</p><button className="secondary-button" onClick={() => void reload()}>Reintentar</button></div>
      ) : (
        <div className="panel table-panel inventory-table">
          <div className="table-header"><span>Producto</span><span>Stock actual</span><span>Mínimo</span><span>Estado</span><span>Actualizado</span><span>Acciones</span></div>
          {visible.map((stock) => (
            <div className="table-row" key={stock.stockId}>
              <b>{stock.productoNombre}</b><span>{stock.cantidadActual}</span><span>{stock.stockMinimo}</span>
              <StatusBadge tone={tone(stock.estadoStock)}>{stock.estadoStock}</StatusBadge>
              <span>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(stock.fechaActualizacion))}</span>
              {canManage ? <span className="inventory-actions"><button className="small-button" onClick={() => open(stock, 'INCOME')}>Ingreso</button><button className="small-button" onClick={() => open(stock, 'OUTCOME')}>Salida</button><button className="small-button" onClick={() => open(stock, 'ADJUST')}>Ajustar</button></span> : <span>Solo lectura</span>}
            </div>
          ))}
          {!visible.length && <div className="request-state">No se encontraron existencias.</div>}
        </div>
      )}
      {selected && <MovementDialog {...selected} onClose={() => setSelected(null)} onSaved={() => {
        setNotice('Movimiento registrado correctamente.')
        setSelected(null)
        void reload()
        window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
      }} />}
    </div>
  )
}
