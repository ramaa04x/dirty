import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function InstagramManager() {
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-instagram-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-instagram-posts'] })
    queryClient.invalidateQueries({ queryKey: ['instagram-posts'] })
  }

  async function addPost() {
    if (!url.trim() || !url.includes('instagram.com')) return
    setAdding(true)
    try {
      await supabase
        .from('instagram_posts')
        .insert({ url: url.trim(), position: items?.length ?? 0 })
      setUrl('')
      invalidate()
    } finally {
      setAdding(false)
    }
  }

  async function remove(id: string) {
    await supabase.from('instagram_posts').delete().eq('id', id)
    invalidate()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-display text-2xl tracking-widest text-bone">INSTAGRAM</h1>
      <p className="mb-6 text-sm text-muted">
        Pegá el link de las publicaciones que querés mostrar en la home. Se embeben tal cual se ven en
        Instagram.
      </p>

      {isLoading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded border border-white/10 p-3"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm text-bone hover:underline"
            >
              {item.url}
            </a>
            <button
              onClick={() => remove(item.id)}
              className="flex-shrink-0 text-xs text-muted hover:text-rust"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-t border-white/10 pt-6">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/..."
          className="flex-1 rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
        />
        <button
          type="button"
          onClick={addPost}
          disabled={adding || !url.trim()}
          className="rounded bg-rust px-4 py-2 text-sm font-medium uppercase tracking-widest text-bone hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? 'Agregando...' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
