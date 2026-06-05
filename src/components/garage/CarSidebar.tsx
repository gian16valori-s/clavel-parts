'use client'

import { useState } from 'react'
import type { GarageVehicle } from '@/lib/garageService'

interface CarSidebarProps {
  vehicles: GarageVehicle[]
  activeId: string | null
  onSelect: (car: GarageVehicle) => void
  onAdd: () => void
}

export default function CarSidebar({ vehicles, activeId, onSelect, onAdd }: CarSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="absolute left-0"
      style={{
        top: 126,
        bottom: 0,
        zIndex: 12,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className="h-full rounded-r-xl border overflow-hidden"
        style={{
          width: 176,
          background: 'rgba(8,10,12,0.97)',
          borderColor: 'rgba(255,255,255,0.06)',
          boxShadow: open ? '0 18px 36px rgba(0,0,0,0.35)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(calc(-100% + 34px))',
          transition: 'transform 0.26s ease, box-shadow 0.26s ease',
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div
            className="flex flex-col items-center pt-4 flex-shrink-0"
            style={{
              width: 34,
              background: 'rgba(255,255,255,0.03)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              color: open ? 'var(--yellow)' : '#666',
            }}
          >
            <div
              className="font-condensed font-black uppercase"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: '0.62rem',
                letterSpacing: '0.14em',
              }}
            >
              MIS AUTOS
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="px-3 pt-4 pb-2 flex-shrink-0">
              <div
                className="font-condensed font-black uppercase"
                style={{ color: '#8a8f96', fontSize: '0.65rem', letterSpacing: '0.12em' }}
              >
                MIS AUTOS
              </div>
            </div>

            <div className="flex flex-col gap-2 px-2 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarGutter: 'stable', maxHeight: 'calc(100vh - 126px - 116px)' }}>
              {vehicles.map((car) => {
                const isActive = car.id === activeId
                return (
                  <button
                    key={car.id}
                    onClick={() => onSelect(car)}
                    className="w-full rounded-lg overflow-hidden transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(240,224,64,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? 'var(--yellow)' : 'rgba(255,255,255,0.06)'}`,
                      padding: '0.6rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }}
                  >
                    <div
                      className="w-full rounded mb-2 flex items-center justify-center overflow-hidden"
                      style={{ height: 68, background: 'rgba(255,255,255,0.04)' }}
                    >
                      {car.photo ? (
                        <img
                          src={car.photo}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={isActive ? 'var(--yellow)' : '#3a3a3a'}
                          strokeWidth={1.2}
                          style={{ width: 34, height: 34 }}
                        >
                          <rect x="1" y="8" width="22" height="10" rx="2" />
                          <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" />
                          <circle cx="7" cy="18" r="1.5" />
                          <circle cx="17" cy="18" r="1.5" />
                        </svg>
                      )}
                    </div>

                    <div
                      className="font-condensed font-black uppercase leading-tight"
                      style={{ color: isActive ? 'var(--yellow)' : '#ddd', fontSize: '0.72rem', letterSpacing: '0.04em' }}
                    >
                      {car.brand}
                    </div>
                    <div
                      className="font-condensed font-bold uppercase"
                      style={{ color: isActive ? '#ccc' : '#666', fontSize: '0.66rem' }}
                    >
                      {car.model} · {car.year}
                    </div>
                    {car.plate && (
                      <div
                        style={{ color: '#444', fontSize: '0.6rem', marginTop: 2, letterSpacing: '0.08em' }}
                      >
                        {car.plate}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="px-2 py-3 flex-shrink-0">
              <button
                onClick={onAdd}
                className="w-full rounded-lg py-2 font-condensed font-bold uppercase transition-colors"
                style={{
                  background: 'none',
                  border: '1px dashed rgba(255,255,255,0.13)',
                  color: 'var(--gray)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--yellow)'
                  e.currentTarget.style.color = 'var(--yellow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'
                  e.currentTarget.style.color = 'var(--gray)'
                }}
              >
                + AGREGAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
