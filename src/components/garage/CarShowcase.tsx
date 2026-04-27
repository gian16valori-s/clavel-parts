'use client'

import { useState, useEffect } from 'react'
import type { GarageCar } from '@/lib/garageData'
import { demoBitacora, typeLabels, typeColors } from '@/lib/garageData'

type Panel = null | 'bitacora' | 'stats'

const BTN_BASE: React.CSSProperties = {
  flex: 1,
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 5,
  padding: '5px 0',
  fontWeight: 900,
  fontSize: '0.75rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
}

export default function CarShowcase({ car }: { car: GarageCar }) {
  const [openPanel, setOpenPanel] = useState<Panel>(null)
  const [shutterOpen, setShutterOpen] = useState(false)

  const bitacora   = demoBitacora.filter((e) => e.carId === car.id)
  const totalGasto = bitacora.reduce((acc, e) => acc + e.cost, 0)

  const carImage = car.photoFront ?? '/cars/bmw_frente_gt.png'

  // Shutter animation: starts closed, opens after 1s delay
  useEffect(() => {
    setShutterOpen(false)
    const timer = setTimeout(() => setShutterOpen(true), 1000)
    return () => clearTimeout(timer)
  }, [car.id])

  function toggle(panel: 'bitacora' | 'stats') {
    setOpenPanel((prev) => (prev === panel ? null : panel))
  }

  return (
    <div className="flex-1 relative overflow-hidden" style={{ background: '#07090b' }}>

      {/* ═══════════════════════════════════════
          GARAGE BACKGROUND IMAGE
      ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/cars/garage.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        filter: 'brightness(0.72) saturate(0.6)',
      }} />

      {/* Dark overlay on interior area to make car pop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 0%, transparent 36%, rgba(4,5,7,0.55) 55%, rgba(4,5,7,0.82) 100%)',
      }} />

      {/* ═══════════════════════════════════════
          GARAGE SHUTTER — animates open on car change
      ═══════════════════════════════════════ */}
      <div
        className="absolute inset-0 origin-top"
        style={{
          transform: shutterOpen ? 'scaleY(0)' : 'scaleY(1)',
          transition: 'transform 1.8s cubic-bezier(0.22, 1, 0.36, 1)',
          backgroundImage: 'repeating-linear-gradient(180deg, hsl(0 0% 28%) 0px, hsl(0 0% 35%) 3px, hsl(0 0% 22%) 6px, hsl(0 0% 30%) 9px)',
          zIndex: 20,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '30px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
      </div>

      {/* ═══════════════════════════════════════
          BUTTONS — overlaid on the shutter area
      ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: '15%', left: 14, right: 14,
        display: 'flex', gap: 10, zIndex: 10,
      }}>
        <button
          className="font-condensed"
          onClick={() => toggle('bitacora')}
          style={{
            ...BTN_BASE,
            background: openPanel === 'bitacora' ? 'rgba(240,224,64,0.95)' : 'rgba(10,8,6,0.65)',
            color: openPanel === 'bitacora' ? '#1a1600' : '#fff',
            borderColor: openPanel === 'bitacora' ? 'transparent' : 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)',
            padding: '7px 0',
            fontSize: '0.8rem',
          }}
        >
          BITÁCORA
        </button>
        <button
          className="font-condensed"
          onClick={() => toggle('stats')}
          style={{
            ...BTN_BASE,
            background: openPanel === 'stats' ? 'rgba(240,224,64,0.95)' : 'rgba(10,8,6,0.65)',
            color: openPanel === 'stats' ? '#1a1600' : '#fff',
            borderColor: openPanel === 'stats' ? 'transparent' : 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)',
            padding: '7px 0',
            fontSize: '0.8rem',
          }}
        >
          ESTADÍSTICAS
        </button>
      </div>

      {/* ═══════════════════════════════════════
          CAR IMAGE — sits in the garage opening
      ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 80,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 5,
      }}>
        <img
          src={carImage}
          alt={`${car.brand} ${car.model}`}
          style={{
            width: '98%',
            maxHeight: '64vh',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            display: 'block',
            filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.9))',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════
          CAR INFO — bottom overlay
      ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6,
        padding: '0 20px 20px',
        pointerEvents: 'none',
      }}>
        <div
          className="font-condensed font-black italic uppercase"
          style={{ fontSize: '1.65rem', color: '#fff', lineHeight: 1, letterSpacing: '0.04em', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
        >
          {car.brand}{' '}
          <span style={{ color: 'var(--yellow)' }}>{car.model}</span>
        </div>
        <div
          className="font-condensed"
          style={{ fontSize: '0.84rem', color: 'var(--gray)', marginTop: 5, letterSpacing: '0.02em' }}
        >
          {car.version} · {car.year} · {car.km.toLocaleString('es-AR')} km
        </div>
        <div
          className="font-condensed font-bold uppercase"
          style={{
            display: 'inline-block',
            marginTop: 10,
            background: 'rgba(240,224,64,0.1)',
            border: '1px solid rgba(240,224,64,0.38)',
            color: 'var(--yellow)',
            fontSize: '0.68rem',
            letterSpacing: '0.15em',
            padding: '3px 11px',
            borderRadius: 3,
          }}
        >
          {car.plate}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SLIDING PANEL — left to right
      ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '100%',
        zIndex: 30,
        transform: openPanel ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.34s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(7, 9, 11, 0.98)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div
            className="font-condensed font-black italic uppercase"
            style={{ fontSize: '1.05rem', color: 'var(--yellow)', letterSpacing: '0.08em' }}
          >
            {openPanel === 'bitacora' ? 'BITÁCORA' : 'ESTADÍSTICAS'}
          </div>
          <button
            onClick={() => setOpenPanel(null)}
            className="font-condensed font-bold"
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--gray)', cursor: 'pointer',
              fontSize: '0.7rem', letterSpacing: '0.1em',
              padding: '4px 10px', borderRadius: 4,
            }}
          >
            ✕ CERRAR
          </button>
        </div>

        {/* Panel scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

          {/* ── BITÁCORA ── */}
          {openPanel === 'bitacora' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bitacora.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: 12, borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="font-condensed font-black uppercase text-center"
                    style={{
                      background: `${typeColors[entry.type]}15`,
                      border: `1px solid ${typeColors[entry.type]}35`,
                      color: typeColors[entry.type],
                      fontSize: '0.57rem', letterSpacing: '0.08em',
                      padding: '2px 8px', borderRadius: 3,
                      marginTop: 2, whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {typeLabels[entry.type]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div
                        className="font-condensed font-bold uppercase"
                        style={{ fontSize: '0.87rem', color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2 }}
                      >
                        {entry.description}
                      </div>
                      {entry.cost > 0 && (
                        <div
                          className="font-condensed font-black"
                          style={{ fontSize: '0.9rem', color: 'var(--yellow)', flexShrink: 0 }}
                        >
                          ${entry.cost.toLocaleString('es-AR')}
                        </div>
                      )}
                    </div>

                    {entry.parts && entry.parts.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginTop: 6 }}>
                        {entry.parts.map((p) => (
                          <span
                            key={p}
                            className="font-condensed"
                            style={{
                              fontSize: '0.63rem',
                              background: 'rgba(255,255,255,0.07)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              color: 'var(--gray2)',
                              padding: '1px 7px', borderRadius: 3,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.65rem', color: 'var(--gray)' }}>
                      <span>
                        {new Date(entry.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span>{entry.km.toLocaleString('es-AR')} km</span>
                      {entry.seller && <span>{entry.seller}</span>}
                    </div>
                  </div>
                </div>
              ))}

              <button
                className="font-condensed font-bold uppercase"
                style={{
                  background: 'none',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  color: 'var(--gray)',
                  fontSize: '0.76rem', letterSpacing: '0.1em',
                  padding: '11px 0', borderRadius: 8,
                  cursor: 'pointer', width: '100%', marginTop: 4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(240,224,64,0.4)'
                  e.currentTarget.style.color = 'var(--yellow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'var(--gray)'
                }}
              >
                + AGREGAR ENTRADA
              </button>
            </div>
          )}

          {/* ── ESTADÍSTICAS ── */}
          {openPanel === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { label: 'Total invertido',      value: `$${totalGasto.toLocaleString('es-AR')}`, accent: true  },
                { label: 'Entradas bitácora',     value: String(bitacora.length),                  accent: false },
                { label: 'Último service',        value: '139.500 km',                             accent: false },
                { label: 'Próximo service',       value: '150.000 km',                             accent: false },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  style={{
                    padding: '14px 12px', borderRadius: 8,
                    background: accent ? 'rgba(240,224,64,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${accent ? 'rgba(240,224,64,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div
                    className="font-condensed font-black"
                    style={{ fontSize: '1.4rem', color: accent ? 'var(--yellow)' : '#fff', lineHeight: 1 }}
                  >
                    {value}
                  </div>
                  <div
                    className="font-condensed uppercase"
                    style={{ fontSize: '0.64rem', color: 'var(--gray)', letterSpacing: '0.1em', marginTop: 4 }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
