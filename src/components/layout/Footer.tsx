import { INSTAGRAM_URL, waLink } from '../../lib/whatsapp'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-center text-sm text-muted">
      <p className="font-display tracking-widest text-bone">DIRTY</p>
      <p className="mt-2">Rashguards para jiu-jitsu, hechos para romper.</p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-rust hover:underline">
          @dirty.rash
        </a>
        <a href={waLink()} target="_blank" rel="noreferrer" className="text-rust hover:underline">
          WhatsApp
        </a>
      </div>
      <p className="mt-6">© {new Date().getFullYear()} Dirty. Todos los derechos reservados.</p>
    </footer>
  )
}
