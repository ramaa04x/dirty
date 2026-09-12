import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useHeroContent() {
  return useQuery({
    queryKey: ['hero-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
