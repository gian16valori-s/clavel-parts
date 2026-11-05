import { supabase } from './supabase'

export type DonorInventoryPart = {
  id: string
  name: string
  brand: string
  price: number
  image?: string
}

export type DonorInventory = {
  id: number
  status: string
  description: string | null
  vehicle: string
  sellerId: number
  sellerName: string
  photos: string[]
  parts: DonorInventoryPart[]
}

export type DismantlerProfile = {
  id: number
  name: string
  location: string
  donors: DonorInventory[]
}

type VersionRow = {
  id: number
  modelo_id: number
  anio: number
  version: string
  motor_codigo: string | null
}

export async function getDonorInventory(id: number): Promise<DonorInventory | null> {
  const { data: donor, error: donorError } = await supabase
    .from('vehiculos_donantes')
    .select('id, vendedor_id, version_id, estado, descripcion')
    .eq('id', id)
    .maybeSingle()

  if (donorError) throw donorError
  if (!donor) return null

  const [versionResult, profileResult, photosResult, usedPartsResult] = await Promise.all([
    supabase
      .from('versiones')
      .select('id, modelo_id, anio, version, motor_codigo')
      .eq('id', donor.version_id)
      .single(),
    supabase
      .from('perfiles_desarmadero')
      .select('vendedor_id, nombre')
      .eq('vendedor_id', donor.vendedor_id)
      .maybeSingle(),
    supabase
      .from('fotos_vehiculo_donante')
      .select('url')
      .eq('vehiculo_donante_id', id)
      .order('orden'),
    supabase
      .from('piezas_usadas')
      .select('producto_id')
      .eq('vehiculo_donante_id', id)
      .eq('estado', 'publicada'),
  ])

  if (versionResult.error) throw versionResult.error
  if (profileResult.error) throw profileResult.error
  if (photosResult.error) throw photosResult.error
  if (usedPartsResult.error) throw usedPartsResult.error

  const version = versionResult.data as VersionRow
  const [{ data: model, error: modelError }, { data: parts, error: partsError }] = await Promise.all([
    supabase.from('modelos').select('id, marca_id, nombre').eq('id', version.modelo_id).single(),
    usedPartsResult.data.length > 0
      ? supabase
          .from('vista_catalogo')
          .select('product_id, producto, marca_pieza, precio, precio_oferta, imagen_url, stock, activo')
          .in('product_id', usedPartsResult.data.map((part) => part.producto_id))
          .eq('activo', true)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (modelError) throw modelError
  if (partsError) throw partsError

  const { data: brand, error: brandError } = await supabase
    .from('marcas')
    .select('nombre')
    .eq('id', model.marca_id)
    .single()

  if (brandError) throw brandError

  const uniqueParts = new Map<number, DonorInventoryPart>()
  for (const part of parts ?? []) {
    const productId = Number(part.product_id)
    if (uniqueParts.has(productId)) continue
    uniqueParts.set(productId, {
      id: String(productId),
      name: part.producto,
      brand: part.marca_pieza || 'Sin marca',
      price: Number(part.precio_oferta ?? part.precio ?? 0),
      image: part.imagen_url ?? undefined,
    })
  }

  const vehicle = `${brand.nombre} ${model.nombre} · ${version.anio} · ${version.version} · ${version.motor_codigo ?? ''}`
    .replace(/\s+·\s+$/, '')

  return {
    id: donor.id,
    status: donor.estado,
    description: donor.descripcion,
    vehicle,
    sellerId: donor.vendedor_id,
    sellerName: profileResult.data?.nombre || 'Desarmadero',
    photos: (photosResult.data ?? []).map((photo) => photo.url),
    parts: Array.from(uniqueParts.values()),
  }
}

export async function getDismantlerProfile(id: number): Promise<DismantlerProfile | null> {
  const { data: profile, error: profileError } = await supabase
    .from('perfiles_desarmadero')
    .select('vendedor_id, nombre, localidad, provincia')
    .eq('vendedor_id', id)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) return null

  const { data: donorRows, error: donorsError } = await supabase
    .from('vehiculos_donantes')
    .select('id')
    .eq('vendedor_id', id)
    .order('id', { ascending: false })

  if (donorsError) throw donorsError
  const donors = await Promise.all((donorRows ?? []).map((row) => getDonorInventory(row.id)))

  return {
    id: profile.vendedor_id,
    name: profile.nombre || 'Desarmadero',
    location: [profile.localidad, profile.provincia].filter(Boolean).join(', '),
    donors: donors.filter((item): item is DonorInventory => item !== null),
  }
}
