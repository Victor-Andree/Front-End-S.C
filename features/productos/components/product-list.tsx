'use client'

import { PageHeader } from '@/components/shared/page-header'
import { RotateCw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useProducts } from '../hooks/use-products'

export function ProductList() {
  const { products, isLoading, error, reload } = useProducts()
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter(
      (product) =>
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized),
    )
  }, [products, query])

  return (
    <div className="page">
      <PageHeader
        title="Productos"
        description="Catálogo y existencias obtenidos desde Spring Boot."
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
        <button className="secondary-button" onClick={() => void reload()}>
          <RotateCw /> Actualizar
        </button>
      </div>
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
            </div>
          ))}
          {!visible.length && (
            <div className="request-state">No se encontraron productos.</div>
          )}
        </div>
      )}
    </div>
  )
}
