'use client'

import Image from 'next/image'

const categories = [
  { id: 'neumaticos',    name: 'Neumáticos y llantas', image: '/categories/neumaticos y llantas.png' },
  { id: 'frenos',        name: 'Frenos',               image: '/categories/frenos.png' },
  { id: 'motor',         name: 'Motor',                image: '/categories/motor.png' },
  { id: 'filtros',       name: 'Filtros',              image: '/categories/lubricacion.png' },
  { id: 'amortiguacion', name: 'Amortiguación',        image: '/categories/suspension.png' },
  { id: 'embrague',      name: 'Embrague',             image: '/categories/embrague.png' },
  { id: 'electrico',     name: 'Sistema eléctrico',    image: '/categories/electricidad.png' },
  { id: 'interior',      name: 'Interior',             image: '/categories/interior.png' },
  { id: 'aceites',       name: 'Aceites y líquidos',   image: '/categories/lubricacion.png' },
  { id: 'correas',       name: 'Correas y cadenas',    image: '/categories/distribucion.png' },
  { id: 'carroceria',    name: 'Carrocería',           image: '/categories/carroceria.png' },
  { id: 'suspension',    name: 'Suspensión',           image: '/categories/suspension.png' },
  { id: 'otros',         name: 'Otras categorías',     image: '/categories/otros.png' },
]

export default function CategoryGrid() {
  return (
    <section className="px-10 py-[4.5rem]" style={{ background: 'var(--light-bg)' }}>
      <div className="text-center mb-[2.8rem]">
        <h2
          className="font-condensed font-black italic uppercase tracking-[0.06em]"
          style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}
        >
          ENCONTRÁ REPUESTOS EN NUESTRO CATÁLOGO
        </h2>
      </div>

      <div
        className="grid gap-4 max-w-[1200px] mx-auto mb-8"
        style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
      >
        {categories.map((cat) => (
          <a
            key={cat.id}
            href="#"
            className="cat-card flex flex-col items-center gap-[0.6rem] no-underline rounded-md py-5 px-3 transition-all duration-200"
            style={{
              background: 'var(--light-card)',
              border: '1px solid #e0e4e8',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(-3px)'
              el.style.borderColor = 'var(--slate2)'
              el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'none'
              el.style.borderColor = '#e0e4e8'
              el.style.boxShadow = 'none'
            }}
          >
            <div
              className="relative flex items-center justify-center overflow-hidden rounded-md"
              style={{ height: 110, width: '100%', background: '#f8f9fb' }}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
            </div>
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'var(--slate2)' }} />
            <div
              className="text-center leading-[1.3] font-barlow font-semibold"
              style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}
            >
              {cat.name}
            </div>
          </a>
        ))}
      </div>

      <div className="text-center">
        <button
          className="font-condensed font-extrabold italic uppercase transition-all duration-200"
          style={{
            background: 'none',
            border: '2px solid var(--text-dark)',
            color: 'var(--text-dark)',
            fontSize: '1rem',
            letterSpacing: '0.08em',
            padding: '0.7rem 2.5rem',
            cursor: 'pointer',
            borderRadius: 3,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-dark)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--white)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dark)'
          }}
        >
          Más repuestos disponibles →
        </button>
      </div>
    </section>
  )
}
