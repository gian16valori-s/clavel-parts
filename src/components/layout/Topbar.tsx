'use client'

import { useAppStore } from '@/lib/cartStore'

interface TopbarProps {
  isSticky?: boolean
  currentView?: string
}

export default function Topbar({ isSticky = true, currentView }: TopbarProps) {
  const { cartCount, setView } = useAppStore()
  const count = cartCount()

  return (
    <header
      className={`${currentView === 'garage' ? 'fixed top-0 left-0 right-0' : isSticky ? 'sticky top-0' : ''} z-[350] flex items-center justify-between px-4 md:px-10 border-b-2`}
      style={{
        background: currentView === 'garage' ? 'rgba(8,10,12,0.65)' : 'var(--dark2)',
        backdropFilter: currentView === 'garage' ? 'blur(12px)' : undefined,
        borderColor: currentView === 'garage' ? 'rgba(255,255,255,0.06)' : 'var(--dark3)',
        height: 78,
      }}
    >
      {/* Logo */}
      <div
        className="font-condensed font-black italic uppercase text-white leading-none cursor-pointer"
        style={{ fontSize: 'clamp(1.6rem, 5vw, 2.7rem)', letterSpacing: '0.02em' }}
        onClick={() => setView('home')}
      >
        {currentView === 'garage'
          ? <>MI <span style={{ color: 'var(--yellow)' }}>GARAGE</span></>
          : <>CLAVEL<span style={{ color: 'var(--yellow)' }}>PARTS</span></>}
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-2">
        <button
          className="topbar-icon"
          style={{ color: 'var(--gray2)' }}
          onClick={() => setView(currentView === 'garage' ? 'home' : 'garage')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[22px] h-[22px]">
            {currentView === 'garage' ? (
              <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
            ) : (
              <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
            )}
          </svg>
          <span className="topbar-label">{currentView === 'garage' ? 'HOME' : 'MI GARAGE'}</span>
        </button>

        <button
          className="topbar-icon relative"
          style={{ color: 'var(--gray2)' }}
          onClick={() => count > 0 && setView('cart')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[22px] h-[22px]">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          <span className="topbar-label">CARRITO</span>
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full text-white text-[0.65rem] font-bold flex items-center justify-center border-2"
              style={{ background: '#e53e3e', borderColor: 'var(--dark)' }}
            >
              {count}
            </span>
          )}
        </button>
      </div>

      <style jsx>{`
        .topbar-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
        }
        .topbar-icon:hover {
          background: var(--dark3);
          color: var(--yellow) !important;
        }
      `}</style>
    </header>
  )
}
