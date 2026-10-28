'use client'

import { PageHeader } from '@/components/shared/page-header'
import { RotateCw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useProducts } from '../hooks/use-products'
import { ProductForm } from './product-form'
import type { Product } from '../types'
import { NOTIFICATIONS_REFRESH_EVENT } from '@/features/notificaciones/context/notifications-context'
import { useAuth } from '@/features/auth/context/auth-context'

export function ProductList() {
  const { session } = useAuth()
  const canManageProducts = session?.role === 'ADMIN'
  const { products, isLoading, error, reload } = useProducts({ includeInactive: true })
  const [editing, setEditing] = useState<Product | null | undefined>(undefined)
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter(
      (product) =>
        (status === 'TODOS' || product.status === status) && (!normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)),
    )
  }, [products, query, status])

  return (
    <div className="page products-page">
      <PageHeader
        title="Productos"
        description="Catálogo y existencias obtenidos desde Spring Boot."
        action={canManageProducts ? <button className="primary-button" onClick={() => { setNotice(''); setEditing(null) }}>Nuevo producto</button> : undefined}
      />
      <div className="toolbar">
        <div className="search-box compact">
          <Search />
          <input
            aria-label="Buscar productos"
            placeholder="Buscar por nombre o categoría..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select className="filter-select" aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="TODOS">Todos los estados</option><option value="ACTIVO">Activos</option><option value="INACTIVO">Inactivos</option>
        </select>
        <button className="secondary-button" disabled={isLoading} onClick={() => void reload()}>
          <RotateCw /> Actualizar
        </button>
      </div>
      {notice && <p role="status" className="product-notice">{notice}</p>}
      {isLoading ? (
        <div className="panel request-state">Cargando productos…</div>
      ) : error ? (
        <div className="panel request-state request-error" role="alert">
          <p>{error}</p>
          <button className="secondary-button" onClick={() => void reload()}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="panel table-panel product-table">
          <div className="table-header">
            <span>Producto</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Mínimo</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {visible.map((product) => (
            <div className="table-row" key={product.id}>
              <b>{product.name}</b>
              <span>{product.category}</span>
              <span>S/ {product.price.toFixed(2)}</span>
              <span className={product.stock <= product.min ? 'stock low' : 'stock'}>
                {product.stock}
              </span>
              <span>{product.min}</span>
              <span>{product.status === 'ACTIVO' ? 'Activo' : 'Inactivo'}</span>
              {canManageProducts ? (
                <button className="small-button" aria-label={`Editar ${product.name}`} onClick={() => { setNotice(''); setEditing(product) }}>Editar</button>
              ) : <span>Solo lectura</span>}
            </div>
          ))}
          {!visible.length && (
            <div className="request-state">No se encontraron productos.</div>
          )}
        </div>
      )}
      {canManageProducts && editing !== undefined && <ProductForm product={editing ?? undefined} onClose={() => setEditing(undefined)} onSaved={() => {
        setNotice(editing ? 'Producto actualizado.' : 'Producto creado con su stock inicial.')
        setEditing(undefined)
        void reload()
        window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
      }} />}
    </div>
  )
}
