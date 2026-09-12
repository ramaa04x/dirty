import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useSession } from '../../hooks/useSession'

export function AdminLogin() {
  const { session, isAdmin, loading } = useSession()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session && isAdmin) {
    return <Navigate to="/admin/productos" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setInfo('Cuenta creada. Revisá tu email para confirmar la cuenta antes de iniciar sesión.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-bone">
        {mode === 'login' ? 'INGRESAR' : 'CREAR CUENTA'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Contraseña</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        {info && <p className="text-sm text-muted">{info}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-rust py-3 font-medium uppercase tracking-widest text-bone hover:bg-rust-dark disabled:opacity-60"
        >
          {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="mt-4 text-sm text-muted hover:text-bone"
      >
        {mode === 'login' ? '¿Primera vez? Crear cuenta de administrador' : 'Ya tengo cuenta'}
      </button>
    </div>
  )
}
