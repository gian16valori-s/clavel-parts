import { useState, useEffect } from 'react';

interface GarageCar {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: string | number;
  km: number;
  plate: string;
  photoFront?: string;
}

const defaultCar: GarageCar = {
  id: '1',
  brand: 'BMW',
  model: 'SERIE 1',
  version: '130i M Sport Package 3.0L',
  year: 2009,
  km: 142500,
  plate: 'HXC 704',
};

const defaultGarageCarImage = '/cars/Bmw-serie1-frente.jpeg';
const garageBackgroundImage = '/cars/garage.jpeg';

const menuItems = [
  {
    title: 'MIS AUTOS',
    subtitle: '1 vehículo registrado',
    badge: 1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <rect x="1" y="8" width="22" height="10" rx="2"/><path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
      </svg>
    ),
  },
  {
    title: 'MIS COMPRAS',
    subtitle: 'Último pedido hace 3 días',
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    ),
  },
  {
    title: 'FAVORITOS',
    subtitle: '7 repuestos guardados',
    badge: 7,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    title: 'ALERTAS',
    subtitle: '2 novedades para tu BMW',
    badge: 2,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
  {
    title: 'MI PERFIL',
    subtitle: '',
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export default function CarShowcase({ car = defaultCar }: { car?: GarageCar }) {
  const [shutterOpen, setShutterOpen] = useState(false);

  useEffect(() => {
    setShutterOpen(false);
    const timer = setTimeout(() => setShutterOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [car.id]);

  const carImage = car.photoFront ?? defaultGarageCarImage;

  return (
    <div className="relative w-full h-full overflow-hidden flex" style={{ background: '#0a0a0a' }}>

      {/* ── LEFT: garage area ── */}
      <div className="relative flex-1 overflow-hidden" style={{ zIndex: 1 }}>
        {/* Garage background — solo en la columna izquierda */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${garageBackgroundImage})`, filter: 'brightness(0.55) saturate(0.3)' }}
        />

        {/* Car image */}
        <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: '6%', zIndex: 5 }}>
          <img
            src={carImage}
            alt={`${car.brand} ${car.model}`}
            className="object-contain drop-shadow-2xl"
            style={{
              maxHeight: '70%',
              maxWidth: '80%',
              opacity: shutterOpen ? 1 : 0,
              transition: 'opacity 0.6s ease 0.4s',
            }}
          />
        </div>

        {/* Shutter animation */}
        <div
          className="absolute inset-0 origin-top"
          style={{
            transform: shutterOpen ? 'scaleY(0)' : 'scaleY(1)',
            transition: 'transform 1.8s cubic-bezier(0.22, 1, 0.36, 1)',
            backgroundImage:
              'repeating-linear-gradient(180deg, hsl(0 0% 28%) 0px, hsl(0 0% 35%) 3px, hsl(0 0% 22%) 6px, hsl(0 0% 30%) 9px)',
            zIndex: 10,
          }}
        >
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '30px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
        </div>

        {/* Bottom gradient over car */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '32%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', zIndex: 6 }} />

        {/* Car label bottom-left */}
        <div className="absolute bottom-0 left-0 px-8 py-5" style={{ zIndex: 7 }}>
          <div
            className="font-black uppercase"
            style={{ color: '#ffffff', fontSize: '1.55rem', letterSpacing: '0.05em', lineHeight: 1.1, fontFamily: '"Barlow Condensed", sans-serif' }}
          >
            {car.brand} <span style={{ color: '#e8e8e8' }}>{car.model}</span>
          </div>
          <div style={{ color: '#999', fontSize: '0.78rem', marginTop: '3px', letterSpacing: '0.02em' }}>
            {car.version} · {car.year} · {car.km.toLocaleString('es-AR')} km
          </div>
        </div>
      </div>

      {/* ── RIGHT: user panel ── */}
      <div
        className="flex flex-col flex-shrink-0"
        style={{ width: '300px', background: 'rgba(14,16,18,0.97)', borderLeft: '1px solid rgba(255,255,255,0.07)', zIndex: 2 }}
      >
        {/* Profile header */}
        <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div
              className="flex items-center justify-center font-black flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid var(--yellow)',
                color: 'var(--yellow)',
                fontSize: '1.3rem',
                fontFamily: '"Barlow Condensed", sans-serif',
                background: 'transparent',
              }}
            >
              J
            </div>
            <div>
              <div className="font-black uppercase" style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.05em', fontFamily: '"Barlow Condensed", sans-serif' }}>
                JUAMPI
              </div>
              <div style={{ color: '#888', fontSize: '0.72rem', marginTop: 1 }}>
                Comprador · Buenos Aires
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 text-center">
            {[
              { value: '1', label: 'AUTO' },
              { value: '6', label: 'COMPRAS' },
              { value: '7', label: 'FAVORITOS' },
            ].map((stat, i) => (
              <div key={stat.label} style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div className="font-black" style={{ color: '#fff', fontSize: '1.5rem', lineHeight: 1.1, fontFamily: '"Barlow Condensed", sans-serif' }}>
                  {stat.value}
                </div>
                <div style={{ color: '#666', fontSize: '0.62rem', marginTop: 1, letterSpacing: '0.08em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item, i) => (
            <button
              key={item.title}
              className="w-full flex items-center gap-3 px-5 py-3 transition-colors duration-150"
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {/* Icon box */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: item.title === 'FAVORITOS' ? 'var(--yellow)' : '#aaa',
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="font-bold uppercase" style={{ color: '#e8e8e8', fontSize: '0.8rem', letterSpacing: '0.05em', fontFamily: '"Barlow Condensed", sans-serif' }}>
                  {item.title}
                </div>
                {item.subtitle && (
                  <div style={{ color: '#666', fontSize: '0.68rem', marginTop: 1 }}>
                    {item.subtitle}
                  </div>
                )}
              </div>

              {/* Badge */}
              {item.badge !== null && (
                <div
                  className="flex items-center justify-center font-black flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--yellow)',
                    color: '#000',
                    fontSize: '0.65rem',
                  }}
                >
                  {item.badge}
                </div>
              )}

              {/* Arrow for MI PERFIL */}
              {item.title === 'MI PERFIL' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={2} width={14} height={14}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
