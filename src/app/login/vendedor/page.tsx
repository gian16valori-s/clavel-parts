'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, loginVendedor } from '@/lib/vendedorAuth'
import AuthTopbar from '@/components/layout/AuthTopbar'

export default function LoginVendedorPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session?.user) {
        router.replace('/panel')
      }
    }

    void checkSession()
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const result = await loginVendedor(email, password)
      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/panel')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #141618 0%, #1c1f23 100%)' }}>
      <AuthTopbar backFallback="/login" />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl p-6 border"
        style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}
      >
        <div className="mb-6">
          <p className="font-condensed font-black italic uppercase" style={{ fontSize: '2rem', color: 'var(--yellow)' }}>
            Acceso vendedor
          </p>
          <p style={{ color: 'var(--gray2)', marginTop: '0.35rem' }}>
            Ingresá con tu email y contraseña para administrar tus productos.
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
            placeholder="vendedor@clavelparts.com"
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
          {loading ? 'INGRESANDO...' : 'INGRESAR COMO VENDEDOR'}
        </button>

        <a
          href="/login"
          className="block mt-4 text-center text-sm underline"
          style={{ color: 'var(--gray2)' }}
        >
          Volver al ingreso principal
        </a>
      </form>
      </main>
    </div>
  )
}
