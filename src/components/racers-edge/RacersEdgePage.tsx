'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/cartStore'
import {
  reProducts, RE_CATEGORIES, CATEGORY_COLOR,
  type REProduct, type RECategory,
} from '@/lib/racersEdgeData'

// ── Tag badge styles ──
const TAG_STYLE: Record<string, React.CSSProperties> = {
  'TOP SELLER': { background: 'rgba(240,224,64,0.15)', color: '#f0e040', borderColor: 'rgba(240,224,64,0.35)' },
  'NUEVO':      { background: 'rgba(68,204,136,0.15)', color: '#44cc88', borderColor: 'rgba(68,204,136,0.35)' },
  'OFERTA':     { background: 'rgba(204,17,17,0.2)',   color: '#ff5555', borderColor: 'rgba(204,17,17,0.4)'   },
}

function ProductCard({ product }: { product: REProduct }) {
  const catColor = CATEGORY_COLOR[product.category]

  return (
    <div
      className="group"
      style={{
        background: 'linear-gradient(145deg, #141010 0%, #0d0909 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${catColor}55`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image area */}
      <div style={{
        height: 148,
        background: `linear-gradient(145deg, #1a1212 0%, #100d0d 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
        fontSize: '3.8rem',
        userSelect: 'none',
      }}>
        {/* Category left stripe */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: `linear-gradient(to bottom, ${catColor}, ${catColor}66)`,
        }} />

        {/* Subtle radial glow in category color */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${catColor}0d 0%, transparent 70%)`,
        }} />

        {product.emoji}

        {/* Tag */}
        {product.tag && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 800, fontSize: '0.62rem', letterSpacing: '0.1em',
            padding: '2px 7px', borderRadius: 3,
            border: '1px solid',
            ...TAG_STYLE[product.tag],
          }}>
            {product.tag}
          </div>
        )}

        {/* Universal badge */}
        {product.universal && (
          <div style={{
            position: 'absolute', bottom: 8, left: 10,
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)',
            padding: '2px 6px', borderRadius: 3,
          }}>
            UNIVERSAL
          </div>
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: '0.875rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: '0.68rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {product.brand}
        </div>

        <div style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontWeight: 900, fontSize: '1.05rem', color: '#f5f5f5',
          letterSpacing: '0.02em', lineHeight: 1.15,
        }}>
          {product.name}
        </div>

        {product.specs && (
          <div style={{
            fontSize: '0.66rem', color: '#666', marginTop: 2,
            fontFamily: '"Barlow Condensed", sans-serif', letterSpacing: '0.05em',
          }}>
            {product.specs}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Price + CTA */}
        <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 900, fontSize: '1.4rem', color: 'var(--yellow)',
            }}>
              ${product.price.toLocaleString('es-AR')}
            </span>
            {product.priceUnit && (
              <span style={{ fontSize: '0.68rem', color: '#666', marginLeft: 3 }}>
                {product.priceUnit}
              </span>
            )}
          </div>
          <button
            style={{
              background: '#cc1111',
              border: 'none',
              borderRadius: 4,
              padding: '6px 14px',
              color: '#fff',
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 800,
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#aa0d0d')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#cc1111')}
          >
            VER MÁS
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RacersEdgePage() {
  const { setView, vehicle } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<RECategory | 'todos'>('todos')

  const filtered = activeCategory === 'todos'
    ? reProducts
    : reProducts.filter((p) => p.category === activeCategory)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: '#060404',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}
      <header style={{
        flexShrink: 0,
        height: 78,
        background: 'linear-gradient(135deg, #1f0303 0%, #130101 40%, #0a0000 100%)',
        borderBottom: '2px solid #2a0505',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1.25rem',
        position: 'relative',
      }}>
        {/* Red glow behind header */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(180,10,10,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* VOLVER */}
        <button
          onClick={() => setView('racers-edge-home')}
          style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.55)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'color 0.15s, background 0.15s',
            flexShrink: 0,
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
        >
          ← VOLVER
        </button>

        {/* Logo + tagline */}
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '2.1rem',
            color: '#fff',
            letterSpacing: '0.03em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            THE RACER&apos;S{' '}
            <span style={{ color: '#cc1111' }}>EDGE</span>
          </div>
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 600,
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            HIGH PERFORMANCE AUTO PARTS
          </div>
        </div>

        {/* Vehicle context */}
        {vehicle ? (
          <div
            style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontSize: '0.78rem', letterSpacing: '0.08em',
              background: 'rgba(204,17,17,0.12)',
              border: '1px solid rgba(204,17,17,0.3)',
              borderRadius: 5,
              padding: '6px 12px',
              color: 'rgba(255,255,255,0.75)',
              zIndex: 1, flexShrink: 0,
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: 1 }}>FILTRANDO PARA</div>
            <div style={{ fontWeight: 800, color: '#fff' }}>
              {vehicle.brand} {vehicle.model} · {vehicle.year}
            </div>
          </div>
        ) : (
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontSize: '0.72rem', letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.3)',
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: 5,
            padding: '6px 12px',
            zIndex: 1, flexShrink: 0,
          }}>
            Sin vehículo seleccionado
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════
          CATEGORY BAR
      ═══════════════════════════════════════════ */}
      <nav style={{
        flexShrink: 0,
        height: 48,
        background: '#0d0202',
        borderBottom: '2px solid #1e0303',
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 0.5rem',
        overflowX: 'auto',
      }}>
        {RE_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key
          const color = cat.key === 'todos' ? '#cc1111' : CATEGORY_COLOR[cat.key as RECategory]
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as RECategory | 'todos')}
              style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 800,
                fontStyle: 'italic',
                fontSize: '0.95rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                background: active ? `${color}18` : 'none',
                border: 'none',
                borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                color: active ? color : 'rgba(255,255,255,0.4)',
                padding: '0 1.1rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, background 0.15s',
                marginBottom: -2,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}

        {/* Product count */}
        <div style={{
          marginLeft: 'auto',
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: '0.78rem', letterSpacing: '0.06em',
          color: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center',
          paddingRight: '0.75rem',
          whiteSpace: 'nowrap',
        }}>
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          PRODUCT GRID
      ═══════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

    </div>
  )
}
