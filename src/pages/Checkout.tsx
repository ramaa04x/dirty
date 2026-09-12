import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useCartStore, cartTotalCents } from '../store/cartStore'
import { formatARS } from '../lib/money'
import { createPreference } from '../lib/mercadopago'

export function Checkout() {
  const items = useCartStore((s) => s.items)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return <Navigate to="/carrito" replace />
  }

  const total = cartTotalCents(items)

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { initPoint } = await createPreference(
        items,
        { name: form.name, email: form.email, phone: form.phone || undefined },
        {
          street: form.street || undefined,
          city: form.city || undefined,
          province: form.province || undefined,
          postalCode: form.postalCode || undefined,
        }
      )
      window.location.href = initPoint
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl tracking-widest text-bone">CHECKOUT</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Nombre y apellido</label>
          <input
            required
            value={form.name}
            onChange={update('name')}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={update('email')}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Teléfono</label>
          <input
            value={form.phone}
            onChange={update('phone')}
            className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm text-muted">Dirección</label>
            <input
              required
              value={form.street}
              onChange={update('street')}
              className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Ciudad</label>
            <input
              required
              value={form.city}
              onChange={update('city')}
              className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Provincia</label>
            <input
              required
              value={form.province}
              onChange={update('province')}
              className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Código postal</label>
            <input
              required
              value={form.postalCode}
              onChange={update('postalCode')}
              className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-bone">Total</span>
          <span className="text-xl text-rust">{formatARS(total)}</span>
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-rust py-3 font-medium uppercase tracking-widest text-bone transition-colors hover:bg-rust-dark disabled:opacity-60"
        >
          {loading ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
        </button>
      </form>
    </div>
  )
}
