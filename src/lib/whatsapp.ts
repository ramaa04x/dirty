export const WHATSAPP_NUMBER = '5491122997517'
export const INSTAGRAM_URL = 'https://instagram.com/dirty.rash'

export function waLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
