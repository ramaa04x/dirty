import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../components/storefront/ProductCard'
import { useProducts } from '../hooks/useProducts'
import { totalStock } from '../types/shop'
import { CATEGORIES, categoryLabel } from '../lib/categories'
import { sortSizes } from '../lib/sizes'

const SLEEVE_LABELS: Record<string, string> = {
  corta: 'Manga corta',
  larga: 'Manga larga',
}

function toggle<T>(set: Set<T>, value: T) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function Shop() {
  const { category } = useParams<{ category?: string }>()
  const { data: products, isLoading, error } = useProducts()
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sizes, setSizes] = useState<Set<string>>(new Set())
  const [sleeves, setSleeves] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)

  const inCategory = useMemo(
    () => (category ? products?.filter((p) => p.category === category) : products) ?? [],
    [products, category]
  )

  const availableSizes = useMemo(() => {
    const set = new Set<string>()
    inCategory.forEach((p) => p.product_variants.forEach((v) => v.is_active && set.add(v.size)))
    return sortSizes([...set], (s) => s)
  }, [inCategory])

  const availableSleeves = useMemo(() => {
    const set = new Set<string>()
    inCategory.forEach((p) => p.sleeve_type && set.add(p.sleeve_type))
    return [...set]
  }, [inCategory])

  const filtered = useMemo(() => {
    return inCategory.filter((p) => {
      if (sleeves.size > 0 && !(p.sleeve_type && sleeves.has(p.sleeve_type))) return false
      if (onlyInStock && totalStock(p) === 0) return false
      if (sizes.size > 0) {
        const hasSize = p.product_variants.some(
          (v) => v.is_active && sizes.has(v.size) && (!onlyInStock || v.stock > 0)
        )
        if (!hasSize) return false
      }
      return true
    })
  }, [inCategory, sleeves, sizes, onlyInStock])

  const activeFilterCount = sleeves.size + sizes.size + (onlyInStock ? 1 : 0)

  const filtersContent = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted">Categoría</p>
        <div className="space-y-1">
          <Link
            to="/tienda"
            className={`block text-sm ${!category ? 'font-semibold text-bone' : 'text-muted hover:text-bone'}`}
          >
            Todos
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to={`/tienda/${c.value}`}
              className={`block text-sm ${
                category === c.value ? 'font-semibold text-bone' : 'text-muted hover:text-bone'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-bone">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
          />
          En stock
        </label>
      </div>

      {availableSizes.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Talle</p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = sizes.has(size)
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSizes((prev) => toggle(prev, size))}
                  className={`rounded border px-3 py-1 text-sm transition-colors ${
                    isSelected
                      ? 'border-rust bg-rust text-bone'
                      : 'border-white/20 text-bone hover:border-rust'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {category === 'rashguards' && availableSleeves.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Manga</p>
          <div className="space-y-1">
            {availableSleeves.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-bone">
                <input
                  type="checkbox"
                  checked={sleeves.has(s)}
                  onChange={() => setSleeves((prev) => toggle(prev, s))}
                />
                {SLEEVE_LABELS[s] ?? s}
              </label>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setOnlyInStock(false)
            setSizes(new Set())
            setSleeves(new Set())
          }}
          className="text-sm text-rust hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl tracking-widest text-bone">
        {category ? categoryLabel(category).toUpperCase() : 'TIENDA'}
      </h1>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        className="mb-6 flex w-full items-center justify-between rounded border border-white/20 px-4 py-3 text-sm uppercase tracking-widest text-bone sm:hidden"
      >
        Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
        <span>{filtersOpen ? '−' : '+'}</span>
      </button>

      <div className="flex flex-col gap-10 sm:flex-row">
        <aside className={`w-full flex-shrink-0 sm:block sm:w-52 ${filtersOpen ? 'block' : 'hidden'}`}>
          {filtersContent}
        </aside>

        <div className="flex-1">
          {isLoading && <p className="text-muted">Cargando productos...</p>}
          {error && <p className="text-rust">No pudimos cargar los productos.</p>}
          {products && products.length === 0 && (
            <p className="text-muted">Todavía no hay productos cargados.</p>
          )}
          {inCategory.length > 0 && filtered.length === 0 && (
            <p className="text-muted">Ningún producto coincide con esos filtros.</p>
          )}
          {products && products.length > 0 && inCategory.length === 0 && (
            <p className="text-muted">Todavía no hay productos en esta categoría.</p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
