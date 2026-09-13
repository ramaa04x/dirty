import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { BUCKETS, publicUrl } from '../../lib/supabase'
import { useHeroContent } from '../../hooks/useHeroContent'
import { waLink } from '../../lib/whatsapp'
import dirtyLogoCompleto from '../../assets/brand/dirty-logo-completo.svg'

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url)
}

function youtubeEmbedUrl(url: string) {
  const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/)
  return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url
}

function HeroCtas() {
  return (
    <div className="relative flex flex-wrap items-center justify-center gap-3">
      <Link
        to="/tienda"
        className="rounded border-2 border-rust bg-transparent px-8 py-3 font-medium uppercase tracking-widest text-rust transition-colors hover:bg-rust hover:text-bone"
      >
        Ver tienda
      </Link>
      <a
        href={waLink('Hola! Quiero hacer una consulta sobre un rashguard personalizado.')}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded border-2 border-whatsapp bg-transparent px-8 py-3 font-medium uppercase tracking-widest text-whatsapp transition-colors hover:bg-whatsapp hover:text-bone"
      >
        <FaWhatsapp size={20} />
        Escribinos
      </a>
    </div>
  )
}

function HeroPlaceholder() {
  return (
    <div className="relative flex h-[60vh] max-h-[560px] min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-hidden text-center">
      <video
        src="/hero/dirty-hero.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/60 to-rust-dark/70" />
      <img src={dirtyLogoCompleto} alt="Dirty" className="relative w-full max-w-md px-6 sm:max-w-xl" />
      <p className="relative max-w-md px-4 text-sm text-bone/90">
        La mejor rashguard del país. Hecha por y para guerreros.
      </p>
      <HeroCtas />
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
    <div className="relative h-[60vh] max-h-[560px] min-h-[320px] w-full overflow-hidden bg-black">
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
      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-4 px-4">
        <HeroCtas />
      </div>
      {items.length > 1 && (
        <div className="absolute top-4 left-1/2 flex -translate-x-1/2 gap-2">
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
