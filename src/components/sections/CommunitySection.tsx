const cards = [
  { icon: '🔧', title: 'Tutoriales técnicos',   body: 'Guías de reparación por modelo. Aprendés y confiás en la plataforma.' },
  { icon: '⭐', title: 'Proyectos de usuarios',  body: 'Restauraciones y builds compartidos. Inspiración real de la comunidad.' },
  { icon: '📰', title: 'Noticias mundo motor',   body: 'Encuentros, novedades y cultura automotriz. Razones para volver todos los días.' },
  { icon: '🚗', title: 'Mi garaje digital',      body: 'Guardás tu vehículo y recibís alertas de novedades y liquidaciones para tu modelo.' },
]

export default function CommunitySection() {
  return (
    <section className="section-px px-10 py-[4.5rem]" style={{ background: 'var(--dark)' }}>
      <div className="text-center mb-12">
        <span
          className="inline-block font-condensed font-bold uppercase mb-[0.9rem]"
          style={{
            background: 'var(--slate)',
            color: 'var(--gray2)',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            padding: '0.28rem 0.9rem',
            borderRadius: 3,
          }}
        >
          MÁS QUE UN MARKETPLACE
        </span>
        <h2
          className="font-condensed font-black italic uppercase text-white block"
          style={{ fontSize: '2.8rem', lineHeight: 1 }}
        >
          UNA COMUNIDAD <span style={{ color: 'var(--yellow)' }}>FIERRERA</span>
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--gray)', marginTop: '0.7rem' }}>
          Un lugar para el entusiasta, no solo para el comprador.
        </p>
      </div>

      <div className="grid gap-[1.1rem] max-w-[1100px] mx-auto grid-4col" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-sm px-[1.4rem] py-[1.6rem] transition-all duration-200"
            style={{
              background: 'var(--dark3)',
              border: '1px solid var(--dark4)',
              borderTop: '3px solid var(--slate)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
              ;(e.currentTarget as HTMLDivElement).style.borderTopColor = 'var(--yellow)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'none'
              ;(e.currentTarget as HTMLDivElement).style.borderTopColor = 'var(--slate)'
            }}
          >
            <span className="block text-[1.8rem] mb-[0.9rem]">{card.icon}</span>
            <div
              className="font-condensed font-extrabold uppercase tracking-[0.05em] text-white mb-[0.45rem]"
              style={{ fontSize: '1.1rem' }}
            >
              {card.title}
            </div>
            <p style={{ fontSize: '0.87rem', color: 'var(--gray)', lineHeight: 1.55 }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
