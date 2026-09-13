import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-rust text-bone' : 'text-muted hover:bg-white/5 hover:text-bone'
  }`

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 flex-shrink-0 space-y-1">
        <p className="mb-4 font-display tracking-widest text-bone">ADMIN</p>
        <NavLink to="/admin/productos" className={linkClass}>
          Productos
        </NavLink>
        <NavLink to="/admin/pedidos" className={linkClass}>
          Pedidos
        </NavLink>
        <NavLink to="/admin/academias" className={linkClass}>
          Academias
        </NavLink>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 block w-full rounded px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-bone"
        >
          Cerrar sesión
        </button>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
