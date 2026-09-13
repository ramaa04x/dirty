import { Link } from 'react-router-dom'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { useShowcasePhotos } from '../../hooks/useShowcasePhotos'

const SECONDS_PER_IMAGE = 6

const EDGE_FADE_MASK =
  'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'

export function ShowcaseCarousel() {
  const { data: photos } = useShowcasePhotos()

  if (!photos || photos.length === 0) return null

  const track = [...photos, ...photos]
  const duration = Math.max(photos.length * SECONDS_PER_IMAGE, 18)

  return (
    <section className="py-16">
      <div className="relative mx-auto mb-6 max-w-6xl px-4">
        <h2 className="text-center font-display text-2xl tracking-widest text-bone sm:text-3xl">
          GALERÍA
        </h2>
        <Link
          to="/ustedes"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded border border-rust px-3 py-1 text-base text-rust transition-colors hover:bg-rust hover:text-bone"
        >
          Ver más
        </Link>
      </div>

      <div
        className="mx-auto max-w-6xl overflow-hidden px-4"
        style={{ WebkitMaskImage: EDGE_FADE_MASK, maskImage: EDGE_FADE_MASK }}
      >
        <div
          className="flex w-max animate-marquee gap-4"
          style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
        >
          {track.map((photo, i) => (
            <div
              key={`${photo.id}-${i}`}
              className="aspect-[4/3] h-56 flex-shrink-0 overflow-hidden rounded-lg sm:h-64 md:h-72"
            >
              <img
                src={publicUrl(BUCKETS.showcasePhotos, photo.storage_path)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
