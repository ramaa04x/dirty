import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  variantId: string
  productId: string
  productName: string
  slug: string
  size: string
  unitPriceCents: number
  quantity: number
  maxStock: number
  imageUrl: string | null
}

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (variantId: string) => void
  setQuantity: (variantId: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            const quantity = Math.min(existing.quantity + item.quantity, existing.maxStock)
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      remove: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'dirty-cart' }
  )
)

export function cartTotalCents(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0)
}
