import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BUCKETS, publicUrl, supabase, uploadFile } from '../../lib/supabase'

export function ShowcaseManager() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-showcase-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_photos')
        .select('*')
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-showcase-photos'] })
    queryClient.invalidateQueries({ queryKey: ['showcase-photos'] })
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${crypto.randomUUID()}-${file.name}`
        await uploadFile(BUCKETS.showcasePhotos, path, file)
        await supabase
          .from('showcase_photos')
          .insert({ storage_path: path, position: (items?.length ?? 0) + i })
      }
      invalidate()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove(id: string) {
    await supabase.from('showcase_photos').delete().eq('id', id)
    invalidate()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-display text-2xl tracking-widest text-bone">GALERÍA</h1>
      <p className="mb-6 text-sm text-muted">
        Fotos de rashguards que hicimos, para el carrusel automático de la home.
      </p>

      {isLoading && <p className="text-muted">Cargando...</p>}

      <div className="flex flex-wrap gap-3">
        {items?.map((item) => (
          <div key={item.id} className="group relative h-28 w-28 overflow-hidden rounded border border-white/10">
            <img
              src={publicUrl(BUCKETS.showcasePhotos, item.storage_path)}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-bone opacity-0 transition-opacity group-hover:opacity-100"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-28 items-center justify-center rounded border border-dashed border-white/20 text-xs text-muted hover:border-rust hover:text-bone"
        >
          {uploading ? 'Subiendo...' : '+ Imagen'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
