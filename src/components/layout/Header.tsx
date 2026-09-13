import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiInstagram, FiMenu, FiShoppingBag, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCartStore } from '../../store/cartStore'
import { INSTAGRAM_URL, waLink } from '../../lib/whatsapp'
import dirtyWordmark from '../../assets/brand/dirty-wordmark.svg'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm uppercase tracking-widest transition-colors hover:text-bone ${
    isActive ? 'text-bone' : 'text-muted'
  }`

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block py-3 text-sm uppercase tracking-widest transition-colors hover:text-bone ${
    isActive ? 'text-bone' : 'text-muted'
  }`

const navLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/tienda', label: 'Productos', end: false },
  { to: '/contacto', label: 'Contacto', end: false },
  { to: '/ustedes', label: 'Ustedes', end: false },
]

export function Header() {
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" aria-label="Dirty">
          <img src={dirtyWordmark} alt="Dirty" className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/carrito"
            className="relative text-bone transition-opacity hover:opacity-80"
            aria-label="Carrito"
          >
            <FiShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rust text-xs font-semibold text-bone">
                {itemCount}
              </span>
            )}
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-bone"
            aria-label="Instagram de Dirty"
          >
            <FiInstagram size={20} />
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-whatsapp"
            aria-label="WhatsApp de Dirty"
          >
            <FaWhatsapp size={20} />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-bone sm:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-ink/95 px-4 pb-2 sm:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
