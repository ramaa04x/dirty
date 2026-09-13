import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BUCKETS, publicUrl, supabase } from '../../lib/supabase'
import { GalleryUploader } from '../../components/admin/GalleryUploader'
import { coverPhotoPath, type AcademyWithPhotos } from '../../types/academy'

export function AcademiesManager() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-academias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academies')
        .select('*, academy_photos(*)')
        .order('position', { ascending: true })
      if (error) throw error
      return data as AcademyWithPhotos[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-academias'] })
    queryClient.invalidateQueries({ queryKey: ['academias'] })
  }

  async function createAcademy() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('academies')
        .insert({ name: name.trim(), position: items?.length ?? 0 })
        .select()
        .single()
      if (error) throw error
      setName('')
      invalidate()
      setExpandedId(data.id)
    } finally {
      setCreating(false)
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
        Cargá las academias que confiaron en Dirty y sus fotos. Se muestran en /ustedes y en la home.
      </p>

      {isLoading && <p className="text-muted">Cargando...</p>}

      <div className="space-y-2">
        {items?.map((item) => {
          const cover = coverPhotoPath(item)
          const expanded = expandedId === item.id
          return (
            <div key={item.id} className="rounded border border-white/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {cover && (
                    <img
                      src={publicUrl(BUCKETS.academyLogos, cover)}
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
                <div className="flex flex-wrap justify-end gap-3 text-xs">
                  <button
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="text-muted hover:text-bone"
                  >
                    {expanded ? 'Cerrar fotos' : `Fotos (${item.academy_photos.length})`}
                  </button>
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

              {expanded && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <GalleryUploader
                    bucket={BUCKETS.academyLogos}
                    table="academy_photos"
                    ownerField="academy_id"
                    ownerId={item.id}
                    images={item.academy_photos}
                    onChange={invalidate}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex gap-2 border-t border-white/10 pt-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la academia"
          className="flex-1 rounded border border-white/20 bg-ink-light px-3 py-2 text-bone"
        />
        <button
          type="button"
          onClick={createAcademy}
          disabled={creating || !name.trim()}
          className="rounded bg-rust px-4 py-2 text-sm font-medium uppercase tracking-widest text-bone hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear academia'}
        </button>
      </div>
    </div>
  )
}
