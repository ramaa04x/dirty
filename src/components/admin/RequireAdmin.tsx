import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useSession()

  if (loading) {
    return <div className="p-10 text-center text-muted">Cargando...</div>
  }
  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}
