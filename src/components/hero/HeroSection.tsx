'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import VehicleSelector from './VehicleSelector'

const heroSlides = [
  { id: 'slide-1', image: '/hero/slide-1.png' },
  { id: 'slide-2', image: '/hero/slide-2.png' },
  { id: 'slide-3', image: '/hero/slide-3.png' },
  { id: 'slide-4', image: '/hero/slide-4.png' },
] as const

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <section
      style={{
        display: 'grid',
        overflow: 'hidden',
        gridTemplateColumns: 'clamp(250px, 30%, 400px) minmax(0, 1fr)',
        minHeight: 'calc(100vh - 126px)',
        height: 'calc(100vh - 126px)',
      }}
    >
      {/* LEFT — Vehicle selector */}
      <VehicleSelector />

      {/* RIGHT — Visual */}
      <div
        style={{
          position: 'relative',
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0c0e10 0%, #141a22 55%, #0f1419 100%)' }}
        />

        <div
          key={heroSlides[activeSlide].id}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            transition: 'opacity 700ms ease',
          }}
        >
          <Image
            src={heroSlides[activeSlide].image}
            alt={`Slide promocional ${activeSlide + 1} de ClavelParts`}
            fill
            priority={activeSlide === 0}
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 70vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(10,12,14,0.8) 0%, rgba(10,12,14,0.5) 45%, rgba(10,12,14,0.72) 100%)',
            }}
          />
        </div>

        <div className="hero-bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.14 }} />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            paddingLeft: '3.2rem',
            paddingRight: '3.2rem',
            paddingTop: '3rem',
            paddingBottom: '2.8rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 65%, transparent 100%)',
          }}
        >
          <span
            className="inline-block font-condensed font-bold uppercase mb-[1.1rem]"
            style={{
              background: 'var(--slate)',
              color: 'var(--gray2)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              padding: '0.28rem 0.9rem',
              borderRadius: 3,
            }}
          >
            🔧 MARKETPLACE DE AUTOPARTES · ARGENTINA
          </span>

          <h1
            className="font-condensed font-black italic uppercase text-white"
            style={{
              fontSize: '4.5rem',
              lineHeight: 0.9,
              textShadow: '0 2px 24px rgba(0,0,0,0.7)',
              marginBottom: '1rem',
            }}
          >
            EL REPUESTO<br />
            <span style={{ color: 'var(--yellow)' }}>CORRECTO,</span><br />
            GARANTIZADO.
          </h1>

          <p
            className="mb-[1.8rem] leading-[1.6]"
            style={{ fontSize: '1rem', color: 'var(--gray)', maxWidth: 460 }}
          >
            Todos los repuestos disponibles en un solo lugar. Encontrá lo que necesitás en minutos, con compatibilidad verificada para tu vehículo exacto.
          </p>

          <a
            href="#waitlist"
            className="inline-flex items-center gap-[0.55rem] font-condensed font-black italic uppercase no-underline transition-all duration-150"
            style={{
              background: 'var(--yellow)',
              color: 'var(--text-dark)',
              fontSize: '1.1rem',
              letterSpacing: '0.08em',
              padding: '0.85rem 1.9rem',
              borderRadius: 4,
              boxShadow: '0 4px 18px rgba(240,224,64,0.22)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 26px rgba(240,224,64,0.38)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'none'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 18px rgba(240,224,64,0.22)'
            }}
          >
            QUIERO ACCESO ANTICIPADO
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        <div
          style={{
            position: 'absolute',
            right: '3.2rem',
            bottom: '1.75rem',
            zIndex: 3,
            display: 'flex',
            gap: '0.45rem',
          }}
        >
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => setActiveSlide(i)}
              style={{
                width: 9,
                height: 9,
                borderRadius: '999px',
                cursor: 'pointer',
                border: 'none',
                background: activeSlide === i ? 'var(--white)' : 'rgba(255,255,255,0.21)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
