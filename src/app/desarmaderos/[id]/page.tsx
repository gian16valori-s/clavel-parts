'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getDismantlerProfile, type DismantlerProfile } from '@/lib/donorInventory'

export default function DismantlerProfilePage() {
  const params = useParams<{ id: string }>()
  const [profile, setProfile] = useState<DismantlerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const sellerId = Number(params.id)
    if (!Number.isSafeInteger(sellerId) || sellerId <= 0) {
      setLoading(false)
      setError('El perfil no es válido.')
      return
    }

    getDismantlerProfile(sellerId)
      .then((result) => { if (!cancelled) setProfile(result) })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el perfil.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [params.id])

  if (loading) return <main className="min-h-screen bg-slate-100 p-8 text-center">Cargando perfil...</main>
  if (error || !profile) return <main className="min-h-screen bg-slate-100 p-8 text-center text-red-700">{error || 'Perfil no encontrado.'}</main>

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold uppercase text-slate-600">← Catálogo</Link>
        <header className="mt-5 rounded-2xl bg-slate-900 p-8 text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-300">Desarmadero</div>
          <h1 className="mt-2 text-3xl font-black">{profile.name}</h1>
          {profile.location && <p className="mt-2 text-slate-300">{profile.location}</p>}
          <p className="mt-4 text-sm text-slate-300">{profile.donors.length} vehículo{profile.donors.length === 1 ? '' : 's'} con piezas publicadas</p>
        </header>
        <section className="mt-9">
          <h2 className="text-2xl font-black uppercase">Vehículos donantes</h2>
          {profile.donors.length === 0 ? (
            <p className="mt-4 rounded-lg bg-white p-5 text-slate-600">Este desarmadero todavía no tiene vehículos con piezas publicadas.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.donors.map((donor) => (
                <Link key={donor.id} href={`/vehiculos-donantes/${donor.id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1">
                  {donor.photos[0] ? <img src={donor.photos[0]} alt={donor.vehicle} className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center bg-slate-200 text-slate-500">Sin foto</div>}
                  <div className="p-4">
                    <h3 className="font-bold">{donor.vehicle}</h3>
                    <p className="mt-2 text-sm text-slate-500">{donor.parts.length} pieza{donor.parts.length === 1 ? '' : 's'} publicada{donor.parts.length === 1 ? '' : 's'}</p>
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
