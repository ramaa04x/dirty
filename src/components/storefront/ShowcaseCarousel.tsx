import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { useShowcasePhotos } from '../../hooks/useShowcasePhotos'

const AUTOPLAY_MS = 4000

export function ShowcaseCarousel() {
  const { data: photos } = useShowcasePhotos()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!photos || photos.length <= 1 || paused) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [photos, paused])

  if (!photos || photos.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div
        className="relative h-[45vh] max-h-[420px] min-h-[240px] w-full overflow-hidden rounded-lg bg-black"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            src={publicUrl(BUCKETS.showcasePhotos, photo.storage_path)}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${i === index ? 'bg-rust' : 'bg-white/40'}`}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        )}
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
