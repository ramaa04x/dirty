import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Mercado Pago envía notificaciones tanto por query params (IPN legado)
// como por body JSON (webhooks nuevos). Soportamos ambos formatos.
function extractPaymentId(url: URL, body: Record<string, unknown> | null): string | null {
  const dataId = (body?.data as Record<string, unknown> | undefined)?.id
  if (typeof dataId === 'string' || typeof dataId === 'number') return String(dataId)

  const queryId = url.searchParams.get('id') ?? url.searchParams.get('data.id')
  if (queryId) return queryId

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Siempre responder 200 rápido salvo error real de parseo, para que MP no reintente indefinidamente.
  try {
    const url = new URL(req.url)
    let body: Record<string, unknown> | null = null
    try {
      body = await req.json()
    } catch {
      body = null
    }

    const paymentId = extractPaymentId(url, body)
    if (!paymentId) {
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: secret } = await supabase
      .from('app_secrets')
      .select('value')
      .eq('key', 'mp_access_token')
      .maybeSingle()
    if (!secret) {
      console.error('mp_access_token no configurado, no se puede verificar el pago')
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${secret.value}` },
    })
    if (!paymentRes.ok) {
      console.error('No se pudo verificar el pago en Mercado Pago', await paymentRes.text())
      return new Response('ok', { status: 200, headers: corsHeaders })
    }
    const payment = await paymentRes.json()

    const orderId = payment.external_reference as string | undefined
    if (!orderId) {
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
    if (!order) {
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const mpStatus = payment.status as string // approved | in_process | rejected | cancelled | refunded
    const statusMap: Record<string, string> = {
      approved: 'approved',
      in_process: 'pending',
      pending: 'pending',
      rejected: 'rejected',
      cancelled: 'cancelled',
      refunded: 'refunded',
    }
    const newStatus = statusMap[mpStatus] ?? order.status

    if (mpStatus === 'approved' && !order.stock_decremented) {
      const { data: items } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', order.id)

      let allOk = true
      for (const item of items ?? []) {
        if (!item.variant_id) continue
        const { data: ok, error } = await supabase.rpc('decrement_variant_stock', {
          p_variant_id: item.variant_id,
          p_qty: item.quantity,
        })
        if (error || !ok) {
          allOk = false
          console.error('No se pudo descontar stock para', item.variant_id, error)
        }
      }

      await supabase
        .from('orders')
        .update({
          status: newStatus,
          mp_payment_id: String(payment.id),
          mp_status: mpStatus,
          mp_status_detail: payment.status_detail ?? null,
          stock_decremented: allOk,
        })
        .eq('id', order.id)
    } else {
      await supabase
        .from('orders')
        .update({
          status: newStatus,
          mp_payment_id: String(payment.id),
          mp_status: mpStatus,
          mp_status_detail: payment.status_detail ?? null,
        })
        .eq('id', order.id)
    }

    return new Response('ok', { status: 200, headers: corsHeaders })
  } catch (err) {
    console.error('Error procesando webhook de Mercado Pago', err)
    return new Response('ok', { status: 200, headers: corsHeaders })
  }
})
