import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BUCKETS, publicUrl, supabase, uploadFile } from '../../lib/supabase'

export function AcademiesManager() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-academias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-academias'] })
    queryClient.invalidateQueries({ queryKey: ['academias'] })
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !name.trim()) return
    setUploading(true)
    try {
      const file = files[0]
      const path = `${crypto.randomUUID()}-${file.name}`
      await uploadFile(BUCKETS.academyLogos, path, file)
      await supabase.from('academies').insert({
        name: name.trim(),
        logo_storage_path: path,
        position: items?.length ?? 0,
      })
      setName('')
      invalidate()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await supabase.from('academies').update({ is_active: !isActive }).eq('id', id)
    invalidate()
  }

  async function remove(id: string) {
    await supabase.from('academies').delete().eq('id', id)
    invalidate()
  }

  function startEdit(id: string, currentName: string) {
    setEditingId(id)
    setEditingName(currentName)
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) return
    await supabase.from('academies').update({ name: editingName.trim() }).eq('id', id)
    setEditingId(null)
    invalidate()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-display text-2xl tracking-widest text-bone">ACADEMIAS</h1>
      <p className="mb-6 text-sm text-muted">
        Cargá las academias que confiaron en Dirty. Se muestran en /ustedes y en la home.
      </p>

      {isLoading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {items?.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded border border-white/10 p-3">
            <div className="flex items-center gap-3">
              {item.logo_storage_path && (
                <img
                  src={publicUrl(BUCKETS.academyLogos, item.logo_storage_path)}
                  alt={item.name}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              {editingId === item.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="rounded border border-white/20 bg-ink-light px-2 py-1 text-bone"
                />
              ) : (
                <p className="text-bone">{item.name}</p>
              )}
            </div>
            <div className="flex gap-3 text-xs">
              {editingId === item.id ? (
                <button onClick={() => saveEdit(item.id)} className="text-rust hover:underline">
                  Guardar
                </button>
              ) : (
                <button onClick={() => startEdit(item.id, item.name)} className="text-muted hover:text-bone">
                  Editar
                </button>
              )}
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
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la academia"
          className="w-full rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
        />
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || !name.trim()}
            className="rounded border border-dashed border-white/20 px-4 py-2 text-sm text-muted hover:border-rust hover:text-bone disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : '+ Subir logo'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>
    </div>
  )
}
