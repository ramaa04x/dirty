import { FaWhatsapp } from 'react-icons/fa'
import { FiInstagram } from 'react-icons/fi'
import { INSTAGRAM_URL, waLink } from '../lib/whatsapp'

export function Contacto() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl tracking-widest text-bone sm:text-4xl">CONTACTO</h1>
      <p className="mt-4 text-muted">
        ¿Tenés una idea para tu rashguard o el de tu academia? Escribinos y lo hacemos realidad.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <a
          href={waLink('Hola! Quiero hacer una consulta sobre un rashguard personalizado.')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded bg-whatsapp px-8 py-3 font-medium uppercase tracking-widest text-bone transition-colors hover:bg-whatsapp-dark"
        >
          <FaWhatsapp size={20} />
          Escribinos por WhatsApp
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-rust hover:underline"
        >
          <FiInstagram size={18} />
          @dirty.rash
        </a>
      </div>
    </div>
  )
}
