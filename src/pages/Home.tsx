import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { FiPackage, FiMapPin, FiTruck } from 'react-icons/fi'
import { TbRuler } from 'react-icons/tb'
import { HeroCarousel } from '../components/storefront/HeroCarousel'
import { ProductCarousel } from '../components/storefront/ProductCarousel'
import { useProducts } from '../hooks/useProducts'
import { useAcademies } from '../hooks/useAcademies'
import { BUCKETS, publicUrl } from '../lib/supabase'
import { waLink } from '../lib/whatsapp'

const valueProps = [
  { icon: TbRuler, label: 'Hechas a medida' },
  { icon: FiPackage, label: 'Materiales resistentes' },
  { icon: FiMapPin, label: 'Hecho en Argentina' },
  { icon: FiTruck, label: 'Envíos a todo el país' },
]

export function Home() {
  const { data: products, isLoading } = useProducts()
  const featured = products?.slice(0, 10)
  const { data: academies } = useAcademies()
  const academyPreview = academies?.slice(0, 4)

  return (
    <div>
      <HeroCarousel />

      <section className="border-y border-white/10 bg-ink-light">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {valueProps.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon size={24} className="text-rust" />
              <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-6 text-center font-display text-2xl tracking-widest text-bone">
          PRODUCTOS DESTACADOS
        </h2>
        {isLoading && <p className="text-muted">Cargando productos...</p>}
        {featured && featured.length === 0 && (
          <p className="text-muted">Todavía no hay productos cargados.</p>
        )}
        {featured && featured.length > 0 && <ProductCarousel products={featured} />}
      </section>

      {academyPreview && academyPreview.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 text-center">
          <h2 className="mb-6 font-display text-xl tracking-widest text-bone">
            ACADEMIAS QUE CONFÍAN EN DIRTY
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {academyPreview.map((academy) => (
              <div key={academy.id} className="flex flex-col items-center gap-2">
                {academy.logo_storage_path && (
                  <img
                    src={publicUrl(BUCKETS.academyLogos, academy.logo_storage_path)}
                    alt={academy.name}
                    className="h-14 w-14 rounded object-cover"
                  />
                )}
                <p className="text-xs text-muted">{academy.name}</p>
              </div>
            ))}
          </div>
          <Link to="/ustedes" className="mt-6 inline-block text-sm text-rust hover:underline">
            Ver todas
          </Link>
        </section>
      )}

      <section className="bg-ink-light py-16 text-center">
        <h2 className="font-display text-2xl tracking-widest text-bone sm:text-3xl">
          ¿TENÉS UNA IDEA?
        </h2>
        <p className="mx-auto mt-3 max-w-md px-4 text-muted">
          Escribinos por WhatsApp y armamos tu rashguard personalizado o el de tu academia.
        </p>
        <a
          href={waLink('Hola! Quiero hacer una consulta sobre un rashguard personalizado.')}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded bg-whatsapp px-8 py-3 font-medium uppercase tracking-widest text-bone transition-colors hover:bg-whatsapp-dark"
        >
          <FaWhatsapp size={20} />
          Escribinos
        </a>
      </section>
    </div>
  )
}
