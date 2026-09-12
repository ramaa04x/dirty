import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatARS } from '../lib/money'
import { useCartStore } from '../store/cartStore'

type OrderStatus = {
  id: string
  status: string
  mp_status: string | null
  total_cents: number
  currency: string
  created_at: string
  items: { product_name: string; size: string; quantity: number; unit_price_cents: number }[]
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  approved: { title: '¡Pago aprobado!', body: 'Ya estamos preparando tu pedido.' },
  pending: { title: 'Pago pendiente', body: 'Estamos esperando la confirmación de Mercado Pago.' },
  rejected: { title: 'Pago rechazado', body: 'El pago no pudo procesarse. Podés intentar de nuevo.' },
  cancelled: { title: 'Pago cancelado', body: 'El pago fue cancelado.' },
}

export function OrderResult() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const clearCart = useCartStore((s) => s.clear)

  useEffect(() => {
    if (!id) return
    let attempts = 0
    let cancelled = false

    async function fetchStatus() {
      const { data } = await supabase.functions.invoke<OrderStatus>(
        `get-order-status?orderId=${id}`,
        { method: 'GET' }
      )
      if (cancelled) return
      if (data) {
        setOrder(data)
        if (data.status === 'approved') clearCart()
      }
      setLoading(false)
      attempts += 1
      if (attempts < 6 && (!data || data.status === 'pending')) {
        setTimeout(fetchStatus, 2500)
      }
    }

    fetchStatus()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fallbackStatus = searchParams.get('status')
  const status = order?.status ?? (fallbackStatus === 'success' ? 'pending' : fallbackStatus ?? 'pending')
  const copy = STATUS_COPY[status] ?? STATUS_COPY.pending

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {loading && !order && <p className="text-muted">Confirmando tu pago...</p>}
      {(!loading || order) && (
        <>
          <h1 className="font-display text-3xl tracking-widest text-bone">{copy.title}</h1>
          <p className="mt-3 text-muted">{copy.body}</p>
          {order && (
            <div className="mt-8 space-y-2 rounded border border-white/10 p-4 text-left">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-bone">
                  <span>
                    {item.product_name} ({item.size}) x{item.quantity}
                  </span>
                  <span>{formatARS(item.unit_price_cents * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-2 font-medium text-bone">
                <span>Total</span>
                <span>{formatARS(order.total_cents)}</span>
              </div>
            </div>
          )}
          <Link to="/tienda" className="mt-8 inline-block text-rust hover:underline">
            Volver a la tienda
          </Link>
        </>
      )}
    </div>
  )
}
