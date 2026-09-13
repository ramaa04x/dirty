import { useState } from 'react'
import { BUCKETS, publicUrl } from '../lib/supabase'
import { useAcademies } from '../hooks/useAcademies'
import { coverPhotoPath, type AcademyWithPhotos } from '../types/academy'
import { AcademyModal } from '../components/storefront/AcademyModal'

export function Ustedes() {
  const { data: academies, isLoading } = useAcademies()
  const [selected, setSelected] = useState<AcademyWithPhotos | null>(null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-2 font-display text-3xl tracking-widest text-bone sm:text-4xl">USTEDES</h1>
      <p className="mb-10 text-muted">Las academias que ya confiaron en nosotros</p>

      {isLoading && <p className="text-muted">Cargando...</p>}

      {academies && academies.length === 0 && (
        <p className="text-muted">
          Todavía no sumamos academias. ¡Pronto vas a ver a los primeros equipos que confiaron en Dirty!
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {academies?.map((academy) => {
          const coverPath = coverPhotoPath(academy)
          return (
            <button
              key={academy.id}
              type="button"
              onClick={() => setSelected(academy)}
              className="rounded border border-white/10 p-4 text-center transition-colors hover:border-rust"
            >
              {coverPath && (
                <img
                  src={publicUrl(BUCKETS.academyLogos, coverPath)}
                  alt={academy.name}
                  className="mx-auto mb-3 h-16 w-16 rounded object-cover"
                />
              )}
              <p className="text-sm text-bone">{academy.name}</p>
            </button>
          )
        })}
      </div>

      {selected && <AcademyModal academy={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
