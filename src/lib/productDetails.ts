import { createClient } from './supabase'
import { getCategoryImage } from './categoryImages'
import { getProductImages } from './productImages'

export type ProductDetailAttribute = {
  label: string
  value: string
}

export type ProductCompatibility = {
  label: string
}

export type ProductDetail = {
  id: string
  name: string
  brand: string
  sku: string
  ref: string
  price: number
  stock: number
  seller: string
  group: string
  subgroup: string
  description: string
  images: string[]
  attributes: ProductDetailAttribute[]
  compatibility: ProductCompatibility[]
  used: {
    donorId: number
    donorName: string
    donorVehicle: string
  } | null
}

type ProductRow = {
  id: number
  sku?: string | null
  producto?: string | null
  descripcion_corta?: string | null
  descripcion_larga?: string | null
  marca_pieza?: string | null
  numero_parte_oem?: string | null
  precio?: number | null
  precio_oferta?: number | null
  stock?: number | null
  especificaciones?: Record<string, unknown> | null
  material?: string | null
  garantia_meses?: number | null
  peso_kg?: number | null
  alto_cm?: number | null
  ancho_cm?: number | null
  largo_cm?: number | null
  vendedor?: string | null
  nombre_negocio?: string | null
  imagen_url?: string | null
  grupo?: string | null
  subgrupo?: string | null
  marca?: string | null
  modelo?: string | null
  anio?: number | null
  version?: string | null
  motor_codigo?: string | null
}

type CatalogCompatibilityRow = {
  marca?: string | null
  modelo?: string | null
  anio?: number | null
  version?: string | null
  motor_codigo?: string | null
}

function isNumericId(value: string) {
  return /^\d+$/.test(value)
}

function buildAttribute(label: string, value: unknown): ProductDetailAttribute | null {
  if (value === null || value === undefined) return null
  const normalized = String(value).trim()
  if (!normalized) return null
  return { label, value: normalized }
}

function specAttributes(specs: Record<string, unknown> | null | undefined) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return []

  return Object.entries(specs)
    .map(([key, value]) => buildAttribute(key.replace(/_/g, ' '), value))
    .filter((item): item is ProductDetailAttribute => Boolean(item))
}

function fallbackProduct(id: string): ProductDetail {
  return {
    id,
    name: `Producto ${id}`,
    brand: 'ClavelParts',
    sku: `SKU-${id}`,
    ref: `REF-${id}`,
    price: 0,
    stock: 0,
    seller: 'Vendedor verificado',
    group: 'General',
    subgroup: 'General',
    description: 'Este producto todavia no tiene una ficha enriquecida en base de datos. La estructura ya esta lista para mostrar descripcion, medidas, material y compatibilidades reales desde Supabase.',
    images: [getCategoryImage('otros')],
    attributes: [],
    compatibility: [],
    used: null,
  }
}

