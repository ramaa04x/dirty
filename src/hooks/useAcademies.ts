import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAcademies() {
  return useQuery({
    queryKey: ['academies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academies')
        .select('*, academy_photos(*)')
        .eq('is_active', true)
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
