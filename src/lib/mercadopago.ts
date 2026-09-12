import { supabase } from './supabase'
import type { CartItem } from '../store/cartStore'

export type CheckoutCustomer = { name: string; email: string; phone?: string }
export type CheckoutShipping = {
  street?: string
  city?: string
  province?: string
  postalCode?: string
  notes?: string
}

export async function createPreference(
  items: CartItem[],
  customer: CheckoutCustomer,
  shipping: CheckoutShipping
) {
  const { data, error } = await supabase.functions.invoke<{
    orderId: string
    initPoint: string
    error?: string
  }>('create-preference', {
    body: {
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      customer,
      shipping,
    },
  })

  if (error) throw error
  if (!data || data.error) throw new Error(data?.error ?? 'No se pudo iniciar el pago')
  return data
}
