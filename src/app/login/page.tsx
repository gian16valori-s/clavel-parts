'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Si ya hay sesión, mandamos al home directo
  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session?.user) router.replace('/')
    })
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      setGoogleLoading(true)
      setError('')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      })
      if (error) setError(error.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{ background: 'linear-gradient(135deg, #141618 0%, #1c1f23 100%)' }}
    >
      {/* Volver */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="absolute top-5 left-5 flex items-center gap-2 rounded-md px-3 py-2 font-condensed font-bold uppercase text-sm transition-colors"
        style={{
          background: 'transparent',
          color: 'var(--gray2)',
          border: '1px solid var(--dark4)',
          letterSpacing: '0.06em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--white)'
          e.currentTarget.style.borderColor = 'var(--gray)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--gray2)'
          e.currentTarget.style.borderColor = 'var(--dark4)'
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>&larr;</span>
        Volver
      </button>

      <div
        className="w-full max-w-md rounded-xl p-7 border"
        style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}
      >
        <h1
          className="font-condensed font-black italic uppercase mb-1"
          style={{ fontSize: '2rem', color: 'var(--yellow)', letterSpacing: '0.04em' }}
        >
          ¡Hola de nuevo!
        </h1>
        <p style={{ color: 'var(--gray2)', marginBottom: '1.6rem' }}>
          Iniciá sesión para acceder a tu garage y vender tus repuestos.
        </p>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 rounded-md px-4 py-3 font-condensed font-bold uppercase mb-4 transition-colors"
          style={{
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            letterSpacing: '0.05em',
            cursor: googleLoading ? 'wait' : 'pointer',
            opacity: googleLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.background = '#f5f5f5' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
        >
          {/* Google G */}
          <svg viewBox="0 0 48 48" style={{ width: 20, height: 20 }}>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.4-4.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 45.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.4-4.6 2.3-7.5 2.3-5.3 0-9.8-3.3-11.3-8L6 33.7C9.3 41 16.1 45.5 24 45.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.5c-.5.5 7-5.2 7-14.2 0-1.5-.2-3-.4-4.5z"/>
          </svg>
          {googleLoading ? 'Conectando…' : 'Continuar con Google'}
        </button>

        {/* separador */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--dark4)' }} />
          <span className="text-xs uppercase" style={{ color: 'var(--gray)', letterSpacing: '0.1em' }}>ó</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--dark4)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-condensed font-bold uppercase text-sm" style={{ color: 'var(--gray2)', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-md px-3 py-2 outline-none border"
              style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)' }}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-2 font-condensed font-bold uppercase text-sm" style={{ color: 'var(--gray2)', letterSpacing: '0.05em' }}>
              Contraseña
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md px-3 py-2 outline-none border"
                style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-md px-3 py-2 font-condensed font-bold uppercase text-sm"
                style={{ background: 'var(--slate)', color: 'var(--white)' }}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <div className="mb-5 text-right">
            <a href="#" className="text-sm hover:underline" style={{ color: 'var(--gray2)' }}>
              Olvidé mi contraseña
            </a>
          </div>

          {error && (
            <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ background: 'rgba(220,38,38,0.18)', color: '#fecaca' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-3 font-condensed font-black italic uppercase transition-transform"
            style={{
              background: 'var(--yellow)',
              color: 'var(--text-dark)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
              letterSpacing: '0.06em',
              fontSize: '1.05rem',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
          >
            {loading ? 'INGRESANDO…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t text-center text-sm" style={{ borderColor: 'var(--dark4)' }}>
          <span style={{ color: 'var(--gray2)' }}>¿No tenés cuenta? </span>
          <Link href="/registro" style={{ color: 'var(--yellow)', fontWeight: 700 }} className="hover:underline">
            Registrate acá
          </Link>
        </div>
      </div>
    </main>
  )
}
