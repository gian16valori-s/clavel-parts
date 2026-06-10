'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/cartStore'
import { fetchProductDetail, type ProductDetail } from '@/lib/productDetails'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'

type CompatibilityGroup = {
  brand: string
  items: string[]
}

function groupCompatibilityByBrand(items: ProductDetail['compatibility']): CompatibilityGroup[] {
  const map = new Map<string, string[]>()

  items.forEach((entry) => {
    const label = entry.label?.trim()
    if (!label) return

    const vehiclePart = label.split(' - ')[0] || label
    const brand = vehiclePart.split(' ')[0] || 'Otros'

    const existing = map.get(brand) ?? []
    existing.push(label)
    map.set(brand, existing)
  })

  return Array.from(map.entries()).map(([brand, groupedItems]) => ({
    brand,
    items: groupedItems,
  }))
}

export default function DetalleProductoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useAppStore()
  const id = params?.id ?? ''
  const [producto, setProducto] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [imagenActiva, setImagenActiva] = useState(0)
  const [compatExpanded, setCompatExpanded] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const sellerTestimonials = [
    'Llego en tiempo y forma, pieza original y bien embalada.',
    'Excelente atencion. Me ayudaron a confirmar compatibilidad antes de comprar.',
    'Producto tal cual la publicacion. Volveria a comprar sin dudar.',
  ]

  useEffect(() => {
    let cancelled = false

    setLoading(true)

    fetchProductDetail(id).then((data) => {
      if (cancelled) return
      setProducto(data)
      setImagenActiva(0)
      setCompatExpanded(false)
      setZoomOpen(false)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Cargando producto...</div>
  if (!producto) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Producto no encontrado</div>

  const compatibilityGroups = groupCompatibilityByBrand(producto.compatibility)

  function handleAddToCart() {
    if (!producto) return
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

  function handleBuyNow() {
    handleAddToCart()
  }

  return (
    <>
      <Topbar isSticky={false} />
      <Navbar isSticky={false} />

      <main className="min-h-screen px-4 py-8" style={{ background: 'linear-gradient(180deg, #f6f7fb 0%, #edf0f6 100%)' }}>
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.1em]" style={{ color: '#64748b' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md px-3 py-2 font-bold transition-colors"
              style={{ background: '#111827', color: '#fff' }}
            >
              Volver
            </button>
            <span>Catálogo</span>
            <span>•</span>
            <span>{producto.group}</span>
            <span>•</span>
            <span>{producto.subgroup}</span>
          </div>

          <div
            className="grid gap-6 rounded-2xl border bg-white p-4 md:grid-cols-[1.1fr_0.9fr] md:p-8"
            style={{ borderColor: '#dbe2ea', boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}
          >
            <section>
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="mb-3 flex w-full items-center justify-center overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: '#e5e7eb' }}
                aria-label="Ver imagen ampliada"
              >
                <img
                  src={producto.images[imagenActiva]}
                  alt={producto.name}
                  className="w-full object-contain"
                  style={{ maxHeight: 'min(52vh, 520px)' }}
                />
              </button>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {producto.images.map((img, index) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setImagenActiva(index)}
                    className="shrink-0 overflow-hidden rounded-xl border bg-white"
                    style={{
                      width: 84,
                      height: 84,
                      borderColor: index === imagenActiva ? '#FFD700' : '#d1d5db',
                    }}
                    aria-label={`Seleccionar imagen ${index + 1}`}
                  >
                    <img src={img} alt={`${producto.name} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border bg-white p-4" style={{ borderColor: '#dbe2ea' }}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-black uppercase tracking-[0.05em]" style={{ color: '#0f172a' }}>
                      {producto.seller}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.08em]" style={{ color: '#64748b' }}>
                      vendedor verificado
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: '#111827' }}>4.8/5</div>
                    <div className="text-sm" style={{ color: '#FFD700' }}>★★★★★</div>
                  </div>
                </div>

                <div className="border-t pt-3" style={{ borderColor: '#e2e8f0' }}>
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em]" style={{ color: '#475569' }}>
                    Opiniones recientes
                  </div>
                  <div className="space-y-2">
                    {sellerTestimonials.map((comment) => (
                      <div key={comment} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm" style={{ borderColor: '#e2e8f0', color: '#334155' }}>
                        {comment}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: '#64748b' }}>
                  {producto.brand}
                </div>
                <h1 className="mb-3 text-2xl font-black md:text-4xl" style={{ color: '#0f172a', lineHeight: 1.08 }}>
                  {producto.name}
                </h1>

                <div className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: '#6b7280' }}>
                  SKU {producto.sku}
                </div>
                <div className="mb-4 text-xs uppercase tracking-[0.12em]" style={{ color: '#6b7280' }}>
                  OEM {producto.ref}
                </div>

                <div className="mb-1 text-3xl font-black md:text-4xl" style={{ color: '#111827' }}>
                  ${producto.price.toLocaleString('es-AR')}
                </div>
                <div className="mb-4 text-sm" style={{ color: '#475569' }}>
                  Stock disponible: {producto.stock} · Envio estimado: 2-4 dias
                </div>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="rounded-xl px-6 py-4 font-bold uppercase tracking-[0.06em] transition-all"
                    style={{ background: '#FFD700', color: '#111827' }}
                    onClick={handleBuyNow}
                  >
                    Comprar ahora
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border px-6 py-4 font-bold uppercase tracking-[0.06em] transition-colors"
                    style={{ borderColor: '#111827', color: '#111827', background: '#fff' }}
                    onClick={handleAddToCart}
                  >
                    Agregar al carrito
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-12">
                  <div className="rounded-xl border bg-white px-3 py-3 md:col-span-3" style={{ borderColor: '#e2e8f0' }}>
                    <div className="mb-1 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#FFD700" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 3l7 3v6c0 4.4-3 8.5-7 9-4-.5-7-4.6-7-9V6l7-3z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      <div className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#0f172a' }}>Verificado</div>
                    </div>
                    <div className="text-[11px]" style={{ color: '#64748b' }}>Identidad confirmada</div>
                  </div>

                  <div className="grid gap-3 md:col-span-9 md:grid-cols-2">
                    <div className="rounded-xl border bg-white px-5 py-4" style={{ borderColor: '#e2e8f0' }}>
                      <div className="mb-1 flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#FFD700" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V8a4 4 0 118 0v3" />
                        </svg>
                        <div className="text-sm font-bold" style={{ color: '#0f172a' }}>Pago Seguro</div>
                      </div>
                      <div className="text-xs" style={{ color: '#64748b' }}>Encriptacion SSL</div>
                    </div>

                    <div className="rounded-xl border bg-white px-5 py-4" style={{ borderColor: '#e2e8f0' }}>
                      <div className="mb-1 flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#FFD700" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M4 13a8 8 0 0116 0" />
                          <rect x="3" y="13" width="4" height="7" rx="1" />
                          <rect x="17" y="13" width="4" height="7" rx="1" />
                          <path d="M12 20h3" />
                        </svg>
                        <div className="text-sm font-bold" style={{ color: '#0f172a' }}>Soporte Postventa</div>
                      </div>
                      <div className="text-xs" style={{ color: '#64748b' }}>30 dias de garantia</div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="rounded-2xl border p-4" style={{ borderColor: '#dbe2ea', background: '#f8fafc' }}>
                <div className="mb-2 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: '#334155' }}>
                  Descripcion
                </div>
                <p style={{ color: '#334155', lineHeight: 1.7 }}>{producto.description}</p>
              </div>

              {producto.attributes.length > 0 && (
                <div className="overflow-hidden rounded-2xl border" style={{ borderColor: '#dbe2ea', background: '#fff' }}>
                  <div className="border-b px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: '#334155', borderColor: '#e2e8f0' }}>
                    Ficha tecnica
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {producto.attributes.map((attribute) => (
                        <tr key={`${attribute.label}-${attribute.value}`} className="border-b last:border-b-0" style={{ borderColor: '#edf2f7' }}>
                          <td className="w-[38%] px-4 py-3 font-semibold uppercase tracking-[0.06em]" style={{ color: '#64748b', background: '#f8fafc' }}>
                            {attribute.label}
                          </td>
                          <td className="px-4 py-3" style={{ color: '#0f172a' }}>
                            {attribute.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {compatibilityGroups.length > 0 && (
                <div className="rounded-2xl border p-4" style={{ borderColor: '#dbe2ea', background: '#fff' }}>
                  <div className="mb-3 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: '#334155' }}>
                    Compatibilidades
                  </div>
                  <div className="flex flex-col gap-3">
                    {compatibilityGroups.map((group) => {
                      const visibleItems = compatExpanded ? group.items : group.items.slice(0, 4)
                      return (
                        <div key={group.brand}>
                          <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em]" style={{ color: '#64748b' }}>
                            {group.brand}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {visibleItems.map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                                style={{ borderColor: '#cbd5e1', color: '#334155', background: '#f8fafc' }}
                              >
                                <span aria-hidden>🚗</span>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {producto.compatibility.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setCompatExpanded((current) => !current)}
                      className="mt-4 text-sm font-bold uppercase tracking-[0.06em]"
                      style={{ color: '#111827' }}
                    >
                      {compatExpanded ? 'Ver menos' : 'Ver mas'}
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-[450] border-t bg-white p-3 md:hidden" style={{ borderColor: '#dbe2ea' }}>
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs uppercase tracking-[0.08em]" style={{ color: '#64748b' }}>{producto.brand}</div>
                <div className="text-lg font-black" style={{ color: '#111827' }}>${producto.price.toLocaleString('es-AR')}</div>
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                className="rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-[0.06em]"
                style={{ background: '#FFD700', color: '#111827' }}
              >
                Comprar
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-[0.06em]"
                style={{ borderColor: '#111827', color: '#111827' }}
              >
                Carrito
              </button>
            </div>
          </div>

          {zoomOpen && (
            <div
              className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 p-4"
              onClick={() => setZoomOpen(false)}
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-md px-3 py-2 text-sm font-bold uppercase"
                style={{ background: '#fff', color: '#111827' }}
                onClick={() => setZoomOpen(false)}
              >
                Cerrar
              </button>
              <img
                src={producto.images[imagenActiva]}
                alt={`${producto.name} ampliada`}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          )}
        </div>
      </main>
    </>
  )
}

