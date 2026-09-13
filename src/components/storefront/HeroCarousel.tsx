import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { useHeroContent } from '../../hooks/useHeroContent'
import dirtyLogoCompleto from '../../assets/brand/dirty-logo-completo.svg'

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url)
}

function youtubeEmbedUrl(url: string) {
  const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/)
  return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url
}

function HeroPlaceholder() {
  return (
    <div className="flex h-[45vh] max-h-[420px] min-h-[240px] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-ink via-ink-light to-rust-dark text-center">
      <img src={dirtyLogoCompleto} alt="Dirty" className="w-full max-w-md px-6 sm:max-w-xl" />
      <p className="max-w-md px-4 text-sm text-muted">
        Rashguards hechos para jiu-jitsu. Muy pronto: videos de entrenamiento y competencia.
      </p>
    </div>
  )
}

export function HeroCarousel() {
  const { data: items } = useHeroContent()
  const [index, setIndex] = useState(0)

  if (!items || items.length === 0) {
    return <HeroPlaceholder />
  }

  const current = items[index % items.length]
  const src = current.external_url ?? (current.storage_path ? publicUrl(BUCKETS.heroMedia, current.storage_path) : null)

  return (
    <div className="relative h-[45vh] max-h-[420px] min-h-[240px] w-full overflow-hidden bg-black">
      {src && current.media_type === 'video' && isYoutubeUrl(src) && (
        <iframe
          src={youtubeEmbedUrl(src)}
          title={current.title ?? 'Dirty'}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {src && current.media_type === 'video' && !isYoutubeUrl(src) && (
        <video src={src} className="h-full w-full object-cover" autoPlay muted loop playsInline />
      )}
      {src && current.media_type === 'image' && (
        <img src={src} alt={current.title ?? 'Dirty'} className="h-full w-full object-cover" />
      )}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-rust' : 'bg-white/40'}`}
              aria-label={`Ver contenido ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HeroCta() {
  return (
    <Link
      to="/tienda"
      className="inline-block rounded bg-rust px-8 py-3 font-medium uppercase tracking-widest text-bone transition-colors hover:bg-rust-dark"
    >
      Ver tienda
    </Link>
  )
}
