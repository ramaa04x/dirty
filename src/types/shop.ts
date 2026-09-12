import type { Tables } from './database'

export type ProductWithRelations = Tables<'products'> & {
  product_images: Tables<'product_images'>[]
  product_variants: Tables<'product_variants'>[]
}

export function coverImagePath(product: ProductWithRelations) {
  const sorted = [...product.product_images].sort((a, b) => a.position - b.position)
  return sorted[0]?.storage_path ?? null
}

export function totalStock(product: ProductWithRelations) {
  return product.product_variants
    .filter((v) => v.is_active)
    .reduce((sum, v) => sum + v.stock, 0)
}
