import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkAdmin(currentSession: Session | null) {
      if (!currentSession) {
        if (mounted) setIsAdmin(false)
        return
      }
      const { data } = await supabase.rpc('is_admin')
      if (mounted) setIsAdmin(!!data)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      checkAdmin(data.session).finally(() => mounted && setLoading(false))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(true)
      checkAdmin(newSession).finally(() => mounted && setLoading(false))
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { session, isAdmin, loading }
}
