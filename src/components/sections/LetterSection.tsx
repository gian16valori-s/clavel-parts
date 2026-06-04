export default function LetterSection() {
  return (
    <div
      className="flex items-center justify-center section-px px-10 py-16"
      style={{ background: 'var(--dark2)' }}
    >
      <div
        className="relative w-full max-w-[760px] rounded-md px-14 py-12"
        style={{
          background: 'var(--dark3)',
          border: '1px solid var(--dark4)',
          borderTop: '3px solid var(--yellow)',
        }}
      >
        {/* Stamp */}
        <div
          className="absolute top-8 right-10 w-16 h-16 rounded-full flex items-center justify-center"
          style={{ border: '3px solid var(--yellow)', opacity: 0.6 }}
        >
          <span
            className="font-condensed font-black uppercase text-center leading-[1.3]"
            style={{ fontSize: '0.55rem', letterSpacing: '0.05em', color: 'var(--yellow)' }}
          >
            FIERRERO<br />CERTIFIED
          </span>
        </div>

        {/* Meta */}
        <div
          className="flex gap-8 mb-6 font-condensed uppercase tracking-[0.12em]"
          style={{ fontSize: '0.82rem', color: 'var(--gray)' }}
        >
          <span className="flex flex-col gap-1">
            PARA:<br />
            <strong style={{ color: 'var(--yellow)', fontSize: '0.95rem' }}>Todo el que tiene un fierro</strong>
          </span>
          <span className="flex flex-col gap-1">
            DE:<br />
            <strong style={{ color: 'var(--yellow)', fontSize: '0.95rem' }}>Fierreros como vos</strong>
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-condensed font-black italic uppercase text-white mb-5"
          style={{ fontSize: '2.4rem', lineHeight: 1 }}
        >
          Sabemos lo que es perder horas buscando una pieza.
        </h2>

        {/* Body */}
        <p className="leading-[1.75]" style={{ fontSize: '1rem', color: 'var(--gray2)' }}>
          Lo construimos porque lo vivimos.{' '}
          <strong className="text-white">Horas navegando listas interminables de resultados</strong>,
          comprando el repuesto equivocado, volviendo al garage con las manos vacías.
          <br /><br />
          Nuestra misión es simple:{' '}
          <strong className="text-white">concentrar en un solo lugar todos los repuestos disponibles del mercado</strong>,
          organizados por tu vehículo exacto. Sin ruido, sin adivinanzas, sin devoluciones. Que lo que comprés encaje la primera vez.
          <br /><br />
          Porque un fierrero no tendría que gastar tiempo en búsquedas — tendría que estar metiendo mano.
        </p>

        {/* Signature */}
        <div
          className="mt-8 font-condensed font-bold italic"
          style={{ fontSize: '1.1rem', color: 'var(--yellow)' }}
        >
          — El equipo de ClavelParts 🔧
        </div>
      </div>
    </div>
  )
}
