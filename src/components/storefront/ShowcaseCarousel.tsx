import { Link } from 'react-router-dom'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { useShowcasePhotos } from '../../hooks/useShowcasePhotos'

const SECONDS_PER_IMAGE = 4

export function ShowcaseCarousel() {
  const { data: photos } = useShowcasePhotos()

  if (!photos || photos.length === 0) return null

  const track = [...photos, ...photos]
  const duration = Math.max(photos.length * SECONDS_PER_IMAGE, 12)

  return (
    <section className="pb-20">
      <div className="group mx-auto max-w-6xl overflow-hidden px-4">
        <div
          className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]"
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

      <div className="mt-6 text-center">
        <Link
          to="/ustedes"
          className="inline-block rounded border-2 border-rust bg-transparent px-8 py-3 font-medium uppercase tracking-widest text-rust transition-colors hover:bg-rust hover:text-bone"
        >
          Conocé a las academias que confían en Dirty
        </Link>
      </div>
    </section>
  )
}
