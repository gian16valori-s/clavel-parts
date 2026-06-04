'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/cartStore'
import { HERO_SLIDES, RE_PROMOS, reProducts } from '@/lib/racersEdgeData'
import { getTREBrands, getTREModelsByBrand, type TREBrand, type TREModel } from '@/lib/supabaseTRE'

const NAV_ITEMS = [
  { top: 'EXPLORAR', bottom: 'VEHICULOS' },
  { top: 'EXPLORAR', bottom: 'MARCAS' },
  { top: 'EXPLORAR', bottom: 'SEGMENTOS' },
  { top: 'PIEZAS', bottom: 'OEM Y RACING' },
  { top: 'CULTURA', bottom: 'LIFESTYLE' },
  { top: 'SHOP', bottom: 'RUEDAS Y LLANTAS' },
]

const LIFESTYLE_ITEMS = [
  { label: 'MERCH TRE', emoji: '👕' },
  { label: 'CULTURA JDM', emoji: '🇯🇵' },
  { label: 'CASUAL WEAR', emoji: '🧢' },
  { label: 'STICKERS', emoji: '🏷️' },
  { label: 'REVISTAS', emoji: '📖' },
  { label: 'GARAGE TOOLS', emoji: '🔧' },
  { label: 'TRACK DAY', emoji: '🏁' },
  { label: 'ACCESORIOS', emoji: '🎽' },
  { label: 'POSTERS', emoji: '🖼️' },
]

const LLANTA_BRANDS = [
  { label: 'VOLK RACING', emoji: '🔴' },
  { label: 'OZ RACING', emoji: '⚫' },
  { label: 'SSR', emoji: '🔵' },
  { label: 'ENKEI', emoji: '⚪' },
  { label: 'WORK WHEELS', emoji: '🟡' },
  { label: 'BBS', emoji: '🔘' },
  { label: 'OTRAS MARCAS', emoji: '🛞' },
  { label: 'RINGS Y SPACERS', emoji: '🔩' },
  { label: 'VÁLVULAS', emoji: '⚙️' },
  { label: 'CAPS Y LOGOS', emoji: '🏁' },
  { label: 'TORNILLOS', emoji: '🔧' },
  { label: 'ACCESORIOS', emoji: '📦' },
]

