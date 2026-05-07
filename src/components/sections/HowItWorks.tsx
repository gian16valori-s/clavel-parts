const steps = [
  {
    num: '01',
    title: 'Registrás tu auto',
    body: 'Ingresás marca, modelo, año y versión una sola vez. La plataforma identifica tu vehículo exacto hasta el motor.',
  },
  {
    num: '02',
    title: 'Encontrás el repuesto',
    body: 'Solo aparecen piezas compatibles. Comparás vendedores, precios y condiciones sin ruido ni resultados irrelevantes.',
  },
  {
    num: '03',
    title: 'Comprás con certeza',
    body: 'Compatibilidad verificada antes de comprar. Sin devoluciones por error, sin viajes al mecánico a confirmar.',
  },
]

export default function HowItWorks() {
  return (
    <section className="section-px px-10 py-[4.5rem]" style={{ background: 'var(--dark2)' }}>
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
          EL PROCESO
        </span>
        <h2
          className="font-condensed font-black italic uppercase text-white block"
          style={{ fontSize: '2.8rem', lineHeight: 1 }}
        >
          ¿CÓMO <span style={{ color: 'var(--yellow)' }}>FUNCIONA?</span>
        </h2>
        <p className="mt-3" style={{ fontSize: '0.95rem', color: 'var(--gray)', maxWidth: 480, margin: '0.7rem auto 0' }}>
          Tres pasos. Sin fricción. Sin sorpresas.
        </p>
      </div>

      <div className="grid gap-6 max-w-[1100px] mx-auto grid-3col" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-sm px-6 py-7 transition-all duration-200 group"
            style={{
              background: 'var(--dark3)',
              border: '1px solid var(--dark4)',
              borderTop: '3px solid var(--slate)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
              ;(e.currentTarget as HTMLDivElement).style.borderTopColor = 'var(--yellow)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'none'
              ;(e.currentTarget as HTMLDivElement).style.borderTopColor = 'var(--slate)'
            }}
          >
            <div
              className="font-condensed font-black mb-3"
              style={{ fontSize: '3.2rem', color: 'var(--yellow)', lineHeight: 1 }}
            >
              {step.num}
            </div>
            <div
              className="font-condensed font-extrabold uppercase tracking-[0.05em] text-white mb-2"
              style={{ fontSize: '1.25rem' }}
            >
              {step.title}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray)', lineHeight: 1.6 }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
