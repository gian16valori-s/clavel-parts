'use client'

import { useState } from 'react'

export default function WaitlistSection() {
  const [role, setRole]   = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSent(true)
  }

  return (
    <section
      id="waitlist"
      className="relative overflow-hidden text-center section-px px-10 py-[4.5rem]"
      style={{ background: 'var(--slate)' }}
    >
      {/* Decorative circles */}
      <div
        className="absolute rounded-full"
        style={{ top: -60, right: -60, width: 280, height: 280, background: 'rgba(255,255,255,0.03)' }}
      />
      <div
        className="absolute rounded-full"
        style={{ bottom: -80, left: -40, width: 220, height: 220, background: 'rgba(255,255,255,0.03)' }}
      />

      <div className="relative z-[1]">
        <h2
          className="font-condensed font-black italic uppercase text-white leading-none mb-3"
          style={{ fontSize: '3rem' }}
        >
          UNITE A LA<br />
          <span style={{ color: 'var(--yellow)' }}>LISTA DE ESPERA</span>
        </h2>
        <p className="mb-9" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)' }}>
          Sé de los primeros en acceder cuando abramos. Sin spam, solo novedades del proyecto.
        </p>

        {sent ? (
          <div
            className="inline-block font-condensed font-bold italic uppercase text-white px-8 py-4 rounded"
            style={{ background: 'var(--dark3)', border: '1px solid var(--yellow)', fontSize: '1.1rem' }}
          >
            ¡Anotado! 🔧 Te avisamos cuando abramos.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="waitlist-form flex gap-3 max-w-[540px] mx-auto"
          >
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="font-condensed font-bold uppercase cursor-pointer"
              style={{
                padding: '0.82rem 1.1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4,
                color: 'var(--white)',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                appearance: 'none',
              }}
            >
              <option value="">SOY...</option>
              <option>Comprador</option>
              <option>Vendedor</option>
              <option>Los dos</option>
            </select>

            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 font-barlow focus:outline-none transition-colors duration-200"
              style={{
                padding: '0.82rem 1.1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4,
                color: 'var(--white)',
                fontSize: '0.92rem',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--yellow)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
            />

            <button
              type="submit"
              className="font-condensed font-black italic uppercase whitespace-nowrap transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                padding: '0.82rem 1.8rem',
                background: 'var(--yellow)',
                color: 'var(--text-dark)',
                border: 'none',
                borderRadius: 4,
                fontSize: '1.05rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              ¡ME APUNTO!
            </button>
          </form>
        )}

        <div className="flex gap-6 justify-center mt-6">
          {['Sin spam', 'Acceso anticipado', 'Hecho por fierreros'].map((tag) => (
            <span key={tag} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
              <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>✓ </span>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
