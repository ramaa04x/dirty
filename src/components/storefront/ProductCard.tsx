import { Link } from 'react-router-dom'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { formatARS } from '../../lib/money'
import { coverImagePath, totalStock, type ProductWithRelations } from '../../types/shop'

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const imagePath = coverImagePath(product)
  const outOfStock = totalStock(product) === 0

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-white/10 bg-ink-light transition-colors hover:border-rust/60"
    >
      <div className="aspect-square overflow-hidden bg-white/5">
        {imagePath ? (
          <img
            src={publicUrl(BUCKETS.productImages, imagePath)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-bone">{product.name}</h3>
        <p className="mt-1 text-rust">{formatARS(product.price_cents)}</p>
        {outOfStock && <p className="mt-1 text-xs text-muted">Sin stock</p>}
      </div>
    </Link>
  )
}
