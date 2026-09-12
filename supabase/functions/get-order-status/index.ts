import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Endpoint público de solo lectura: conocer el UUID del pedido (no listable, no adivinable)
// alcanza como capability token para ver el estado de la propia compra, sin exponer la tabla orders.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const orderId = url.searchParams.get('orderId')
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Falta orderId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, mp_status, total_cents, currency, created_at')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) {
    return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, size, quantity, unit_price_cents')
    .eq('order_id', orderId)

  return new Response(JSON.stringify({ ...order, items: items ?? [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
