import { useState, useEffect } from 'react';import type { GarageVehicle } from '@/lib/garageService';

const openGarageImage          = '/cars/garage2.jpg';
const occupiedGarageLightImage  = '/cars/garage_occupied_light1.jpg';
const occupiedGarageDarkImage   = '/cars/garage_occupied1.jpg';



export default function CarShowcase({ car, hasVehicles = false }: { car: GarageVehicle | null; hasVehicles?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [occupiedVariant, setOccupiedVariant] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setImgError(false);
  }, [car?.id]);

  useEffect(() => {
    if (!car) return;
    setOccupiedVariant(Math.random() < 0.5 ? 'light' : 'dark');
  }, [car?.id]);

  const sceneImage = car
    ? (occupiedVariant === 'light' ? occupiedGarageLightImage : occupiedGarageDarkImage)
    : openGarageImage;

  return (
    <div className="relative flex-1 overflow-hidden" style={{ background: '#0a0a0a', zIndex: 1 }}>

      {/* Scene image */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <img
          src={sceneImage}
          alt={car ? `${car.brand} ${car.model}` : 'Garage'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          style={{
            filter: car ? 'brightness(0.92) saturate(0.95)' : 'brightness(0.55) saturate(0.3)',
            opacity: imgError ? 0.2 : 1,
            transform: 'scale(1.03)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* No-car placeholder */}
      {!car && !hasVehicles && (
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-4" style={{ zIndex: 5, paddingBottom: '12%' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} style={{ width: 80, height: 80 }}>
            <rect x="1" y="8" width="22" height="10" rx="2" />
            <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" />
            <circle cx="7" cy="18" r="1.5" />
            <circle cx="17" cy="18" r="1.5" />
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.12)', fontFamily: '"Barlow Condensed", sans-serif', fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Agregá tu primer auto
          </p>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '32%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', zIndex: 6 }} />

      {/* Car label */}
      {car && (
        <div className="absolute bottom-0 py-5" style={{ left: 'clamp(72px, 12%, 140px)', zIndex: 7 }}>
          <div
            className="font-black uppercase"
            style={{ color: '#ffffff', fontSize: '1.55rem', letterSpacing: '0.05em', lineHeight: 1.1, fontFamily: '"Barlow Condensed", sans-serif' }}
          >
            {car.brand} <span style={{ color: '#e8e8e8' }}>{car.model}</span>
          </div>
          <div style={{ color: '#999', fontSize: '0.78rem', marginTop: 3, letterSpacing: '0.02em' }}>
            {[car.version, car.year, `${car.km.toLocaleString('es-AR')} km`].filter(Boolean).join(' · ')}
          </div>
          {car.plate && (
            <div
              className="inline-block mt-2 px-2 py-0.5 rounded font-condensed font-bold uppercase"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#888', fontSize: '0.68rem', letterSpacing: '0.12em' }}
            >
              {car.plate}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
