import { Link } from 'react-router-dom'
import { useCartStore, cartTotalCents } from '../store/cartStore'
import { formatARS } from '../lib/money'

export function Cart() {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const total = cartTotalCents(items)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link to="/tienda" className="mt-4 inline-block text-rust hover:underline">
          Ir a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl tracking-widest text-bone">CARRITO</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 rounded border border-white/10 p-4"
          >
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white/5">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-bone">{item.productName}</p>
              <p className="text-sm text-muted">Talle {item.size}</p>
              <p className="text-rust">{formatARS(item.unitPriceCents)}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={item.quantity}
                onChange={(e) => setQuantity(item.variantId, Number(e.target.value))}
                className="rounded border border-white/20 bg-ink px-2 py-1 text-bone"
              >
                {Array.from({ length: item.maxStock }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                onClick={() => remove(item.variantId)}
                className="text-sm text-muted hover:text-rust"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-lg text-bone">Total</span>
        <span className="text-xl text-rust">{formatARS(total)}</span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block w-full rounded bg-rust py-3 text-center font-medium uppercase tracking-widest text-bone transition-colors hover:bg-rust-dark"
      >
        Ir a pagar
      </Link>
    </div>
  )
}
