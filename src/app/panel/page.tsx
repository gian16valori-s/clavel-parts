'use client'


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getVendedorActual, logoutVendedor, type Vendedor } from '@/lib/vendedorAuth';
import { getProductosVendedorActual, type ProductoVendedorResumen } from '@/lib/vendedorProducts';
import ProductForm from '@/components/vendedor/ProductForm';

// Quitar lógica y estado del formulario anterior

export default function PanelVendedorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('');
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [productos, setProductos] = useState<ProductoVendedorResumen[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadPanel = async () => {
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
        setVendedor(vendedorActual)

        if (vendedorActual) {
          const productsResult = await getProductosVendedorActual()
          if (productsResult.error) {
            setError(productsResult.error)
          }
          setProductos(productsResult.data)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'No se pudo cargar el panel.')
      } finally {
        setLoading(false)
      }
    }

    void loadPanel()
  }, [router])

  async function handleLogout() {
    await logoutVendedor()
    router.replace('/login/vendedor')
  }


  // Quitar updateField y handleSubmit, el formulario ahora es ProductForm

  const nombreVendedor =
    vendedor?.nombre_comercial || vendedor?.nombre || vendedor?.razon_social || 'Vendedor'
  const productosActivos = productos.filter((item) => item.activo !== false).length
  const stockTotal = productos.reduce((acc, item) => acc + Number(item.stock ?? 0), 0)
  const productosPreview = productos.slice(0, 3)

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div style={{ color: 'var(--gray2)' }}>Cargando panel vendedor...</div>
      </main>
    )
  }

  if (!vendedor) {
    return (
      <main className="min-h-screen px-4 py-10" style={{ background: 'var(--dark)' }}>
        <div className="max-w-2xl mx-auto rounded-xl border p-6" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
          <h1 className="font-condensed font-black italic uppercase mb-3" style={{ fontSize: '2rem', color: 'var(--yellow)' }}>
            Panel vendedor
          </h1>
          <p className="mb-2" style={{ color: 'var(--gray2)' }}>
            No estás habilitado como vendedor.
          </p>
          <p className="mb-6 text-sm" style={{ color: 'var(--gray)' }}>
            Usuario actual: {userEmail || 'sin email'}
          </p>
          <button
            onClick={handleLogout}
            className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
            style={{ background: 'var(--slate)', color: 'var(--white)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'var(--dark)' }}>
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-condensed font-black italic uppercase" style={{ fontSize: '2.2rem', color: 'var(--yellow)' }}>
              Bienvenido, {nombreVendedor}
            </h1>
            <p style={{ color: 'var(--gray2)' }}>{userEmail}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/panel/vender')}
              className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
              style={{ background: 'var(--yellow)', color: 'var(--text-dark)' }}
            >
              Vender
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
              style={{ background: 'var(--slate)', color: 'var(--white)' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {(error || success) && (
          <div
            className="rounded-md px-4 py-3 mb-6"
            style={{
              background: error ? 'rgba(220,38,38,0.18)' : 'rgba(34,197,94,0.16)',
              color: error ? '#fecaca' : '#bbf7d0',
            }}
          >
            {error || success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Aquí puedes agregar más gestiones del vendedor, menú, etc. */}
          <aside className="rounded-xl border p-5" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
            <h2 className="font-condensed font-extrabold uppercase mb-4" style={{ fontSize: '1.35rem', color: 'var(--white)' }}>
              Datos del vendedor
            </h2>

            <div className="space-y-2 text-sm" style={{ color: 'var(--gray2)' }}>
              <p><strong>ID vendedor:</strong> {vendedor.id}</p>
              <p><strong>Auth user:</strong> {vendedor.auth_user_id}</p>
              <p><strong>Nombre:</strong> {nombreVendedor}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-condensed font-bold uppercase mb-3" style={{ color: 'var(--yellow)' }}>
                Resumen del catálogo
              </h3>

              <div className="grid gap-3">
                <div className="rounded-md px-3 py-3 border" style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)' }}>
                  <div className="text-sm" style={{ color: 'var(--gray)' }}>Productos cargados</div>
                  <div className="font-condensed font-extrabold" style={{ color: 'var(--white)', fontSize: '1.3rem' }}>{productos.length}</div>
                </div>
                <div className="rounded-md px-3 py-3 border" style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)' }}>
                  <div className="text-sm" style={{ color: 'var(--gray)' }}>Productos activos</div>
                  <div className="font-condensed font-extrabold" style={{ color: 'var(--white)', fontSize: '1.3rem' }}>{productosActivos}</div>
                </div>
                <div className="rounded-md px-3 py-3 border" style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)' }}>
                  <div className="text-sm" style={{ color: 'var(--gray)' }}>Stock total</div>
                  <div className="font-condensed font-extrabold" style={{ color: 'var(--white)', fontSize: '1.3rem' }}>{stockTotal}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-xl border p-5 mt-6" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-condensed font-extrabold uppercase" style={{ fontSize: '1.35rem', color: 'var(--white)' }}>
                Tus productos
              </h2>
              <p style={{ color: 'var(--gray)' }}>
                Vista resumida de tus productos más recientes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-condensed font-bold uppercase" style={{ color: 'var(--yellow)' }}>
                {productos.length} item{productos.length !== 1 ? 's' : ''}
              </div>
              {productos.length > 3 && (
                <button
                  type="button"
                  onClick={() => router.push('/panel/productos')}
                  className="rounded-md px-3 py-2 font-condensed font-bold uppercase"
                  style={{ background: 'var(--yellow)', color: 'var(--text-dark)' }}
                >
                  Ver más
                </button>
              )}
            </div>
          </div>

          {productos.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>Todavía no cargaste productos.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {productosPreview.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border"
                  style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)' }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ height: 150, background: '#11161b' }}
                  >
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="font-condensed font-bold uppercase" style={{ color: 'var(--gray)' }}>
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2 font-condensed font-black uppercase" style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: 1.1 }}>
                      {item.nombre}
                    </div>

                    <div className="mb-3 text-sm" style={{ color: 'var(--gray2)' }}>
                      {(item.marca_pieza || 'Sin marca')} · SKU: {item.sku}
                    </div>

                    <div className="mb-3 flex items-center justify-between text-sm" style={{ color: 'var(--gray)' }}>
                      <span>Stock: {item.stock ?? 0}</span>
                      <span style={{ color: item.activo === false ? '#fca5a5' : '#86efac' }}>
                        {item.activo === false ? 'Pausado' : 'Activo'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-condensed font-black" style={{ color: 'var(--yellow)', fontSize: '1.35rem' }}>
                        ${Number(item.precio ?? 0).toLocaleString('es-AR')}
                      </div>
                      <button
                        type="button"
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
          )}
        </section>
      </div>
    </main>
  )
}
