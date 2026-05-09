'use client'

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
      className="sticky z-[299] flex items-center px-10 border-b-2"
      style={{ background: 'var(--slate)', top: 78, height: 48, borderColor: 'var(--dark)' }}
    >
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
            onClick={(e) => { e.preventDefault(); setView('racers-edge') }}
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
          min-width: 182px;
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
