import { FaWhatsapp } from 'react-icons/fa'
import { waLink } from '../../lib/whatsapp'

export function FloatingWhatsAppButton() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-bone shadow-lg transition-transform hover:scale-105 hover:bg-whatsapp-dark"
    >
      <FaWhatsapp size={28} />
    </a>
  )
}
