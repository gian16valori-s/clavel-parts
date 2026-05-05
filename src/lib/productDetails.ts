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
}

type ProductRow = {
  id: number
  grupo_id?: number | null
  subgrupo_id?: number | null
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
  imagen_url?: string | null
}

type NameRow = {
  nombre?: string | null
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
  }
}

export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  if (!isNumericId(id)) {
    return fallbackProduct(id)
  }

  const supabase = createClient()
  const numericId = Number(id)

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', numericId)
    .maybeSingle()

  if (error || !data) {
    return fallbackProduct(id)
  }

  const product = data as ProductRow

  const [groupResult, subgroupResult, compatibilityResult] = await Promise.all([
    product.grupo_id
      ? supabase.from('grupos').select('nombre').eq('id', product.grupo_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    product.subgrupo_id
      ? supabase.from('subgrupos').select('nombre').eq('id', product.subgrupo_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    product.sku
      ? supabase
          .from('vista_catalogo')
          .select('marca, modelo, anio, version, motor_codigo')
          .eq('sku', product.sku)
      : Promise.resolve({ data: [], error: null }),
  ])

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

  const groupName = (groupResult.data as NameRow | null)?.nombre || 'General'
  const subgroupName = (subgroupResult.data as NameRow | null)?.nombre || 'General'
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

  const compatibilityRows = ((compatibilityResult.data as CatalogCompatibilityRow[] | null) ?? [])
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
    seller: product.vendedor || 'Vendedor verificado',
    group: groupName,
    subgroup: subgroupName,
    description,
    images: imageUrls.length > 0 ? imageUrls : [getCategoryImage(groupName)],
    attributes,
    compatibility: compatibilityRows,
  }
}