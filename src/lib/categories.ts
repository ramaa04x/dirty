export const CATEGORIES = [
  { value: 'rashguards', label: 'Rashguards' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'streetwear', label: 'Streetwear' },
]

export function categoryLabel(value: string | null | undefined) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value ?? ''
}
