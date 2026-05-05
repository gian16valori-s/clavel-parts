'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'linear-gradient(135deg, #141618 0%, #1c1f23 100%)' }}>
      <div className="w-full max-w-md rounded-xl p-6 border" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="font-condensed font-black italic uppercase" style={{ fontSize: '2rem', color: 'var(--yellow)' }}>
              Iniciar sesión
            </p>
            <p style={{ color: 'var(--gray2)', marginTop: '0.35rem' }}>
              Ingreso principal para usuario comprador.
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-condensed font-bold uppercase" style={{ color: 'var(--gray2)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="comprador@clavelparts.com"
              className="w-full rounded-md px-3 py-2 outline-none border"
              style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)' }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-condensed font-bold uppercase" style={{ color: 'var(--gray2)' }}>
              Contraseña
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-md px-3 py-2 outline-none border"
                style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-md px-3 py-2 font-condensed font-bold uppercase"
                style={{ background: 'var(--slate)', color: 'var(--white)' }}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ background: 'rgba(220,38,38,0.18)', color: '#fecaca' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-3 font-condensed font-black italic uppercase"
            style={{
              background: 'var(--yellow)',
              color: 'var(--text-dark)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR COMO COMPRADOR'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--dark4)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--gray2)' }}>
            ¿Sos vendedor?
          </p>
          <a
            href="/login/vendedor"
            className="block w-full rounded-md px-4 py-3 text-center font-condensed font-bold uppercase"
            style={{ background: 'var(--slate)', color: 'var(--white)' }}
          >
            Iniciar sesión como vendedor
          </a>
          <div className="mt-4 text-center">
            <a
              href="/solicitar-vendedor"
              className="text-sm underline font-condensed font-bold"
              style={{ color: 'var(--yellow)' }}
            >
              Quiero ser vendedor
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
