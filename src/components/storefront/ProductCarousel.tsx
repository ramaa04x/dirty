import { useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { ProductCard } from './ProductCard'
import type { ProductWithRelations } from '../../types/shop'

export function ProductCarousel({ products }: { products: ProductWithRelations[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-8px)] flex-none snap-start sm:w-[calc(33.333%-11px)] lg:w-[calc(16.6667%-13.33px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {products.length > 6 && (
        <>
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-ink/90 p-2 text-bone shadow-lg transition-colors hover:bg-rust sm:flex"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-ink/90 p-2 text-bone shadow-lg transition-colors hover:bg-rust sm:flex"
          >
            <FiChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}