export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  if (!isNumericId(id)) {
    return fallbackProduct(id)
  }

  const supabase = createClient()
  const numericId = Number(id)

  const { data, error } = await supabase
    .from('vista_catalogo')
    .select('*')
    .eq('product_id', numericId)

  const rows = (data as ProductRow[] | null) ?? []

  if (error) throw error
  if (rows.length === 0) {
    return fallbackProduct(id)
  }

  const product = rows[0]

  let imageUrls: string[] = []
  try {
    const images = await getProductImages(supabase, numericId)
    imageUrls = images.map((item) => item.url)
  } catch {
    imageUrls = []
  }

  if (imageUrls.length === 0 && product.imagen_url) {
    imageUrls = [product.imagen_url]
  }

  const { data: usedPart, error: usedPartError } = await supabase
    .from('piezas_usadas')
    .select('vehiculo_donante_id, estado')
    .eq('producto_id', numericId)
    .maybeSingle()

  // Tolera que la migración de piezas usadas aún no esté aplicada.
  if (usedPartError && usedPartError.code !== 'PGRST205' && usedPartError.code !== '42P01') throw usedPartError

  let used: ProductDetail['used'] = null
  if (usedPart?.estado === 'publicada') {
    const { data: donor, error: donorError } = await supabase
      .from('vehiculos_donantes')
      .select('id, vendedor_id, version_id')
      .eq('id', usedPart.vehiculo_donante_id)
      .single()
    if (donorError) throw donorError

    const [photoResult, profileResult, versionResult] = await Promise.all([
      supabase
        .from('fotos_vehiculo_donante')
        .select('url')
        .eq('vehiculo_donante_id', donor.id)
        .order('orden')
        .limit(1),
      supabase
        .from('perfiles_desarmadero')
        .select('nombre')
        .eq('vendedor_id', donor.vendedor_id)
        .maybeSingle(),
      supabase
        .from('versiones')
        .select('modelo_id, anio, version, motor_codigo')
        .eq('id', donor.version_id)
        .single(),
    ])
    if (photoResult.error) throw photoResult.error
    if (profileResult.error) throw profileResult.error
    if (versionResult.error) throw versionResult.error

    const { data: model, error: modelError } = await supabase
      .from('modelos')
      .select('marca_id, nombre')
      .eq('id', versionResult.data.modelo_id)
      .single()
    if (modelError) throw modelError

    const { data: brand, error: brandError } = await supabase
      .from('marcas')
      .select('nombre')
      .eq('id', model.marca_id)
      .single()
    if (brandError) throw brandError

    const donorPhoto = photoResult.data?.[0]?.url
    if (donorPhoto && !imageUrls.includes(donorPhoto)) imageUrls.push(donorPhoto)
    used = {
      donorId: donor.id,
      donorName: profileResult.data?.nombre || 'Desarmadero',
      donorVehicle: `${brand.nombre} ${model.nombre} · ${versionResult.data.anio} · ${versionResult.data.version} · ${versionResult.data.motor_codigo ?? ''}`.replace(/\s+·\s+$/, ''),
    }
  }

  const groupName = product.grupo || 'General'
  const subgroupName = product.subgrupo || 'General'
  const attributes = [
    buildAttribute('Marca', product.marca_pieza),
    buildAttribute('OEM', product.numero_parte_oem),
    buildAttribute('Material', product.material),
    buildAttribute('Garantia', product.garantia_meses ? `${product.garantia_meses} meses` : null),
    buildAttribute('Peso', product.peso_kg ? `${product.peso_kg} kg` : null),
    buildAttribute('Alto', product.alto_cm ? `${product.alto_cm} cm` : null),
    buildAttribute('Ancho', product.ancho_cm ? `${product.ancho_cm} cm` : null),
    buildAttribute('Largo', product.largo_cm ? `${product.largo_cm} cm` : null),
    ...specAttributes(product.especificaciones),
  ].filter((item): item is ProductDetailAttribute => Boolean(item))

  const compatibilityRows = (rows as CatalogCompatibilityRow[])
    .map((item) => {
      const vehicle = [item.marca, item.modelo, item.anio].filter(Boolean).join(' ')
      const version = [item.version, item.motor_codigo].filter(Boolean).join(' · ')
      const label = [vehicle, version].filter(Boolean).join(' - ')
      return label ? { label } : null
    })
    .filter((item): item is ProductCompatibility => Boolean(item))

  const description =
    product.descripcion_larga?.trim() ||
    product.descripcion_corta?.trim() ||
    `Repuesto ${product.producto ?? 'sin descripcion'} para ${groupName.toLowerCase()}. La ficha tecnica se completa automaticamente desde Supabase a medida que cargues informacion detallada en el producto.`

  return {
    id: String(product.id),
    name: product.producto || `Producto ${id}`,
    brand: product.marca_pieza || 'Sin marca',
    sku: product.sku || `SKU-${id}`,
    ref: product.numero_parte_oem || product.sku || `REF-${id}`,
    price: Number(product.precio_oferta ?? product.precio ?? 0),
    stock: Number(product.stock ?? 0),
    seller: product.nombre_negocio || product.vendedor || 'Vendedor verificado',
    group: groupName,
    subgroup: subgroupName,
    description,
    images: imageUrls.length > 0 ? imageUrls : [getCategoryImage(groupName)],
    attributes,
    compatibility: compatibilityRows,
    used,
  }
}