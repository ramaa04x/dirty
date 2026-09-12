import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-product', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    },
  })
}

const DIACRITICS_REGEX = new RegExp('[̀-ͯ]', 'g')

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
