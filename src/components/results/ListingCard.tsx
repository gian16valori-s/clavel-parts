'use client'

import Image from 'next/image'
import { useAppStore } from '@/lib/cartStore'
import type { CartProduct } from '@/lib/cartStore'
import { getCategoryImage } from '@/lib/categoryImages'

interface ListingCardProduct extends Omit<CartProduct, 'qty'> {
  group?: string
  subgroup?: string
  stock?: number
  liquidation?: boolean
}

interface ListingCardProps {
  product: ListingCardProduct
  onAdded?: () => void
  onOpen?: (product: ListingCardProduct) => void
}


function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--yellow)', fontSize: '0.7rem' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ListingCard({ product, onAdded, onOpen }: ListingCardProps) {
  const { addToCart } = useAppStore()
  const imageSrc = product.image || getCategoryImage(product.category)

  function handleAdd() {
    addToCart(product)
    onAdded?.()
  }

  function handleOpen() {
    onOpen?.(product)
  }

  return (
    <div
      className="rounded-md overflow-hidden cursor-pointer transition-all duration-200"
      style={{ background: 'var(--dark2)', border: '1px solid var(--dark3)' }}
      onClick={handleOpen}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--slate2)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--dark3)'
      }}
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ height: 160, background: 'var(--dark3)' }}
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="badge-compat mb-[0.6rem]">✓ COMPATIBLE CON TU VEHÍCULO</div>

        <div
          className="font-condensed font-extrabold uppercase tracking-[0.03em] text-white leading-[1.2] mb-1"
          style={{ fontSize: '1.05rem' }}
        >
          {product.name}
        </div>

        <div className="mb-2" style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>
          {product.brand} · Ref: {product.ref}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {product.subgroup && (
            <span
              className="font-condensed font-bold uppercase"
              style={{
                fontSize: '0.68rem',
                color: 'var(--slate2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '0.2rem 0.5rem',
              }}
            >
              {product.subgroup}
            </span>
          )}
          {typeof product.stock === 'number' && (
            <span
              className="font-condensed font-bold uppercase"
              style={{
                fontSize: '0.68rem',
                color: 'var(--gray2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '0.2rem 0.5rem',
              }}
            >
              Stock: {product.stock}
            </span>
          )}
          {product.liquidation && (
            <span
              className="font-condensed font-bold uppercase"
              style={{
                fontSize: '0.68rem',
                color: '#8a6d00',
                background: 'rgba(240,224,64,0.12)',
                border: '1px solid rgba(240,224,64,0.3)',
                borderRadius: 999,
                padding: '0.2rem 0.5rem',
              }}
            >
              Liquidación
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div
            className="font-condensed font-black"
            style={{ fontSize: '1.4rem', color: 'var(--yellow)' }}
          >
            ${product.price.toLocaleString('es-AR')}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAdd()
            }}
            className="font-condensed font-bold uppercase tracking-[0.06em] transition-all duration-200"
            style={{
              background: 'var(--slate)',
              color: 'var(--white)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 4,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--yellow)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dark)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--slate)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--white)'
            }}
          >
            + Agregar
          </button>
        </div>

        <div
          className="flex items-center gap-[0.3rem] mt-2"
          style={{ fontSize: '0.75rem', color: 'var(--gray)' }}
        >
          <Stars rating={product.sellerRating} />
          {product.seller} · Entrega: {product.delivery} días
        </div>
      </div>
    </div>
  )
}
