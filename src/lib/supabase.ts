import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(url, key)

export const BUCKETS = {
  productImages: 'product-images',
  heroMedia: 'hero-media',
  academyLogos: 'academy-logos',
  showcasePhotos: 'showcase-photos',
} as const

export function publicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: options?.upsert ?? true })
  if (error) throw error
  return publicUrl(bucket, path)
}
