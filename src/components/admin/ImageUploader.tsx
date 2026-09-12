import { useRef, useState } from 'react'
import { BUCKETS, publicUrl, supabase, uploadFile } from '../../lib/supabase'
import type { Tables } from '../../types/database'

export function ImageUploader({
  productId,
  images,
  onChange,
}: {
  productId: string
  images: Tables<'product_images'>[]
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
        const path = `${productId}/${crypto.randomUUID()}-${file.name}`
        await uploadFile(BUCKETS.productImages, path, file)
        await supabase.from('product_images').insert({
          product_id: productId,
          storage_path: path,
          position: images.length + i,
        })
      }
      onChange()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removeImage(imageId: string) {
    await supabase.from('product_images').delete().eq('id', imageId)
    onChange()
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images
          .sort((a, b) => a.position - b.position)
          .map((img) => (
            <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded border border-white/10">
              <img
                src={publicUrl(BUCKETS.productImages, img.storage_path)}
                alt=""
                className="h-full w-full object-cover"
              />
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
