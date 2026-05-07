'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAppStore } from '@/lib/cartStore'

const navLinks = [
  'ACEITES', 'NEUMÁTICOS', 'LLANTAS', 'FILTROS',
  'FRENOS', 'NOS',
]

const rightLinks = ['OFF ROAD Y OUTDOOR']

interface NavbarProps {
  isSticky?: boolean
  transparent?: boolean
}

export default function Navbar({ isSticky = true, transparent = false }: NavbarProps) {
  const { setView } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className={`${isSticky ? 'sticky' : transparent ? 'fixed' : ''} z-[350] flex items-center px-4 md:px-10 border-b-2 overflow-x-auto relative ${menuOpen ? 'navbar-mobile-open' : ''}`}
      style={{
        background: transparent ? 'rgba(0,0,0,0.55)' : '#000',
        backdropFilter: transparent ? 'blur(10px)' : undefined,
        top: (isSticky || transparent) ? 78 : undefined,
        left: transparent ? 0 : undefined,
        right: transparent ? 0 : undefined,
        height: 48,
        borderColor: transparent ? 'rgba(255,255,255,0.06)' : 'var(--dark)',
      }}
    >
      {/* Hamburger button — only visible on mobile */}
      <button
        className="navbar-hamburger items-center justify-center mr-3"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          padding: '4px',
          flexShrink: 0,
        }}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menú"
      >
        {menuOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={22} height={22}>
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={22} height={22}>
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        )}
      </button>

      {/* Login */}
      <Link
        href="/login"
        className="flex items-center gap-[0.4rem] pr-5 mr-2 transition-colors duration-200"
        style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.08em',
            color: '#fff',
          textTransform: 'uppercase',
          borderRight: '1px solid rgba(255,255,255,0.09)',
          textDecoration: 'none',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--yellow)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className="hidden md:inline">INICIAR SESIÓN</span>
      </Link>

      {/* Category links — hidden on mobile, shown via hamburger */}
      <div className="navbar-links flex items-center flex-1">
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
            THE RACER&apos;S EDGE
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
            color: #fff;
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
