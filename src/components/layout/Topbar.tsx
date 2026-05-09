'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { useAppStore } from '@/lib/cartStore'
import { supabase } from '@/lib/supabaseClient'

export default function Topbar() {
  const router = useRouter()
  const { cartCount, setView } = useAppStore()
  const count = cartCount()

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Auth state subscription
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Cerrar dropdown al click afuera
  useEffect(() => {
    if (!menuOpen) return
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  const isAuthed = !!user
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Usuario'
  const initial = (displayName[0] || user?.email?.[0] || 'U').toUpperCase()

  function handleGarageClick() {
    if (!isAuthed) {
      router.push('/login')
      return
    }
    setView('garage')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    setUser(null)
    router.push('/')
  }

  return (
    <header
      className="sticky top-0 z-[300] flex items-center justify-between px-10 border-b-2"
      style={{ background: 'var(--dark2)', borderColor: 'var(--dark3)', height: 78 }}
    >
      {/* Logo */}
      <div
        className="font-condensed font-black italic uppercase text-white leading-none cursor-pointer"
        style={{ fontSize: '2.7rem', letterSpacing: '0.02em' }}
        onClick={() => setView('home')}
      >
        CLAVEL<span style={{ color: 'var(--yellow)' }}>PARTS</span>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-2">
        {/* Vender tu repuesto — solo logueado, a la izquierda de Mi Garage */}
        {isAuthed && (
          <Link
            href="/panel/vender"
            className="vender-btn"
            title="Cargar un repuesto para vender"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[18px] h-[18px]">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            VENDER TU REPUESTO
          </Link>
        )}

        {/* Mi Garage — bloqueado sin sesión */}
        <button
          className="topbar-icon"
          style={{
            color: isAuthed ? 'var(--gray2)' : 'var(--gray)',
            opacity: isAuthed ? 1 : 0.45,
            cursor: isAuthed ? 'pointer' : 'not-allowed',
          }}
          onClick={handleGarageClick}
          title={isAuthed ? 'Tu garage' : 'Iniciá sesión para ver tu garage'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[22px] h-[22px]">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          MI GARAGE
          {!isAuthed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, marginLeft: 2 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          )}
        </button>

        {/* Carrito */}
        <button
          className="topbar-icon relative"
          style={{ color: 'var(--gray2)' }}
          onClick={() => count > 0 && setView('cart')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[22px] h-[22px]">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          CARRITO
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full text-white text-[0.65rem] font-bold flex items-center justify-center border-2"
              style={{ background: '#e53e3e', borderColor: 'var(--dark)' }}
            >
              {count}
            </span>
          )}
        </button>

        {/* Avatar / Iniciar sesión */}
        {authLoading ? (
          <div style={{ width: 36, height: 36 }} />
        ) : isAuthed ? (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="avatar-btn"
              title={displayName}
            >
              <span className="avatar-circle">{initial}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: 'var(--gray2)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="user-menu"
                style={{
                  background: 'var(--dark2)',
                  borderColor: 'var(--dark4)',
                }}
              >
                {/* Header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: 'var(--dark4)' }}>
                  <span className="avatar-circle" style={{ width: 38, height: 38, fontSize: '1rem' }}>{initial}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="font-condensed font-extrabold" style={{ color: 'var(--white)', lineHeight: 1.1 }}>
                      {displayName}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--gray2)' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <Link href="/panel" onClick={() => setMenuOpen(false)} className="user-menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mi cuenta
                </Link>
                <Link href="/panel" onClick={() => setMenuOpen(false)} className="user-menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                  </svg>
                  Panel de vendedor
                </Link>
                <button type="button" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                  Configuración
                </button>
                <button type="button" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Ayuda
                </button>

                <div className="border-t my-1" style={{ borderColor: 'var(--dark4)' }} />

                <button className="user-menu-item user-menu-logout" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="topbar-icon"
            style={{ color: 'var(--gray2)' }}
            onClick={() => router.push('/login')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[22px] h-[22px]">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            INICIAR SESIÓN
          </button>
        )}
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
        .topbar-icon:hover:not(:disabled) {
          background: var(--dark3);
          color: var(--yellow) !important;
        }

        :global(.vender-btn) {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-style: italic;
          font-size: 0.92rem;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          text-decoration: none;
          line-height: 1;
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          background: var(--yellow);
          color: var(--text-dark);
          margin-right: 0.4rem;
          box-shadow: 0 2px 10px rgba(240,224,64,0.25);
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
          white-space: nowrap;
        }
        :global(.vender-btn:hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(240,224,64,0.4);
          background: #fff060;
          color: var(--text-dark);
        }
        :global(.vender-btn:visited) {
          color: var(--text-dark);
        }

        .avatar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 4px 8px 4px 4px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s;
          margin-left: 4px;
        }
        .avatar-btn:hover {
          background: var(--dark3);
        }

        :global(.avatar-circle) {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--slate);
          color: var(--yellow);
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--dark4);
          flex-shrink: 0;
        }

        .user-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          border: 1px solid;
          border-radius: 10px;
          padding: 4px 0;
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
          z-index: 400;
          overflow: hidden;
        }
        :global(.user-menu-item) {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: none;
          border: none;
          color: var(--gray2);
          padding: 10px 14px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.92rem;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          box-sizing: border-box;
          line-height: 1.2;
        }
        :global(.user-menu-item:hover) {
          background: var(--dark3);
          color: var(--white);
        }
        :global(.user-menu-item:visited) {
          color: var(--gray2);
        }
        :global(.user-menu-item svg) {
          flex-shrink: 0;
        }
        :global(.user-menu-logout) {
          color: #f87171;
        }
        :global(.user-menu-logout:hover) {
          background: rgba(220,38,38,0.12);
          color: #fca5a5;
        }
      `}</style>
    </header>
  )
}
