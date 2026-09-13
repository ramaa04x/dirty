import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useShowcasePhotos() {
  return useQuery({
    queryKey: ['showcase-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_photos')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
