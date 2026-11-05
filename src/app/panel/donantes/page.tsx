'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getBrands, getModelsByBrand, getYearsByModel, getVersionsByModelAndYear, type Brand, type Model, type Version } from '@/lib/supabaseVehicles'
import { getSession, getVendedorActual } from '@/lib/vendedorAuth'
import { createClient } from '@/lib/supabase'
import { getDonorInventory, type DonorInventory } from '@/lib/donorInventory'

export default function PanelDonantesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [donors, setDonors] = useState<DonorInventory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [years, setYears] = useState<number[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [brandId, setBrandId] = useState('')
  const [modelId, setModelId] = useState('')
  const [year, setYear] = useState('')
  const [versionId, setVersionId] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      getBrands()
        .then((rows) => { if (!cancelled) setBrands(rows) })
        .catch(() => { if (!cancelled) setError('No se pudieron cargar las marcas.') })
      try {
        const session = await getSession()
        if (!session?.user) {
          router.replace('/login/vendedor')
          return
        }
        const seller = await getVendedorActual()
        if (!seller) throw new Error('No estás habilitado como vendedor.')
        const { data: dismantlerProfile, error: profileError } = await supabase
          .from('perfiles_desarmadero')
          .select('vendedor_id')
          .eq('vendedor_id', seller.id)
          .maybeSingle()
        if (profileError) throw profileError
        if (!dismantlerProfile) throw new Error('Tu cuenta todavía no está habilitada para administrar vehículos donantes.')

        const donorRows = await supabase
          .from('vehiculos_donantes')
          .select('id')
          .eq('vendedor_id', seller.id)
          .order('id', { ascending: false })
        if (donorRows.error) throw donorRows.error
        const donorDetails = await Promise.all((donorRows.data ?? []).map((row) => getDonorInventory(row.id)))
        if (cancelled) return
        setSellerId(seller.id)
        setDonors(donorDetails.filter((item): item is DonorInventory => item !== null))
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el inventario.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [router, supabase])

  async function handleBrandChange(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value
    setBrandId(id)
    setModelId('')
    setYear('')
    setVersionId('')
    setModels([])
    setYears([])
    setVersions([])
    if (id) setModels(await getModelsByBrand(Number(id)))
  }

  async function handleModelChange(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value
    setModelId(id)
    setYear('')
    setVersionId('')
    setYears([])
    setVersions([])
    if (id) setYears(await getYearsByModel(Number(id)))
  }

  async function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    setYear(value)
    setVersionId('')
    setVersions([])
    if (modelId && value) setVersions(await getVersionsByModelAndYear(Number(modelId), Number(value)))
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('La foto debe ser JPG, PNG o WebP y pesar hasta 5 MB.')
      event.target.value = ''
      return
    }
    setError('')
    setPhoto(file)
  }

  async function handleCreateDonor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sellerId || !versionId) return
    setSaving(true)
    setError('')

    try {
      const { data: donor, error: insertError } = await supabase
        .from('vehiculos_donantes')
        .insert({
          vendedor_id: sellerId,
          version_id: Number(versionId),
          descripcion: description.trim() || null,
        })
        .select('id')
        .single()
      if (insertError) throw insertError

      let photoSaveError = ''
      if (photo) {
        const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const storagePath = `vendedores/${sellerId}/donantes/${donor.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(storagePath, photo, { contentType: photo.type })
        if (uploadError) {
          photoSaveError = uploadError.message
        } else {
          const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(storagePath)
          const { error: photoError } = await supabase.from('fotos_vehiculo_donante').insert({
            vehiculo_donante_id: donor.id,
            url: publicUrl.publicUrl,
            orden: 1,
          })
          if (photoError) {
            photoSaveError = photoError.message
            const { error: cleanupError } = await supabase.storage.from('product-images').remove([storagePath])
            if (cleanupError) console.error('No se pudo limpiar la foto del vehículo donante:', cleanupError)
          }
        }
      }

      const savedDonor = await getDonorInventory(donor.id)
      if (savedDonor) setDonors((current) => [savedDonor, ...current])
      if (photoSaveError) {
        setError(`El vehículo quedó registrado, pero no se pudo guardar su foto: ${photoSaveError}`)
      }
      setVersionId('')
      setDescription('')
      setPhoto(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo registrar el vehículo donante.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="min-h-screen bg-[#080a0c] p-8 text-center text-white">Cargando inventario...</main>

  return (
    <main className="min-h-screen bg-[#080a0c] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/panel" className="text-sm font-bold uppercase text-[#f0e040]">← Volver al panel</Link>
        <h1 className="mt-5 text-3xl font-black uppercase text-[#f0e040]">Vehículos donantes</h1>
        <p className="mt-2 text-gray-400">Registrá cada vehículo una vez y después cargá desde ahí las piezas recuperadas.</p>

        {error && <div role="alert" className="mt-5 rounded-lg border border-red-800 bg-red-950 p-4 text-red-200">{error}</div>}

        <section className="mt-7 rounded-xl border border-gray-700 bg-[#11161b] p-5">
          <h2 className="text-xl font-bold uppercase">Registrar vehículo donante</h2>
          <p className="mt-1 text-sm text-gray-400">La versión y motorización deben existir en el catálogo. Si no aparecen, solicitá que las agreguemos antes de continuar.</p>
          <form onSubmit={handleCreateDonor} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm">Marca
              <select required value={brandId} onChange={handleBrandChange} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3">
                <option value="">Seleccionar marca</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.nombre}</option>)}
              </select>
            </label>
            <label className="text-sm">Modelo
              <select required value={modelId} onChange={handleModelChange} disabled={!brandId} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3">
                <option value="">Seleccionar modelo</option>
                {models.map((model) => <option key={model.id} value={model.id}>{model.nombre}</option>)}
              </select>
            </label>
            <label className="text-sm">Año
              <select required value={year} onChange={handleYearChange} disabled={!modelId} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3">
                <option value="">Seleccionar año</option>
                {years.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm">Versión y motorización
              <select required value={versionId} onChange={(event) => setVersionId(event.target.value)} disabled={!year} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3">
                <option value="">Seleccionar versión exacta</option>
                {versions.filter((item) => item.motor_codigo?.trim()).map((item) => (
                  <option key={item.id} value={item.id}>{item.version} · {item.motor_codigo}</option>
                ))}
              </select>
            </label>
            {!loading && year && versions.filter((item) => item.motor_codigo?.trim()).length === 0 && (
              <p className="md:col-span-2 text-sm text-amber-300">No hay versiones con motorización cargada para este año. Contactá a Clavel Parts para solicitar el alta en el catálogo.</p>
            )}
            <label className="text-sm">Foto del vehículo donante (opcional, JPG/PNG/WebP, hasta 5 MB)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="mt-1 block w-full text-sm text-gray-300" />
            </label>
            <label className="text-sm md:col-span-2">Descripción
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
            </label>
            <button disabled={saving || !versionId} className="rounded bg-[#f0e040] px-5 py-3 font-bold uppercase text-black disabled:opacity-50 md:col-span-2">
              {saving ? 'Guardando...' : 'Registrar vehículo donante'}
            </button>
          </form>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-bold uppercase">Tu inventario de vehículos</h2>
          {donors.length === 0 ? (
            <p className="mt-3 rounded-lg border border-gray-700 p-5 text-gray-400">Todavía no registraste vehículos donantes.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {donors.map((donor) => (
                <article key={donor.id} className="overflow-hidden rounded-xl border border-gray-700 bg-[#11161b]">
                  {donor.photos[0] && <img src={donor.photos[0]} alt={donor.vehicle} className="h-48 w-full object-cover" />}
                  <div className="p-5">
                    <h3 className="text-lg font-bold">{donor.vehicle}</h3>
                    <p className="mt-1 text-sm text-gray-400">{donor.parts.length} pieza{donor.parts.length === 1 ? '' : 's'} publicada{donor.parts.length === 1 ? '' : 's'}</p>
                    <Link href={`/panel/donantes/${donor.id}`} className="mt-4 inline-block rounded bg-[#f0e040] px-4 py-2 font-bold uppercase text-black">Ver y cargar piezas</Link>
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
