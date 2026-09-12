import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatARS } from '../../lib/money'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

export function OrdersList() {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  async function updateStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl tracking-widest text-bone">PEDIDOS</h1>
      {isLoading && <p className="text-muted">Cargando...</p>}
      {orders?.length === 0 && <p className="text-muted">Todavía no hay pedidos.</p>}

      <div className="space-y-2">
        {orders?.map((order) => (
          <div key={order.id} className="rounded border border-white/10 p-3">
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="text-bone">
                  {order.customer_name} · {formatARS(order.total_cents)}
                </p>
                <p className="text-sm text-muted">
                  {new Date(order.created_at).toLocaleString('es-AR')} ·{' '}
                  {STATUS_LABEL[order.status] ?? order.status}
                </p>
              </div>
            </button>

            {expanded === order.id && (
              <div className="mt-3 space-y-3 border-t border-white/10 pt-3 text-sm">
                <p className="text-muted">{order.customer_email} · {order.customer_phone}</p>
                {order.shipping_address && (
                  <p className="text-muted">{JSON.stringify(order.shipping_address)}</p>
                )}
                <div className="space-y-1">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-bone">
                      <span>
                        {item.product_name} ({item.size}) x{item.quantity}
                      </span>
                      <span>{formatARS(item.unit_price_cents * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted">Cambiar estado:</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="rounded border border-white/20 bg-ink-light px-2 py-1 text-bone"
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
