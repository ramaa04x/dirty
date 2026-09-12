import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return data
    },
  })
}
