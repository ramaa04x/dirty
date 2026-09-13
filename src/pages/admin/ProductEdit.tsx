import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAdminProduct, slugify } from '../../hooks/useAdminProducts'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { VariantEditor } from '../../components/admin/VariantEditor'
import type { ProductWithRelations } from '../../types/shop'

const CATEGORIES = [
  { value: 'rashguard', label: 'Rashguard' },
  { value: 'shorts', label: 'Shorts deportivos' },
]

const SLEEVE_TYPES = [
  { value: '', label: 'No aplica' },
  { value: 'corta', label: 'Manga corta' },
  { value: 'larga', label: 'Manga larga' },
]

export function ProductEdit() {
  const { id } = useParams()
  const isNew = id === 'nuevo'
  const { data: product, isLoading, refetch } = useAdminProduct(isNew ? undefined : id)

  if (!isNew && isLoading) {
    return <p className="text-muted">Cargando...</p>
  }

  return <ProductForm key={product?.id ?? 'nuevo'} product={isNew ? null : (product ?? null)} refetch={refetch} />
}

function ProductForm({
  product,
  refetch,
}: {
  product: ProductWithRelations | null
  refetch: () => void
}) {
  const { id: routeId } = useParams()
  const isNew = product === null
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [priceArs, setPriceArs] = useState(product ? String(product.price_cents / 100) : '')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0].value)
  const [sleeveType, setSleeveType] = useState(product?.sleeve_type ?? '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(!isNew)

  function invalidateLists() {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const priceCents = Math.round(Number(priceArs) * 100)
      if (!Number.isFinite(priceCents) || priceCents < 0) {
        throw new Error('Precio inválido')
      }

      if (isNew) {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name,
            slug: slug || slugify(name),
            description: description || null,
            price_cents: priceCents,
            category: category || null,
            sleeve_type: sleeveType || null,
            is_active: isActive,
          })
          .select()
          .single()
        if (error) throw error
        invalidateLists()
        navigate(`/admin/productos/${data.id}`, { replace: true })
      } else {
        const { error } = await supabase
          .from('products')
          .update({
            name,
            slug,
            description: description || null,
            price_cents: priceCents,
            category: category || null,
            sleeve_type: sleeveType || null,
            is_active: isActive,
          })
          .eq('id', routeId!)
        if (error) throw error
        invalidateLists()
        refetch()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (isNew || !routeId) return
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    await supabase.from('products').delete().eq('id', routeId)
    invalidateLists()
    navigate('/admin/productos')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-bone">
        {isNew ? 'NUEVO PRODUCTO' : 'EDITAR PRODUCTO'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Nombre</label>
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugTouched(true)
            }}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted">Precio (ARS)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={priceArs}
              onChange={(e) => setPriceArs(e.target.value)}
              className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Tipo de manga</label>
          <select
            value={sleeveType}
            onChange={(e) => setSleeveType(e.target.value)}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          >
            {SLEEVE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-bone">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible en la tienda
        </label>

        {error && <p className="text-sm text-rust">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-rust px-6 py-2 font-medium uppercase tracking-widest text-bone hover:bg-rust-dark disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded border border-white/20 px-6 py-2 text-sm text-muted hover:border-rust hover:text-rust"
            >
              Eliminar producto
            </button>
          )}
        </div>
      </form>

      {product && !isNew && (
        <>
          <div className="mt-10">
            <h2 className="mb-3 text-sm uppercase tracking-widest text-muted">Imágenes</h2>
            <ImageUploader productId={product.id} images={product.product_images} onChange={refetch} />
          </div>
          <div className="mt-10">
            <h2 className="mb-3 text-sm uppercase tracking-widest text-muted">Talles y stock</h2>
            <VariantEditor productId={product.id} variants={product.product_variants} onChange={refetch} />
          </div>
        </>
      )}
    </div>
  )
}
