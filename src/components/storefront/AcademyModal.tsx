import { useEffect, useState } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { sortedPhotos, type AcademyWithPhotos } from '../../types/academy'

export function AcademyModal({
  academy,
  onClose,
}: {
  academy: AcademyWithPhotos
  onClose: () => void
}) {
  const photos = sortedPhotos(academy)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, photos.length])

  const current = photos[index]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-lg bg-ink-light"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-lg tracking-widest text-bone">{academy.name}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-bone" aria-label="Cerrar">
            <FiX size={22} />
          </button>
        </div>

        <div className="relative bg-black">
          {current ? (
            <img
              src={publicUrl(BUCKETS.academyLogos, current.storage_path)}
              alt={academy.name}
              className="max-h-[65vh] w-full object-contain"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center text-muted">Sin fotos</div>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={index === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/80 p-2 text-bone disabled:opacity-30"
                aria-label="Anterior"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(i + 1, photos.length - 1))}
                disabled={index === photos.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/80 p-2 text-bone disabled:opacity-30"
                aria-label="Siguiente"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border transition-colors ${
                  i === index ? 'border-rust' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={publicUrl(BUCKETS.academyLogos, photo.storage_path)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
