import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

type CartLine = { variantId: string; quantity: number }

type RequestBody = {
  items: CartLine[]
  customer: { name: string; email: string; phone?: string }
  shipping?: { street?: string; city?: string; province?: string; postalCode?: string; notes?: string }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body: RequestBody = await req.json()

    if (!body.items?.length) {
      return new Response(JSON.stringify({ error: 'Carrito vacío' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!body.customer?.name || !body.customer?.email) {
      return new Response(JSON.stringify({ error: 'Faltan datos del cliente' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const variantIds = body.items.map((i) => i.variantId)
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, stock, price_override_cents, size, is_active, products(id, name, price_cents, is_active)')
      .in('id', variantIds)

    if (variantsError) throw variantsError

    const lines = body.items.map((item) => {
      const variant = variants?.find((v) => v.id === item.variantId)
      if (!variant || !variant.is_active || !variant.products?.is_active) {
        throw new Error(`Variante no disponible: ${item.variantId}`)
      }
      if (variant.stock < item.quantity) {
        throw new Error(`Sin stock suficiente para talle ${variant.size}`)
      }
      const unitPriceCents = variant.price_override_cents ?? variant.products.price_cents
      return {
        variantId: variant.id,
        productId: variant.products.id,
        productName: variant.products.name,
        size: variant.size,
        quantity: item.quantity,
        unitPriceCents,
      }
    })

    const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0)
    const shippingCents = 0
    const totalCents = subtotalCents + shippingCents

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        customer_phone: body.customer.phone ?? null,
        shipping_address: body.shipping ?? null,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const { error: itemsError } = await supabase.from('order_items').insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        variant_id: l.variantId,
        product_name: l.productName,
        size: l.size,
        unit_price_cents: l.unitPriceCents,
        quantity: l.quantity,
      }))
    )
    if (itemsError) throw itemsError

    const { data: secrets, error: secretError } = await supabase
      .from('app_secrets')
      .select('key, value')
      .in('key', ['mp_access_token', 'site_url'])
    if (secretError) throw secretError

    const mpAccessToken = secrets?.find((s) => s.key === 'mp_access_token')?.value
    if (!mpAccessToken) {
      return new Response(
        JSON.stringify({ error: 'Mercado Pago no está configurado todavía (falta mp_access_token)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const siteUrl = secrets?.find((s) => s.key === 'site_url')?.value ?? 'http://localhost:5173'

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: lines.map((l) => ({
          title: `${l.productName} (${l.size})`,
          quantity: l.quantity,
          unit_price: l.unitPriceCents / 100,
          currency_id: 'ARS',
        })),
        payer: { name: body.customer.name, email: body.customer.email },
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/orden/${order.id}/resultado?status=success`,
          failure: `${siteUrl}/orden/${order.id}/resultado?status=failure`,
          pending: `${siteUrl}/orden/${order.id}/resultado?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
      }),
    })

    const preference = await mpResponse.json()
    if (!mpResponse.ok) {
      throw new Error(`Mercado Pago error: ${JSON.stringify(preference)}`)
    }

    await supabase.from('orders').update({ mp_preference_id: preference.id }).eq('id', order.id)

    return new Response(
      JSON.stringify({ orderId: order.id, initPoint: preference.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
