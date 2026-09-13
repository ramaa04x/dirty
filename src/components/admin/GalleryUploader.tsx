import { useRef, useState } from 'react'
import { publicUrl, supabase, uploadFile } from '../../lib/supabase'

type GalleryImage = { id: string; storage_path: string; position: number }

export function GalleryUploader({
  bucket,
  table,
  ownerField,
  ownerId,
  images,
  onChange,
}: {
  bucket: string
  table: 'product_images' | 'academy_photos'
  ownerField: 'product_id' | 'academy_id'
  ownerId: string
  images: GalleryImage[]
  onChange: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${ownerId}/${crypto.randomUUID()}-${file.name}`
        await uploadFile(bucket, path, file)
        await supabase
          .from(table)
          .insert({ [ownerField]: ownerId, storage_path: path, position: images.length + i } as never)
      }
      onChange()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removeImage(imageId: string) {
    await supabase.from(table).delete().eq('id', imageId)
    onChange()
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {[...images]
          .sort((a, b) => a.position - b.position)
          .map((img) => (
            <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded border border-white/10">
              <img src={publicUrl(bucket, img.storage_path)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
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
          className="flex h-24 w-24 items-center justify-center rounded border border-dashed border-white/20 text-xs text-muted hover:border-rust hover:text-bone"
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
