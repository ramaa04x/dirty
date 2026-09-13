import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useInstagramPosts() {
  return useQuery({
    queryKey: ['instagram-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
