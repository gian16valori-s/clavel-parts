'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getDonorInventory, type DonorInventory } from '@/lib/donorInventory'

export default function DonorPage() {
  const params = useParams<{ id: string }>()
  const [donor, setDonor] = useState<DonorInventory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const donorId = Number(params.id)
    if (!Number.isSafeInteger(donorId) || donorId <= 0) {
      setLoading(false)
      setError('El vehículo donante no es válido.')
      return
    }

    getDonorInventory(donorId)
      .then((result) => {
        if (!cancelled) setDonor(result)
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el vehículo donante.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [params.id])

  if (loading) return <main className="min-h-screen bg-slate-100 p-8 text-center">Cargando vehículo donante...</main>
  if (error || !donor) return <main className="min-h-screen bg-slate-100 p-8 text-center text-red-700">{error || 'Vehículo donante no encontrado.'}</main>

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold uppercase text-slate-600">← Catálogo</Link>
        <div className="mt-5 grid overflow-hidden rounded-2xl bg-white shadow md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-64 items-center justify-center bg-slate-200">
            {donor.photos[0] ? <img src={donor.photos[0]} alt={donor.vehicle} className="h-full max-h-[440px] w-full object-cover" /> : <span className="text-slate-500">Sin foto del vehículo</span>}
          </div>
          <div className="p-6 md:p-9">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Vehículo donante</div>
            <h1 className="mt-2 text-3xl font-black">{donor.vehicle}</h1>
            <Link href={`/desarmaderos/${donor.sellerId}`} className="mt-3 inline-block font-semibold text-blue-700">{donor.sellerName}</Link>
            {donor.description && <p className="mt-4 leading-relaxed text-slate-600">{donor.description}</p>}
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              {donor.parts.length} pieza{donor.parts.length === 1 ? '' : 's'} publicada{donor.parts.length === 1 ? '' : 's'} de esta unidad
            </div>
          </div>
        </div>

        <section className="mt-9">
          <h2 className="text-2xl font-black uppercase">Repuestos publicados de este vehículo</h2>
          {donor.parts.length === 0 ? (
            <p className="mt-4 rounded-lg bg-white p-5 text-slate-600">Todavía no hay repuestos publicados de esta unidad.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {donor.parts.map((part) => (
                <Link key={part.id} href={`/productos/${part.id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1">
                  {part.image ? <img src={part.image} alt={part.name} className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-500">Sin foto</div>}
                  <div className="p-4">
                    <span className="rounded bg-amber-100 px-2 py-1 text-xs font-black uppercase text-amber-900">Usado</span>
                    <h3 className="mt-3 font-bold">{part.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{part.brand}</p>
                    <p className="mt-3 text-xl font-black">${part.price.toLocaleString('es-AR')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
