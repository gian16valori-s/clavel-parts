'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, getVendedorActual, type Vendedor } from '@/lib/vendedorAuth'
import { getProductosVendedorActual, type ProductoVendedorResumen } from '@/lib/vendedorProducts'

export default function PanelProductosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [productos, setProductos] = useState<ProductoVendedorResumen[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const session = await getSession()
        if (!session?.user) {
          router.replace('/login/vendedor')
          return
        }

        setUserEmail(session.user.email ?? '')

        const vendedorActual = await getVendedorActual()
        if (!vendedorActual) {
          setError('No estas habilitado como vendedor.')
          return
        }

        setVendedor(vendedorActual)

        const productsResult = await getProductosVendedorActual()
        if (productsResult.error) {
          setError(productsResult.error)
        }
        setProductos(productsResult.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus productos.')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div style={{ color: 'var(--gray2)' }}>Cargando tus productos...</div>
      </main>
    )
  }

  if (!vendedor) {
    return (
      <main className="min-h-screen px-4 py-10" style={{ background: 'var(--dark)' }}>
        <div className="max-w-3xl mx-auto rounded-xl border p-6" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
          <h1 className="font-condensed font-black italic uppercase mb-3" style={{ fontSize: '2rem', color: 'var(--yellow)' }}>
            Tus productos
          </h1>
          <p style={{ color: '#fecaca' }}>{error || 'No se pudo validar tu cuenta de vendedor.'}</p>
          <p className="mt-3 text-sm" style={{ color: 'var(--gray)' }}>Usuario: {userEmail || 'sin email'}</p>
          <button
            type="button"
            onClick={() => router.push('/panel')}
            className="mt-5 rounded-md px-4 py-2 font-condensed font-bold uppercase"
            style={{ background: 'var(--slate)', color: 'var(--white)' }}
          >
            Volver al panel
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'var(--dark)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="font-condensed font-black italic uppercase" style={{ fontSize: '2.2rem', color: 'var(--yellow)' }}>
              Tus productos
            </h1>
            <p style={{ color: 'var(--gray2)' }}>
              Lista completa para revisar y editar rapido.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/panel')}
              className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
              style={{ background: 'var(--slate)', color: 'var(--white)' }}
            >
              Volver al panel
            </button>
            <button
              type="button"
              onClick={() => router.push('/panel/vender')}
              className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
              style={{ background: 'var(--yellow)', color: 'var(--text-dark)' }}
            >
              Cargar nuevo
            </button>
          </div>
        </div>

        {error && (
          <div
            className="rounded-md px-4 py-3 mb-5"
            style={{ background: 'rgba(220,38,38,0.18)', color: '#fecaca' }}
          >
            {error}
          </div>
        )}

        <section className="rounded-xl border p-4 md:p-5" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
          <div className="mb-4 font-condensed font-bold uppercase" style={{ color: 'var(--yellow)' }}>
            {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </div>

          {productos.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>Todavia no cargaste productos.</p>
          ) : (
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
              <div className="flex flex-col gap-3">
                {productos.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border p-3 md:p-4"
                    style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-condensed font-extrabold uppercase" style={{ color: 'var(--white)', fontSize: '1.1rem' }}>
                          {item.nombre}
                        </div>
                        <div className="text-sm mt-1" style={{ color: 'var(--gray2)' }}>
                          {(item.marca_pieza || 'Sin marca')} · SKU: {item.sku}
                        </div>
                        <div className="text-sm mt-2" style={{ color: 'var(--gray)' }}>
                          Stock: {item.stock ?? 0} · Estado: {item.activo === false ? 'Pausado' : 'Activo'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:justify-end">
                        <div className="font-condensed font-black" style={{ color: 'var(--yellow)', fontSize: '1.35rem', minWidth: 95, textAlign: 'right' }}>
                          ${Number(item.precio ?? 0).toLocaleString('es-AR')}
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push('/panel/vender')}
                          className="rounded-md px-3 py-2 font-condensed font-bold uppercase"
                          style={{ background: 'var(--slate)', color: 'var(--white)' }}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
