'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getSession, getVendedorActual } from '@/lib/vendedorAuth'
import { getDonorInventory, type DonorInventory } from '@/lib/donorInventory'
import ProductForm from '@/components/vendedor/ProductForm'
import { supabase } from '@/lib/supabase'

export default function PanelDonorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [donor, setDonor] = useState<DonorInventory | null>(null)
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const session = await getSession()
        if (!session?.user) {
          router.replace('/login/vendedor')
          return
        }
        const seller = await getVendedorActual()
        if (!seller) throw new Error('No estás habilitado como vendedor.')
        const donorId = Number(params.id)
        if (!Number.isSafeInteger(donorId) || donorId <= 0) throw new Error('El vehículo donante no es válido.')

        const { data: ownedDonor, error: ownerError } = await supabase
          .from('vehiculos_donantes')
          .select('id')
          .eq('id', donorId)
          .eq('vendedor_id', seller.id)
          .maybeSingle()
        if (ownerError) throw ownerError
        if (!ownedDonor) throw new Error('No tenés acceso a este vehículo donante.')

        const details = await getDonorInventory(donorId)
        if (!cancelled) {
          setSellerId(seller.id)
          setDonor(details)
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el vehículo donante.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [params.id, router])

  if (loading) return <main className="min-h-screen bg-[#080a0c] p-8 text-center text-white">Cargando vehículo donante...</main>
  if (error || !donor || !sellerId) return <main className="min-h-screen bg-[#080a0c] p-8 text-center text-red-300">{error || 'Vehículo donante no encontrado.'}</main>

  return (
    <main className="min-h-screen bg-[#080a0c] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/panel/donantes" className="text-sm font-bold uppercase text-[#f0e040]">← Volver a tus vehículos</Link>
        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <section className="overflow-hidden rounded-xl border border-gray-700 bg-[#11161b]">
            {donor.photos[0] && <img src={donor.photos[0]} alt={donor.vehicle} className="h-56 w-full object-cover" />}
            <div className="p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-[#f0e040]">Vehículo donante</div>
              <h1 className="mt-2 text-2xl font-black">{donor.vehicle}</h1>
              {donor.description && <p className="mt-3 text-sm text-gray-300">{donor.description}</p>}
              <p className="mt-4 text-sm text-gray-400">{donor.parts.length} pieza{donor.parts.length === 1 ? '' : 's'} publicada{donor.parts.length === 1 ? '' : 's'}</p>
            </div>
          </section>
          <section className="rounded-xl border border-gray-700 bg-[#11161b] p-5">
            <h2 className="text-xl font-bold uppercase">Cargar repuesto de este vehículo</h2>
            <p className="mt-2 text-sm text-gray-400">La pieza se vincula automáticamente a este vehículo y a tu cuenta. Elegí por separado las compatibilidades confirmadas.</p>
            <button type="button" onClick={() => setShowProductForm((current) => !current)} className="mt-5 rounded bg-[#f0e040] px-5 py-3 font-bold uppercase text-black">
              {showProductForm ? 'Cerrar formulario' : 'Cargar repuesto usado'}
            </button>
          </section>
        </div>

        {showProductForm && (
          <section className="mt-6 rounded-xl border border-gray-700 bg-white p-5 text-black">
            <ProductForm
              vendedorId={sellerId}
              donorId={donor.id}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
              supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
            />
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-bold uppercase">Piezas publicadas de esta unidad</h2>
          {donor.parts.length === 0 ? <p className="mt-3 text-gray-400">Todavía no hay piezas publicadas.</p> : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {donor.parts.map((part) => (
                <article key={part.id} className="overflow-hidden rounded-xl border border-gray-700 bg-[#11161b]">
                  {part.image && <img src={part.image} alt={part.name} className="h-40 w-full object-cover" />}
                  <div className="p-4">
                    <span className="rounded bg-amber-300 px-2 py-1 text-xs font-black uppercase text-black">Usado</span>
                    <h3 className="mt-3 font-bold">{part.name}</h3>
                    <p className="mt-2 text-sm text-gray-400">${part.price.toLocaleString('es-AR')}</p>
                    <Link href={`/productos/${part.id}`} className="mt-3 inline-block text-sm font-bold uppercase text-[#f0e040]">Ver publicación →</Link>
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
