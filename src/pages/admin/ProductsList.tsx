import { Link } from 'react-router-dom'
import { useAdminProducts } from '../../hooks/useAdminProducts'
import { formatARS } from '../../lib/money'
import { totalStock } from '../../types/shop'

export function ProductsList() {
  const { data: products, isLoading } = useAdminProducts()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-widest text-bone">PRODUCTOS</h1>
        <Link
          to="/admin/productos/nuevo"
          className="rounded bg-rust px-4 py-2 text-sm font-medium uppercase tracking-widest text-bone hover:bg-rust-dark"
        >
          Nuevo producto
        </Link>
      </div>

      {isLoading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {products?.map((p) => (
          <Link
            key={p.id}
            to={`/admin/productos/${p.id}`}
            className="flex items-center justify-between rounded border border-white/10 p-3 hover:border-rust/60"
          >
            <div>
              <p className="text-bone">{p.name}</p>
              <p className="text-sm text-muted">
                {formatARS(p.price_cents)} · stock: {totalStock(p)}
                {!p.is_active && ' · oculto'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
