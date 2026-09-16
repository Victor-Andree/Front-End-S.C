'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Package, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSaleCart } from '../hooks/use-sale-cart'
import { SaleSummary } from './sale-summary'
export function Sales() {
  const router = useRouter()
  const { query, setQuery, visible, add, remove, items, total } = useSaleCart()
  return (
    <div className="page sales-page">
      <PageHeader
        eyebrow="Ventas / Nueva venta"
        title="Nueva venta"
        description="Agrega productos y completa la venta en pocos pasos."
      />
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
            <button className="filter-button">
              <SlidersHorizontal /> Categoría
            </button>
          </div>
          <div className="category-row">
            <button className="category active">Todos</button>
            {['Peces', 'Alimentos', 'Filtros', 'Acondicionadores'].map((c) => (
              <button className="category" key={c}>
                {c}
              </button>
            ))}
          </div>
          <div className="product-list">
            {visible.map((p) => (
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
                <button className="add-button" onClick={() => add(p.id)}>
                  <Plus /> Agregar
                </button>
              </div>
            ))}
          </div>
        </section>
        <SaleSummary
          items={items}
          total={total}
          add={add}
          remove={remove}
          onComplete={() => router.push('/ventas/pendientes')}
        />
      </div>
    </div>
  )
}
