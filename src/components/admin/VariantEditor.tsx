import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../types/database'

export function VariantEditor({
  productId,
  variants,
  onChange,
}: {
  productId: string
  variants: Tables<'product_variants'>[]
  onChange: () => void
}) {
  const [newSize, setNewSize] = useState('')

  async function addSize() {
    if (!newSize.trim()) return
    await supabase.from('product_variants').insert({
      product_id: productId,
      size: newSize.trim().toUpperCase(),
      stock: 0,
    })
    setNewSize('')
    onChange()
  }

  async function updateStock(variantId: string, stock: number) {
    await supabase
      .from('product_variants')
      .update({ stock: Math.max(0, stock) })
      .eq('id', variantId)
    onChange()
  }

  async function toggleActive(variant: Tables<'product_variants'>) {
    await supabase
      .from('product_variants')
      .update({ is_active: !variant.is_active })
      .eq('id', variant.id)
    onChange()
  }

  async function removeVariant(variantId: string) {
    await supabase.from('product_variants').delete().eq('id', variantId)
    onChange()
  }

  return (
    <div className="space-y-2">
      {variants.map((v) => (
        <div key={v.id} className="flex items-center gap-3 rounded border border-white/10 p-2">
          <span className="w-16 font-medium text-bone">{v.size}</span>
          <input
            type="number"
            min={0}
            value={v.stock}
            onChange={(e) => updateStock(v.id, Number(e.target.value))}
            className="w-20 rounded border border-white/20 bg-ink-light px-2 py-1 text-bone"
          />
          <span className="text-xs text-muted">stock</span>
          <button
            type="button"
            onClick={() => toggleActive(v)}
            className={`ml-auto text-xs ${v.is_active ? 'text-muted hover:text-bone' : 'text-rust'}`}
          >
            {v.is_active ? 'Ocultar' : 'Reactivar'}
          </button>
          <button
            type="button"
            onClick={() => removeVariant(v.id)}
            className="text-xs text-muted hover:text-rust"
          >
            Eliminar
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Nuevo talle (S, M, L...)"
          className="rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
        />
        <button
          type="button"
          onClick={addSize}
          className="rounded border border-white/20 px-3 py-2 text-sm text-bone hover:border-rust"
        >
          Agregar talle
        </button>
      </div>
    </div>
  )
}
