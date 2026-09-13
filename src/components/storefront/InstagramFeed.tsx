import { useEffect } from 'react'
import { useInstagramPosts } from '../../hooks/useInstagramPosts'
import { INSTAGRAM_URL } from '../../lib/whatsapp'

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

const EMBED_SCRIPT_ID = 'instagram-embed-script'

function loadInstagramEmbedScript(onReady: () => void) {
  if (window.instgrm) {
    onReady()
    return
  }
  if (document.getElementById(EMBED_SCRIPT_ID)) return
  const script = document.createElement('script')
  script.id = EMBED_SCRIPT_ID
  script.src = 'https://www.instagram.com/embed.js'
  script.async = true
  script.onload = onReady
  document.body.appendChild(script)
}

export function InstagramFeed() {
  const { data: posts } = useInstagramPosts()

  useEffect(() => {
    if (!posts || posts.length === 0) return
    loadInstagramEmbedScript(() => window.instgrm?.Embeds.process())
    window.instgrm?.Embeds.process()
  }, [posts])

  if (!posts || posts.length === 0) return null

  return (
    <section className="py-16">
      <div className="relative mx-auto mb-6 max-w-[1600px] px-4">
        <h2 className="text-center font-display text-2xl tracking-widest text-bone sm:text-3xl">
          INSTAGRAM
        </h2>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded border border-rust px-3 py-1 text-base text-rust transition-colors hover:bg-rust hover:text-bone"
        >
          Seguinos
        </a>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="flex justify-center">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={post.url}
              data-instgrm-version="14"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