export default function RacersEdgeHome() {
  const { setView, setVehicle } = useAppStore()
  const [slideIndex, setSlideIndex] = useState(0)
  const [showLlantasMenu, setShowLlantasMenu] = useState(false)
  const [showLifestyleMenu, setShowLifestyleMenu] = useState(false)
  const [showVehiculosMenu, setShowVehiculosMenu] = useState(false)
  const [treBrands, setTreBrands] = useState<TREBrand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState<TREBrand | null>(null)
  const [treModels, setTreModels] = useState<TREModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)

  useEffect(() => {
    getTREBrands().then((data) => {
      setTreBrands(data)
      setSelectedVehicleBrand(data[0] ?? null)
      setBrandsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedVehicleBrand) {
      setTreModels([])
      return
    }

    setModelsLoading(true)
    getTREModelsByBrand(selectedVehicleBrand.id)
      .then((data) => {
        setTreModels(data)
      })
      .finally(() => {
        setModelsLoading(false)
      })
  }, [selectedVehicleBrand])

  const slide = HERO_SLIDES[slideIndex]
  const featured = useMemo(() => reProducts.slice(0, 8), [])

  const goPrev = () => setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  const goNext = () => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 390, background: '#111', overflowY: 'auto', color: '#fff', fontFamily: '"Barlow Condensed", sans-serif' }}>
      <div style={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', letterSpacing: '0.03em', fontWeight: 700, background: 'linear-gradient(180deg, #2c2c2c, #1a1a1a)', borderBottom: '1px solid #3b3b3b', textTransform: 'uppercase', padding: '4px 8px', textAlign: 'center' }}>
        THE RACER&apos;S EDGE | PERFORMANCE PARTS PARA CALLE Y PISTA
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

      <div style={{ position: 'relative' }} onMouseLeave={() => { setShowLlantasMenu(false); setShowLifestyleMenu(false); setShowVehiculosMenu(false) }}>
        <nav style={{ background: 'linear-gradient(180deg, #efefef 0%, #e2e2e2 100%)', borderBottom: '1px solid #cfcfcf', display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', padding: '0 24px' }}>
          {NAV_ITEMS.map((item, i) => {
            const isLlantas = i === NAV_ITEMS.length - 1
            const isLifestyle = i === NAV_ITEMS.length - 2
            const isVehiculos = i === 0
            const isActive = (isLlantas && showLlantasMenu) || (isLifestyle && showLifestyleMenu) || (isVehiculos && showVehiculosMenu)
            return (
              <button
                key={item.bottom}
                type="button"
                onMouseEnter={() => {
                  setShowLlantasMenu(isLlantas)
                  setShowLifestyleMenu(isLifestyle)
                  setShowVehiculosMenu(isVehiculos)
                }}
                style={{
                  border: 'none',
                  textAlign: 'left',
                  padding: '8px 12px 10px',
                  cursor: 'pointer',
                  borderRight: isLlantas ? 'none' : '1px solid #d9d9d9',
                  background: isActive ? '#111' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ display: 'block', color: isActive ? '#ff4444' : '#b21111', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.top}</span>
                <strong style={{ display: 'block', color: isActive ? '#fff' : '#111', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1, marginTop: 1 }}>{item.bottom}</strong>
              </button>
            )
          })}
        </nav>

        {showVehiculosMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
            background: '#111', border: '1px solid #2a2a2a', borderTop: '2px solid #cc1111',
            display: 'grid', gridTemplateColumns: '260px 1fr',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            maxHeight: 420, overflow: 'hidden',
          }}>
            {/* Lista de marcas de vehiculos */}
            <div style={{ borderRight: '1px solid #222', overflowY: 'auto', maxHeight: 420 }}>
              <div style={{ padding: '10px 16px', background: '#0a0a0a', borderBottom: '1px solid #222', color: '#cc1111', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                VEHICULOS CON PIEZAS TRE
              </div>
              {brandsLoading ? (
                <div style={{ padding: '20px 16px', color: '#666', fontSize: '0.9rem' }}>Cargando marcas…</div>
              ) : treBrands.length === 0 ? (
                <div style={{ padding: '20px 16px', color: '#555', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  Aun no hay vehiculos TRE<br />cargados en la base de datos.
                </div>
              ) : (
                treBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onFocus={() => setSelectedVehicleBrand(brand)}
                    style={{
                      width: '100%', border: 'none', borderBottom: '1px solid #1e1e1e',
                      background: selectedVehicleBrand?.id === brand.id ? '#1e1e1e' : '#111',
                      color: selectedVehicleBrand?.id === brand.id ? '#fff' : '#e0e0e0', textAlign: 'left',
                      padding: '14px 16px', fontSize: '1.05rem', fontWeight: 800,
                      letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      setSelectedVehicleBrand(brand);
                      (e.currentTarget as HTMLButtonElement).style.background = '#1e1e1e'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = selectedVehicleBrand?.id === brand.id ? '#1e1e1e' : '#111'
                      ;(e.currentTarget as HTMLButtonElement).style.color = selectedVehicleBrand?.id === brand.id ? '#fff' : '#e0e0e0'
                    }}
                  >
                    <span>{brand.nombre}</span>
                    <span style={{ color: '#666', fontSize: '1.1rem' }}>›</span>
                  </button>
                ))
              )}
            </div>

            {/* Panel derecho: modelos disponibles */}
            <div style={{
              padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14,
              background: 'linear-gradient(135deg, #0f0f0f 0%, #140404 60%, #0a0a18 100%)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selectedVehicleBrand?.nombre ?? 'VEHICULOS'}<br />
                <span style={{ color: '#cc1111' }}>CON PIEZAS DISPONIBLES</span>
              </div>
              <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, maxWidth: 380 }}>
                Solo aparecen marcas y modelos que ya tienen piezas The Racer&apos;s Edge cargadas y activas en Supabase.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                {modelsLoading ? (
                  <div style={{ gridColumn: '1 / -1', color: '#666', fontSize: '0.95rem' }}>Cargando modelos…</div>
                ) : treModels.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', color: '#666', fontSize: '0.95rem' }}>No hay modelos disponibles para esta marca.</div>
                ) : (
                  treModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        if (!selectedVehicleBrand) return
                        setVehicle({
                          brand: selectedVehicleBrand.nombre,
                          model: model.nombre,
                          engine: '',
                          year: 'TRE',
                          versionLabel: model.nombre,
                        })
                        setView('racers-edge-catalog')
                        setShowVehiculosMenu(false)
                      }}
                      style={{
                        border: '1px solid #2a2a2a',
                        background: '#171717',
                        color: '#f0f0f0',
                        padding: '12px 10px',
                        textAlign: 'left',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = '#242424'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#cc1111'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = '#171717'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'
                      }}
                    >
                      {model.nombre}
                    </button>
                  ))
                )}
              </div>
              <div style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.3, display: 'flex', alignItems: 'center' }}>
                {selectedVehicleBrand
                  ? `${treModels.length} modelo${treModels.length !== 1 ? 's' : ''} activo${treModels.length !== 1 ? 's' : ''} en ${selectedVehicleBrand.nombre}`
                  : 'Selecciona una marca'}
              </div>
            </div>
          </div>
        )}

        {showLifestyleMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
            background: '#111', border: '1px solid #2a2a2a', borderTop: '2px solid #cc1111',
            display: 'grid', gridTemplateColumns: '1fr 320px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}>
            {/* Grilla de categorías lifestyle */}
            <div style={{ padding: 16 }}>
              <div style={{ color: '#cc1111', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                CULTURA Y LIFESTYLE TRE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {LIFESTYLE_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => { setView('racers-edge-catalog'); setShowLifestyleMenu(false) }}
                    style={{
                      border: '1px solid #2a2a2a', background: '#1a1a1a',
                      cursor: 'pointer', padding: '14px 8px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#2a2a2a'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#cc1111'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'
                    }}
                  >
                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>{item.emoji}</span>
                    <span style={{ color: '#e0e0e0', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel promo lifestyle */}
            <div style={{
              background: 'linear-gradient(135deg, #1a0a0a 0%, #0f0f0f 60%, #0a0a14 100%)',
              borderLeft: '1px solid #2a2a2a', padding: 24,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12,
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TRE LIFESTYLE<br />
                <span style={{ color: '#cc1111' }}>YA DISPONIBLE</span>
              </div>
              <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                Merch exclusiva, cultura JDM y todo lo que define al verdadero apasionado del automovilismo.
              </p>
              <button
                type="button"
                onClick={() => { setView('racers-edge-catalog'); setShowLifestyleMenu(false) }}
                style={{
                  alignSelf: 'flex-start', background: 'transparent', color: '#fff',
                  border: '2px solid #fff', padding: '8px 20px', fontWeight: 900,
                  fontSize: '0.95rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.color = '#111' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              >
                VER TODO
              </button>
            </div>
          </div>
        )}

        {showLlantasMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
            background: '#111', border: '1px solid #2a2a2a', borderTop: '2px solid #cc1111',
            display: 'grid', gridTemplateColumns: '1fr 280px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}>
            {/* Grilla de marcas/categorías */}
            <div style={{ padding: 16 }}>
              <div style={{ color: '#cc1111', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                EXPLORAR RUEDAS Y LLANTAS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {LLANTA_BRANDS.map((brand) => (
                  <button
                    key={brand.label}
                    type="button"
                    onClick={() => { setView('racers-edge-catalog'); setShowLlantasMenu(false) }}
                    style={{
                      border: '1px solid #2a2a2a', background: '#1a1a1a',
                      cursor: 'pointer', padding: '10px 8px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'background 0.12s, border-color 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#2a2a2a'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#cc1111'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'
                    }}
                  >
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{brand.emoji}</span>
                    <span style={{ color: '#e0e0e0', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>{brand.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de búsqueda */}
            <div style={{ background: '#0a0a0a', borderLeft: '1px solid #2a2a2a', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1, color: '#fff' }}>
                LLANTAS PERFORMANCE<br />
                <span style={{ color: '#cc1111' }}>PARA TU VEHÍCULO</span>
              </div>
              {[
                { label: 'KEYWORD', placeholder: 'ej. TE37, OZ Ultraleggera' },
                { label: 'COLOR', placeholder: '- Todos -' },
                { label: 'MEDIDA', placeholder: '- Todas -' },
                { label: 'ANCHO', placeholder: '- Todos -' },
                { label: 'PCD', placeholder: '- Todos -' },
                { label: 'OFFSET', placeholder: '- Todos -' },
              ].map((field) => (
                <div key={field.label}>
                  <div style={{ color: '#888', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{field.label}</div>
                  <div style={{ height: 32, background: '#1c1c1c', border: '1px solid #333', color: '#aaa', fontSize: '0.9rem', padding: '0 8px', display: 'flex', alignItems: 'center', borderRadius: 2 }}>
                    {field.placeholder}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => { setView('racers-edge-catalog'); setShowLlantasMenu(false) }}
                style={{ marginTop: 4, background: '#cc1111', color: '#fff', border: 'none', padding: '10px 0', fontWeight: 900, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}
              >
                BUSCAR LLANTAS
              </button>
            </div>
          </div>
        )}
      </div>

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
