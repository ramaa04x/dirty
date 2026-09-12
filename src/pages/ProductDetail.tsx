import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { SizeSelector } from '../components/storefront/SizeSelector'
import { BUCKETS, publicUrl } from '../lib/supabase'
import { formatARS } from '../lib/money'
import { useCartStore } from '../store/cartStore'
import { coverImagePath } from '../types/shop'

export function ProductDetail() {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProduct(slug)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((s) => s.add)

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-16 text-muted">Cargando...</div>
  if (error || !product)
    return <div className="mx-auto max-w-4xl px-4 py-16 text-rust">Producto no encontrado.</div>

  const selectedVariant = product.product_variants.find((v) => v.id === selectedVariantId)
  const imagePath = coverImagePath(product)

  function handleAdd() {
    if (!selectedVariant) return
    addToCart({
      variantId: selectedVariant.id,
      productId: product!.id,
      productName: product!.name,
      slug: product!.slug,
      size: selectedVariant.size,
      unitPriceCents: selectedVariant.price_override_cents ?? product!.price_cents,
      quantity: 1,
      maxStock: selectedVariant.stock,
      imageUrl: imagePath ? publicUrl(BUCKETS.productImages, imagePath) : null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-white/5">
        {imagePath ? (
          <img
            src={publicUrl(BUCKETS.productImages, imagePath)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            Sin imagen
          </div>
        )}
      </div>
      <div>
        <h1 className="font-display text-2xl tracking-wide text-bone">{product.name}</h1>
        <p className="mt-2 text-xl text-rust">{formatARS(product.price_cents)}</p>
        {product.description && <p className="mt-4 text-muted">{product.description}</p>}

        <div className="mt-8">
          <p className="mb-2 text-sm uppercase tracking-widest text-muted">Talle</p>
          <SizeSelector
            variants={product.product_variants}
            selected={selectedVariantId}
            onSelect={setSelectedVariantId}
          />
        </div>

        <button
          type="button"
          disabled={!selectedVariant}
          onClick={handleAdd}
          className="mt-8 w-full rounded bg-rust py-3 font-medium uppercase tracking-widest text-bone transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted"
        >
          {added ? 'Agregado ✓' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
