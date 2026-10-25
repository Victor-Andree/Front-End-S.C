'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Package, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useClients } from '@/features/clientes/hooks/use-clients'
import { createPendingSale, createSale } from '../api/sales'
import { NOTIFICATIONS_REFRESH_EVENT } from '@/features/notificaciones/context/notifications-context'
import { useSaleCart } from '../hooks/use-sale-cart'
import { SaleSummary } from './sale-summary'
export function Sales() {
  const router = useRouter()
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [success, setSuccess] = useState('')
  const { clients, isLoading: clientsLoading, error: clientsError, addClient } = useClients()
  const {
    query,
    setQuery,
    category,
    setCategory,
    categories,
    visible,
    add,
    remove,
    items,
    total,
    isLoading,
    error,
    reload,
    clear,
  } = useSaleCart()

  async function submitSale(mode: 'completed' | 'pending') {
    if (!selectedClientId || !items.length) return
    const request = {
      clienteId: selectedClientId,
      detalles: items.map(({ product, qty }) => ({ productoId: product.id, cantidad: qty })),
    }
    const sale = mode === 'pending'
      ? await createPendingSale(request)
      : await createSale(request)
    clear()
    setSelectedClientId(null)
    setSuccess(mode === 'pending' ? `Venta #${sale.ventaId} guardada como pendiente.` : `Venta #${sale.ventaId} completada.`)
    await reload()
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
    if (mode === 'pending') router.push('/ventas/pendientes')
  }
  return (
    <div className="page sales-page">
      <PageHeader
        eyebrow="Ventas / Nueva venta"
        title="Nueva venta"
        description="Agrega productos y completa la venta en pocos pasos."
      />
      {success && <p className="success-message" role="status">{success}</p>}
      <div className="sales-layout">
        <section className="product-browser">
          <div className="search-row">
            <div className="search-box">
              <Search />
              <input
                aria-label="Buscar productos por nombre"
                placeholder="Buscar productos por nombre..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <label className="filter-button filter-select">
              <SlidersHorizontal />
              <select aria-label="Filtrar por categoría" value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="category-row">
            {categories.map((item) => (
              <button className={category === item ? 'category active' : 'category'} key={item} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="product-list">
            {isLoading && <div className="request-state">Cargando productos…</div>}
            {error && (
              <div className="request-state request-error" role="alert">
                <p>{error}</p>
                <button className="secondary-button" onClick={() => void reload()}>
                  Reintentar
                </button>
              </div>
            )}
            {!isLoading && !error && visible.map((p) => (
              <div className="product-row" key={p.id}>
                <span className="product-icon large">
                  <Package />
                </span>
                <span className="row-main">
                  <b>{p.name}</b>
                  <small>{p.category}</small>
                </span>
                <span className="product-price">S/ {p.price.toFixed(2)}</span>
                <span className={p.stock <= p.min ? 'stock low' : 'stock'}>
                  {p.stock} disponibles
                </span>
                <button
                  className="add-button"
                  onClick={() => add(p.id)}
                  disabled={p.stock === 0}
                >
                  <Plus /> Agregar
                </button>
              </div>
            ))}
            {!isLoading && !error && visible.length === 0 && <div className="request-state">No hay productos en esta categoría.</div>}
          </div>
        </section>
        <SaleSummary
          items={items}
          total={total}
          add={add}
          remove={remove}
          clients={clients}
          clientsLoading={clientsLoading}
          clientsError={clientsError}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          onClientCreated={addClient}
          onSubmit={submitSale}
        />
      </div>
    </div>
  )
}
