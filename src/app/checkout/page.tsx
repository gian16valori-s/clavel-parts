'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/cartStore'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useAppStore()
  const total = cartTotal()

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    cp: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    clearCart()
  }

  if (submitted) {
    return (
      <>
        <Topbar isSticky={false} />
        <Navbar isSticky={false} />
        <main
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: 'linear-gradient(180deg, #f6f7fb 0%, #edf0f6 100%)' }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mb-4 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#FFD700' }}>
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#111827" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-black" style={{ color: '#111827' }}>
              ¡Pedido confirmado!
            </h2>
            <p className="mb-6 text-sm" style={{ color: '#64748b' }}>
              Recibimos tu pedido. En breve te contactamos al email ingresado para coordinar el pago y el envío.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-xl py-3 font-bold uppercase tracking-[0.06em] text-sm"
              style={{ background: '#111827', color: '#fff' }}
            >
              Volver al inicio
            </button>
          </div>
        </main>
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <>
        <Topbar isSticky={false} />
        <Navbar isSticky={false} />
        <main
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: 'linear-gradient(180deg, #f6f7fb 0%, #edf0f6 100%)' }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="mb-4 text-sm" style={{ color: '#64748b' }}>No hay productos en tu carrito.</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl px-6 py-3 font-bold uppercase tracking-[0.06em] text-sm"
              style={{ background: '#111827', color: '#fff' }}
            >
              Volver
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Topbar isSticky={false} />
      <Navbar isSticky={false} />

      <main
        className="min-h-screen px-4 py-10"
        style={{ background: 'linear-gradient(180deg, #f6f7fb 0%, #edf0f6 100%)' }}
      >
        <div className="mx-auto w-full max-w-5xl">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em]" style={{ color: '#64748b' }}>
            <button type="button" onClick={() => router.back()} style={{ color: '#64748b' }}>
              ← Volver
            </button>
            <span>/</span>
            <span style={{ color: '#111827' }}>Checkout</span>
          </div>

          {/* Steps indicator */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black" style={{ background: '#FFD700', color: '#111827' }}>1</span>
              <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: '#111827' }}>Confirmación</span>
            </div>
            <div className="h-px flex-1" style={{ background: '#cbd5e1' }} />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black" style={{ background: '#FFD700', color: '#111827' }}>2</span>
              <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: '#111827' }}>Datos de envío</span>
            </div>
            <div className="h-px flex-1" style={{ background: '#cbd5e1' }} />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black" style={{ borderColor: '#cbd5e1', color: '#94a3b8' }}>3</span>
              <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: '#94a3b8' }}>Pago</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Datos personales */}
              <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#dbe2ea' }}>
                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.1em]" style={{ color: '#111827' }}>
                  Datos de contacto
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Nombre completo
                    </label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Juan García"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Teléfono
                    </label>
                    <input
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                      placeholder="+54 9 11 1234-5678"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#dbe2ea' }}>
                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.1em]" style={{ color: '#111827' }}>
                  Dirección de envío
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Calle y número
                    </label>
                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      required
                      placeholder="Av. Corrientes 1234"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Ciudad
                    </label>
                    <input
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      required
                      placeholder="Buenos Aires"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Provincia
                    </label>
                    <input
                      name="provincia"
                      value={form.provincia}
                      onChange={handleChange}
                      required
                      placeholder="CABA"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em]" style={{ color: '#64748b' }}>
                      Código postal
                    </label>
                    <input
                      name="cp"
                      value={form.cp}
                      onChange={handleChange}
                      required
                      placeholder="1043"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#cbd5e1', color: '#111827' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-4 font-black uppercase tracking-[0.08em] text-base transition-all"
                style={{ background: '#FFD700', color: '#111827' }}
              >
                Confirmar pedido
              </button>
            </form>

            {/* Order summary */}
            <div className="rounded-2xl border bg-white p-6 self-start sticky top-24" style={{ borderColor: '#dbe2ea' }}>
              <h2 className="mb-4 text-sm font-black uppercase tracking-[0.1em]" style={{ color: '#111827' }}>
                Resumen del pedido
              </h2>

              <div className="flex flex-col gap-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover border"
                        style={{ borderColor: '#e2e8f0' }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold" style={{ color: '#111827' }}>{item.name}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>Cant: {item.qty}</div>
                    </div>
                    <div className="text-sm font-black" style={{ color: '#111827' }}>
                      ${(item.price * item.qty).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#e2e8f0' }}>
                <div className="flex justify-between items-center mb-2 text-sm" style={{ color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span style={{ color: '#64748b' }}>Envío</span>
                  <span className="font-bold" style={{ color: '#16a34a' }}>Gratis</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: '#e2e8f0' }}>
                  <span className="font-black uppercase tracking-[0.06em]" style={{ color: '#111827' }}>Total</span>
                  <span className="text-2xl font-black" style={{ color: '#111827' }}>
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="#64748b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 118 0v3" />
                </svg>
                <span className="text-xs" style={{ color: '#64748b' }}>Pago seguro con encriptación SSL</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
