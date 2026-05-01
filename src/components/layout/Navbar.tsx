'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/cartStore'

const navLinks = [
  'ACEITES', 'NEUMÁTICOS', 'LLANTAS', 'FILTROS',
  'FRENOS', 'NOS',
]

const rightLinks = ['OFF ROAD Y OUTDOOR']

export default function Navbar() {
  const { setView } = useAppStore()
  return (
    <nav
      className="sticky z-[299] flex items-center px-10 border-b-2 overflow-x-auto"
      style={{ background: 'var(--slate)', top: 78, height: 48, borderColor: 'var(--dark)' }}
    >
      {/* Login */}
      <Link
        href="/login"
        className="flex items-center gap-[0.4rem] pr-5 mr-2 transition-colors duration-200"
        style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.08em',
          color: 'var(--gray2)',
          textTransform: 'uppercase',
          borderRight: '1px solid rgba(255,255,255,0.09)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--yellow)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray2)')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        INICIAR SESIÓN
      </Link>

      {/* Category links */}
      <div className="flex items-center flex-1">
        {navLinks.map((link) => (
          <a key={link} href="#" className="nav-link">
            {link}
          </a>
        ))}

        <div className="ml-auto flex items-center">
          {rightLinks.map((link) => (
            <a key={link} href="#" className="nav-link">
              {link}
            </a>
          ))}
          <a
            href="#"
            className="nav-link nav-link-hl"
            onClick={(e) => { e.preventDefault(); setView('racers-edge-home') }}
          >
            THE RACERS EDGE ⚡
          </a>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-style: italic;
          font-size: 0.98rem;
          letter-spacing: 0.05em;
          color: var(--gray2);
          text-transform: uppercase;
          text-decoration: none;
          padding: 0 1.1rem;
          height: 48px;
          display: flex;
          align-items: center;
          border-right: 1px solid rgba(255,255,255,0.06);
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-link:hover {
          background: var(--slate2);
          color: var(--yellow);
        }
        .nav-link-hl {
          background: #e41d13 !important;
          color: var(--white) !important;
          justify-content: center;
          text-align: center;
          min-width: fit-content;
          flex-shrink: 0;
          border-right: none;
        }
        .nav-link-hl:hover {
          background: #c81910 !important;
          color: var(--white) !important;
        }
      `}</style>
    </nav>
  )
}
