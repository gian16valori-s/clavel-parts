'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/cartStore'
import { demoGarageCars } from '@/lib/garageData'
import CarShowcase from './CarShowcase'

export default function GaragePage() {
  const { setView } = useAppStore()
  const [activeCar, setActiveCar] = useState(demoGarageCars[0])

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden flex flex-col"
      style={{ background: '#080a0c' }}
    >
      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 126 }}>
        {/* LEFT — Car showcase */}
        <CarShowcase car={activeCar} />
      </div>

      {/* ── Car selector bottom strip (if multiple cars) ── */}
      {demoGarageCars.length > 1 && (
        <div
          className="flex gap-3 px-8 py-3 border-t flex-shrink-0"
          style={{ background: 'rgba(10,12,14,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {demoGarageCars.map((car) => (
            <button
              key={car.id}
              onClick={() => setActiveCar(car)}
              className="flex items-center gap-2 px-4 py-2 rounded font-condensed font-bold uppercase transition-all duration-200"
              style={{
                background: activeCar.id === car.id ? 'var(--yellow)' : 'rgba(255,255,255,0.05)',
                color: activeCar.id === car.id ? 'var(--text-dark)' : 'var(--gray2)',
                border: `1px solid ${activeCar.id === car.id ? 'var(--yellow)' : 'rgba(255,255,255,0.1)'}`,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              {car.brand} {car.model} · {car.year}
            </button>
          ))}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded font-condensed font-bold uppercase transition-all duration-200"
            style={{
              background: 'none',
              color: 'var(--gray)',
              border: '1px dashed rgba(255,255,255,0.15)',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--yellow)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray)')}
          >
            + AGREGAR AUTO
          </button>
        </div>
      )}
    </div>
  )
}
