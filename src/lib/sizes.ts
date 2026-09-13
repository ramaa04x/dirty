export const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL']

export function sortSizes<T>(items: T[], getSize: (item: T) => string) {
  return [...items].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(getSize(a))
    const bi = SIZE_ORDER.indexOf(getSize(b))
    if (ai === -1 && bi === -1) return getSize(a).localeCompare(getSize(b))
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}
