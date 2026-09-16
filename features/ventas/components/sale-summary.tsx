import { Check, ChevronDown, ShoppingCart, UserRound, X } from 'lucide-react'
import type { SaleCartItem } from '../types'

type Props = {
  items: SaleCartItem[]
  total: number
  add: (id: number) => void
  remove: (id: number) => void
  onComplete: () => void
}

export function SaleSummary({ items, total, add, remove, onComplete }: Props) {
  return (
    <aside className="cart-panel">
      <div className="cart-heading">
        <div>
          <h2>Venta actual</h2>
          <p className="muted">{items.length} productos</p>
        </div>
        <button className="icon-button" aria-label="Cerrar venta">
          <X />
        </button>
      </div>
      {items.length === 0 ? (
        <div className="cart-empty">
          <ShoppingCart />
          <b>Tu venta está vacía</b>
          <span>Agrega productos de la lista para comenzar.</span>
        </div>
      ) : (
        <div className="cart-items">
          {items.map(({ product, qty }) => (
            <div className="cart-item" key={product.id}>
              <span>
                <b>{product.name}</b>
                <small>S/ {product.price.toFixed(2)} c/u</small>
              </span>
              <div className="qty">
                <button
                  aria-label={`Reducir cantidad de ${product.name}`}
                  onClick={() => remove(product.id)}
                >
                  −
                </button>
                <b>{qty}</b>
                <button
                  aria-label={`Aumentar cantidad de ${product.name}`}
                  onClick={() => add(product.id)}
                >
                  +
                </button>
              </div>
              <strong>S/ {(product.price * qty).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="customer-select">
        <label>
          Cliente <span>Opcional</span>
        </label>
        <div className="select-fake">
          <UserRound /> Buscar cliente <ChevronDown />
        </div>
      </div>
      <div className="cart-total">
        <span>Subtotal</span>
        <b>S/ {total.toFixed(2)}</b>
        <span className="total-label">Total</span>
        <strong>S/ {total.toFixed(2)}</strong>
      </div>
      <button
        className="primary-button full"
        disabled={!items.length}
        onClick={onComplete}
      >
        Completar venta <Check />
      </button>
      <button className="secondary-button full" disabled={!items.length}>
        Guardar como pendiente
      </button>
    </aside>
  )
}
