import { INSTAGRAM_URL, waLink } from '../../lib/whatsapp'
import dirtyWordmarkJp from '../../assets/brand/dirty-wordmark-jp.svg'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-center text-sm text-muted">
      <img src={dirtyWordmarkJp} alt="Dirty" className="mx-auto h-14 w-auto sm:h-16" />
      <p className="mt-2">La mejor rashguard del país. Hecha por y para guerreros.</p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-rust hover:underline">
          @dirty.rashguards
        </a>
        <a href={waLink()} target="_blank" rel="noreferrer" className="text-rust hover:underline">
          WhatsApp
        </a>
      </div>
      <p className="mt-6">© {new Date().getFullYear()} Dirty. Todos los derechos reservados.</p>
    </footer>
  )
}
