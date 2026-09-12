import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BUCKETS, publicUrl, supabase, uploadFile } from '../../lib/supabase'

export function HeroManager() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [externalUrl, setExternalUrl] = useState('')

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-hero'] })
    queryClient.invalidateQueries({ queryKey: ['hero-content'] })
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const mediaType = file.type.startsWith('video') ? 'video' : 'image'
        const path = `${crypto.randomUUID()}-${file.name}`
        await uploadFile(BUCKETS.heroMedia, path, file)
        await supabase.from('hero_content').insert({
          media_type: mediaType,
          storage_path: path,
          position: items?.length ?? 0,
        })
      }
      invalidate()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function addExternalVideo() {
    if (!externalUrl.trim()) return
    await supabase.from('hero_content').insert({
      media_type: 'video',
      external_url: externalUrl.trim(),
      position: items?.length ?? 0,
    })
    setExternalUrl('')
    invalidate()
  }

  async function toggleActive(id: string, isActive: boolean) {
    await supabase.from('hero_content').update({ is_active: !isActive }).eq('id', id)
    invalidate()
  }

  async function remove(id: string) {
    await supabase.from('hero_content').delete().eq('id', id)
    invalidate()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-display text-2xl tracking-widest text-bone">HERO</h1>
      <p className="mb-6 text-sm text-muted">
        Subí fotos o videos de jiu-jitsu para el home. Mientras no cargues nada, se muestra el
        placeholder de la marca.
      </p>

      {isLoading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {items?.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded border border-white/10 p-3">
            <div>
              <p className="text-bone">
                {item.media_type === 'video' ? 'Video' : 'Imagen'}
                {item.external_url ? ' · enlace externo' : ''}
              </p>
              <p className="max-w-md truncate text-sm text-muted">
                {item.external_url ?? (item.storage_path ? publicUrl(BUCKETS.heroMedia, item.storage_path) : '')}
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => toggleActive(item.id, item.is_active)}
                className={item.is_active ? 'text-muted hover:text-bone' : 'text-rust'}
              >
                {item.is_active ? 'Ocultar' : 'Activar'}
              </button>
              <button onClick={() => remove(item.id)} className="text-muted hover:text-rust">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded border border-dashed border-white/20 px-4 py-2 text-sm text-muted hover:border-rust hover:text-bone"
          >
            {uploading ? 'Subiendo...' : '+ Subir foto o video'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
        <div className="flex gap-2">
          <input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="O pegá un link de YouTube"
            className="flex-1 rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
          />
          <button
            type="button"
            onClick={addExternalVideo}
            className="rounded border border-white/20 px-4 py-2 text-sm text-bone hover:border-rust"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
