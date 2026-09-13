import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { SizeSelector } from '../components/storefront/SizeSelector'
import { BUCKETS, publicUrl } from '../lib/supabase'
import { formatARS } from '../lib/money'
import { useCartStore } from '../store/cartStore'

export function ProductDetail() {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProduct(slug)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.add)

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-16 text-muted">Cargando...</div>
  if (error || !product)
    return <div className="mx-auto max-w-4xl px-4 py-16 text-rust">Producto no encontrado.</div>

  const selectedVariant = product.product_variants.find((v) => v.id === selectedVariantId)
  const images = [...product.product_images].sort((a, b) => a.position - b.position)
  const currentImage = images[activeImage] ?? images[0]

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId)
    setQuantity(1)
  }

  function addSelectionToCart() {
    if (!selectedVariant) return false
    addToCart({
      variantId: selectedVariant.id,
      productId: product!.id,
      productName: product!.name,
      slug: product!.slug,
      size: selectedVariant.size,
      unitPriceCents: selectedVariant.price_override_cents ?? product!.price_cents,
      quantity,
      maxStock: selectedVariant.stock,
      imageUrl: currentImage ? publicUrl(BUCKETS.productImages, currentImage.storage_path) : null,
    })
    return true
  }

  function handleAdd() {
    if (!addSelectionToCart()) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    if (!addSelectionToCart()) return
    navigate('/checkout')
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-lg bg-white/5">
          {currentImage ? (
            <img
              src={publicUrl(BUCKETS.productImages, currentImage.storage_path)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              Sin imagen
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 overflow-hidden rounded border transition-colors ${
                  i === activeImage ? 'border-rust' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={publicUrl(BUCKETS.productImages, img.storage_path)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
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
            onSelect={selectVariant}
          />
        </div>

        {selectedVariant && (
          <div className="mt-6">
            <p className="mb-2 text-sm uppercase tracking-widest text-muted">Cantidad</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-9 w-9 rounded border border-white/20 text-bone hover:border-rust disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <span className="w-6 text-center text-bone">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                disabled={quantity >= selectedVariant.stock}
                className="h-9 w-9 rounded border border-white/20 text-bone hover:border-rust disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
              <span className="text-xs text-muted">{selectedVariant.stock} disponibles</span>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            type="button"
            disabled={!selectedVariant}
            onClick={handleBuyNow}
            className="w-full rounded bg-rust py-3 font-medium uppercase tracking-widest text-bone transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted"
          >
            Comprar ahora
          </button>
          <button
            type="button"
            disabled={!selectedVariant}
            onClick={handleAdd}
            className="w-full rounded border border-rust py-3 font-medium uppercase tracking-widest text-rust transition-colors hover:bg-rust hover:text-bone disabled:cursor-not-allowed disabled:border-white/10 disabled:text-muted"
          >
            {added ? 'Agregado ✓' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
