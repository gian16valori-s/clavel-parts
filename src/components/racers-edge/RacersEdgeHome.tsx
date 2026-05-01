'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/lib/cartStore'
import { HERO_SLIDES, RE_PROMOS, reProducts } from '@/lib/racersEdgeData'

const NAV_ITEMS = [
  { top: 'EXPLORAR', bottom: 'MARCAS' },
  { top: 'EXPLORAR', bottom: 'VEHICULOS' },
  { top: 'EXPLORAR', bottom: 'SEGMENTOS' },
  { top: 'PIEZAS', bottom: 'OEM Y RACING' },
  { top: 'CULTURA', bottom: 'LIFESTYLE' },
  { top: 'SHOP', bottom: 'RUEDAS Y LLANTAS' },
]

export default function RacersEdgeHome() {
  const { setView } = useAppStore()
  const [slideIndex, setSlideIndex] = useState(0)

  const slide = HERO_SLIDES[slideIndex]
  const featured = useMemo(() => reProducts.slice(0, 8), [])

  const goPrev = () => setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  const goNext = () => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 390, background: '#111', overflowY: 'auto', color: '#fff', fontFamily: '"Barlow Condensed", sans-serif' }}>
      <div style={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', letterSpacing: '0.03em', fontWeight: 700, background: 'linear-gradient(180deg, #2c2c2c, #1a1a1a)', borderBottom: '1px solid #3b3b3b', textTransform: 'uppercase', padding: '4px 8px', textAlign: 'center' }}>
        THE RACER'S EDGE | PERFORMANCE PARTS PARA CALLE Y PISTA
      </div>

      <header style={{ background: '#050505', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: '1px solid #1b1b1b' }}>
        <div style={{ maxWidth: 320, background: '#f0f0f2', color: '#8890aa', borderRadius: 4, padding: '6px 10px', fontSize: '1.05rem' }}>Buscar en TRE</div>
        <div style={{ justifySelf: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.8rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>The Racer&apos;s Edge</div>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.18em', color: '#9f9f9f', textTransform: 'uppercase', marginTop: 2 }}>High Performance Parts</div>
        </div>
        <div style={{ justifySelf: 'end', display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setView('home')} style={{ border: 'none', borderRadius: 2, padding: '6px 10px', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', background: '#1a1a1a', color: '#d6d6d6' }}>
            Inicio
          </button>
          <button type="button" onClick={() => setView('racers-edge-catalog')} style={{ border: 'none', borderRadius: 2, padding: '6px 10px', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', background: '#cc1111', color: '#fff' }}>
            Ver catalogo
          </button>
        </div>
      </header>

      <nav style={{ background: 'linear-gradient(180deg, #efefef 0%, #e2e2e2 100%)', borderBottom: '1px solid #cfcfcf', display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', padding: '0 24px' }}>
        {NAV_ITEMS.map((item, i) => (
          <button key={item.bottom} type="button" style={{ border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 12px 10px', cursor: 'pointer', borderRight: i === NAV_ITEMS.length - 1 ? 'none' : '1px solid #d9d9d9' }}>
            <span style={{ display: 'block', color: '#b21111', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.top}</span>
            <strong style={{ display: 'block', color: '#111', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1, marginTop: 1 }}>{item.bottom}</strong>
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 1100, margin: '10px auto 24px', padding: '0 12px' }}>
        <section style={{ border: '1px solid #212121', background: 'linear-gradient(135deg, #121212 0%, #0a0a0a 60%, #140707 100%)', padding: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 14, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '2rem', fontStyle: 'italic', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>TRE PERFORMANCE HUB</div>
            <div style={{ marginTop: 4, color: '#c8c8c8', fontSize: '0.92rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{slide.eyebrow}</div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {slide.title.map((line) => (
                <span key={line} style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{line}</span>
              ))}
            </div>
            <p style={{ margin: '8px 0 0', color: '#d0d0d0', lineHeight: 1.35, maxWidth: 640, fontSize: '0.98rem' }}>{slide.description}</p>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RE_PROMOS.slice(0, 2).map((promo) => (
                <span key={promo.id} style={{ border: `1px solid ${promo.tagBorder}`, background: promo.tagBg, color: promo.tagColor, padding: '3px 7px', fontSize: '0.68rem', letterSpacing: '0.08em', borderRadius: 3, textTransform: 'uppercase', fontWeight: 800 }}>
                  {promo.tag}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ border: `1px solid ${slide.badgeBorder}`, borderRadius: 3, fontSize: '0.74rem', letterSpacing: '0.08em', fontWeight: 800, padding: '3px 8px', background: slide.badgeBg, color: slide.badgeColor }}>
                {slide.badgeText}
              </span>
              <button type="button" onClick={() => setView('racers-edge-catalog')} style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)', textUnderlineOffset: 3 }}>
                {slide.cta} +
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.62)', border: '1px solid #2c2c2c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 180 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', padding: '0 8px', color: '#e0e0e0' }}>TRE</div>
            <div style={{ fontSize: '2.2rem' }}>{slide.emoji}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={goPrev} style={{ width: 30, height: 30, border: '1px solid #4a4a4a', background: '#1e1e1e', color: '#fff', cursor: 'pointer' }}>{'<'}</button>
              <button type="button" onClick={goNext} style={{ width: 30, height: 30, border: '1px solid #4a4a4a', background: '#1e1e1e', color: '#fff', cursor: 'pointer' }}>{'>'}</button>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr auto 1fr', gap: 6 }}>
            <div style={{ height: 38, display: 'flex', alignItems: 'center', border: '1px solid #3a3a3a', background: 'rgba(0,0,0,0.7)', color: '#bdbdbd', fontSize: '1.02rem', padding: '0 10px' }}>Buscar producto o marca</div>
            <div style={{ height: 38, display: 'flex', alignItems: 'center', border: '1px solid #3a3a3a', background: 'rgba(0,0,0,0.7)', color: '#bdbdbd', fontSize: '1.02rem', padding: '0 10px' }}>Precio min.</div>
            <div style={{ height: 38, display: 'flex', alignItems: 'center', border: '1px solid #3a3a3a', background: 'rgba(0,0,0,0.7)', color: '#bdbdbd', fontSize: '1.02rem', padding: '0 10px' }}>Precio max.</div>
            <button type="button" onClick={() => setView('racers-edge-catalog')} style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #4b4b4b', background: 'linear-gradient(180deg, #2a2a2a, #161616)', color: '#fff', fontSize: '1.02rem', fontWeight: 900, letterSpacing: '0.04em', padding: '0 10px', cursor: 'pointer' }}>
              Aplicar filtros
            </button>
            <div style={{ height: 38, display: 'flex', alignItems: 'center', border: '1px solid #3a3a3a', background: 'rgba(0,0,0,0.7)', color: '#bdbdbd', fontSize: '1.02rem', padding: '0 10px' }}>Orden: mas populares</div>
          </div>
        </section>

        <section style={{ marginTop: 10, border: '1px solid #222', background: '#0c0c0c' }}>
          <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'linear-gradient(180deg, #af0000, #8e0000)', borderBottom: '1px solid #5f0000', textTransform: 'uppercase', flexWrap: 'wrap', gap: 8 }}>
            <strong style={{ fontSize: '2rem', lineHeight: 1, letterSpacing: '0.02em', fontWeight: 900 }}>LANZAMIENTOS DE PISTA</strong>
            <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)' }}>Mostrando 1 a 8 productos destacados de {reProducts.length}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, background: '#1b1b1b' }}>
            {featured.map((p) => (
              <article key={p.id} style={{ background: '#090909', minHeight: 270, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 170, display: 'grid', placeItems: 'center', borderBottom: '1px solid #1f1f1f', background: `radial-gradient(circle at 25% 20%, ${slide.stripeColor}44 0%, #0f0f0f 55%)` }}>
                  <span style={{ fontSize: '3.4rem' }}>{p.emoji}</span>
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ color: '#ff2a2a', textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>{p.brand}</div>
                  <h3 style={{ margin: '3px 0', fontSize: '1.75rem', lineHeight: 1.05, fontWeight: 900, letterSpacing: '0.01em', color: '#ececec', textTransform: 'uppercase' }}>{p.name}</h3>
                  <div style={{ marginTop: 4, fontSize: '1.45rem', color: '#f0e040' }}>${p.price.toLocaleString('es-AR')}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 10 }}>
          <div style={{ fontSize: '1.05rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a5a5a5', marginBottom: 8, fontWeight: 700 }}>Promociones activas</div>
        </section>

        <section style={{ marginTop: 2, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {RE_PROMOS.map((promo) => (
            <article key={promo.id} style={{ border: '1px solid #2a2a2a', background: 'linear-gradient(145deg, #141414 0%, #0f0f0f 100%)', padding: 10 }}>
              <div style={{ width: 'fit-content', border: `1px solid ${promo.tagBorder}`, borderRadius: 3, padding: '2px 6px', fontSize: '0.76rem', letterSpacing: '0.06em', fontWeight: 800, textTransform: 'uppercase', background: promo.tagBg, color: promo.tagColor }}>
                {promo.tag}
              </div>
              <div style={{ marginTop: 8, fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase' }}>{promo.name}</div>
              <div style={{ marginTop: 5, color: 'rgba(255,255,255,0.62)', fontSize: '0.88rem', lineHeight: 1.25 }}>{promo.description}</div>
              <div style={{ marginTop: 8, color: '#f0e040', fontSize: '1.6rem', fontWeight: 900 }}>${promo.priceNow.toLocaleString('es-AR')}</div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
