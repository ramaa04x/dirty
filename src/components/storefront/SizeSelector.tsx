import type { Tables } from '../../types/database'

export function SizeSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: Tables<'product_variants'>[]
  selected: string | null
  onSelect: (variantId: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants
        .filter((v) => v.is_active)
        .map((variant) => {
          const disabled = variant.stock === 0
          const isSelected = variant.id === selected
          return (
            <button
              key={variant.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(variant.id)}
              className={`rounded border px-4 py-2 text-sm transition-colors ${
                disabled
                  ? 'cursor-not-allowed border-white/10 text-muted line-through'
                  : isSelected
                    ? 'border-rust bg-rust text-bone'
                    : 'border-white/20 text-bone hover:border-rust'
              }`}
            >
              {variant.size}
              {disabled && ' · sin stock'}
            </button>
          )
        })}
    </div>
  )
}
