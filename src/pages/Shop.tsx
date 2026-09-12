import { ProductCard } from '../components/storefront/ProductCard'
import { useProducts } from '../hooks/useProducts'

export function Shop() {
  const { data: products, isLoading, error } = useProducts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl tracking-widest text-bone">TIENDA</h1>
      {isLoading && <p className="text-muted">Cargando productos...</p>}
      {error && <p className="text-rust">No pudimos cargar los productos.</p>}
      {products && products.length === 0 && (
        <p className="text-muted">Todavía no hay productos cargados.</p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
