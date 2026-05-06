'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/cartStore'
import { fetchProductDetail, type ProductDetail } from '@/lib/productDetails'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'

export default function DetalleProductoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useAppStore()
  const id = params?.id ?? ''
  const [producto, setProducto] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [imagenActiva, setImagenActiva] = useState(0)

  useEffect(() => {
    let cancelled = false

    setLoading(true)

    fetchProductDetail(id).then((data) => {
      if (cancelled) return
      setProducto(data)
      setImagenActiva(0)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Cargando producto...</div>
  if (!producto) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Producto no encontrado</div>

  function handleAddToCart() {
    addToCart({
      id: producto.id,
      name: producto.name,
      brand: producto.brand,
      ref: producto.ref,
      price: producto.price,
      seller: producto.seller,
      sellerRating: 5,
      delivery: producto.stock > 0 ? '2-4' : 'a consultar',
      category: producto.group,
      image: producto.images[0],
    })
  }

  return (
    <>
      <Topbar isSticky={false} />
      <Navbar isSticky={false} />

      <main className="min-h-screen px-4 py-8" style={{ background: 'linear-gradient(180deg, #f6f7fb 0%, #edf0f6 100%)' }}>
        <div className="mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 rounded-md px-4 py-2 font-bold uppercase"
          style={{ background: '#111827', color: '#fff' }}
        >
          Volver
        </button>

        <div className="grid gap-6 rounded-2xl border bg-white p-5 md:grid-cols-[1.1fr_0.9fr] md:p-8" style={{ borderColor: '#dbe2ea', boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
          <section>
            <div className="mb-4 flex min-h-[420px] items-center justify-center rounded-2xl border" style={{ borderColor: '#e5e7eb', background: '#f8fafc' }}>
              <img
                src={producto.images[imagenActiva]}
                alt={producto.name}
                style={{ width: '100%', maxHeight: 520, objectFit: 'contain', borderRadius: 16 }}
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {producto.images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImagenActiva(index)}
                  className="shrink-0 overflow-hidden rounded-xl border"
                  style={{
                    width: 92,
                    height: 92,
                    borderColor: index === imagenActiva ? '#2563eb' : '#d1d5db',
                    background: '#fff',
                  }}
                >
                  <img src={img} alt={`${producto.name} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: '#64748b' }}>
                {producto.brand}
              </div>
              <h1 className="mb-3 text-3xl font-black" style={{ color: '#0f172a', lineHeight: 1.05 }}>
                {producto.name}
              </h1>
              <div className="mb-4 text-sm" style={{ color: '#475569' }}>
                SKU: {producto.sku} · OEM: {producto.ref} · Stock: {producto.stock}
              </div>

              <div className="mb-5 text-4xl font-black" style={{ color: '#111827' }}>
                ${producto.price.toLocaleString('es-AR')}
              </div>
              <div className="flex flex-col gap-3 mb-6">
                <button
                  type="button"
                  className="rounded-xl px-6 py-4 font-bold uppercase"
                  style={{ background: '#1d4ed8', color: '#fff' }}
                  onClick={handleAddToCart}
                >
                  Comprar ahora
                </button>
                <button
                  type="button"
                  className="rounded-xl px-6 py-4 font-bold uppercase"
                  style={{ background: '#facc15', color: '#111827' }}
                  onClick={handleAddToCart}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: '#dbe2ea', background: '#f8fafc' }}>
              <div className="mb-2 text-sm font-bold uppercase" style={{ color: '#334155' }}>
                Descripción
              </div>
              <p style={{ color: '#334155', lineHeight: 1.6 }}>{producto.description}</p>
            </div>

            {producto.attributes.length > 0 && (
              <div className="rounded-2xl border p-4" style={{ borderColor: '#dbe2ea', background: '#fff' }}>
                <div className="mb-3 text-sm font-bold uppercase" style={{ color: '#334155' }}>
                  Ficha técnica
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {producto.attributes.map((attribute) => (
                    <div key={`${attribute.label}-${attribute.value}`} className="rounded-xl border p-3" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                      <div className="text-xs font-bold uppercase" style={{ color: '#64748b' }}>
                        {attribute.label}
                      </div>
                      <div style={{ color: '#0f172a', marginTop: 4 }}>{attribute.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {producto.compatibility.length > 0 && (
              <div className="rounded-2xl border p-4" style={{ borderColor: '#dbe2ea', background: '#fff' }}>
                <div className="mb-3 text-sm font-bold uppercase" style={{ color: '#334155' }}>
                  Compatibilidades
                </div>
                <div className="flex flex-col gap-2">
                  {producto.compatibility.map((item) => (
                    <div key={item.label} className="rounded-xl border px-3 py-2" style={{ borderColor: '#e2e8f0', color: '#334155', background: '#f8fafc' }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>
        </div>
        </div>
      </main>
    </>
  )
}

