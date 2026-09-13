import type { Tables } from './database'

export type AcademyWithPhotos = Tables<'academies'> & {
  academy_photos: Tables<'academy_photos'>[]
}

export function sortedPhotos(academy: AcademyWithPhotos) {
  return [...academy.academy_photos].sort((a, b) => a.position - b.position)
}

export function coverPhotoPath(academy: AcademyWithPhotos) {
  return sortedPhotos(academy)[0]?.storage_path ?? null
}
