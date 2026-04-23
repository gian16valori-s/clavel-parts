import { supabase } from './supabase'
import type { CartProduct, SelectedVehicle } from './cartStore'

interface CatalogRow {
  marca: string
  modelo: string
  anio: number
  version: string
  motor_codigo: string
  grupo: string
  subgrupo: string
  tipo_pieza: string
  sku: string
  producto: string
  marca_pieza: string | null
  numero_parte_oem: string | null
  precio: number | null
  precio_oferta: number | null
  stock: number | null
  liquidacion: boolean | null
  activo: boolean | null
  especificaciones?: Record<string, unknown> | null
  vendedor: string | null
}

interface ProductImageRow {
  sku: string
  imagen_url: string | null
}

export interface CatalogProduct extends Omit<CartProduct, 'qty'> {
  group: string
  subgroup: string
  version: string
  engine: string
  stock: number
  liquidation: boolean
}

function slugifyCategory(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

export async function getCatalogProducts(
  vehicle: SelectedVehicle | null,
  searchQuery?: string
): Promise<CatalogProduct[]> {
  const normalizedSearch = searchQuery?.trim() ?? ''

  if (!vehicle && !normalizedSearch) return []

  try {
    let query = supabase
      .from('vista_catalogo')
      .select('*')
      .eq('activo', true)

    if (vehicle) {
      query = query
        .eq('marca', vehicle.brand)
        .eq('modelo', vehicle.model)
        .eq('anio', Number(vehicle.year))
        .eq('motor_codigo', vehicle.engine)

      if (vehicle.versionLabel) {
        query = query.eq('version', vehicle.versionLabel)
      }
    }

    if (normalizedSearch) {
      query = query.or(
        `producto.ilike.%${normalizedSearch}%,sku.ilike.%${normalizedSearch}%,numero_parte_oem.ilike.%${normalizedSearch}%,marca_pieza.ilike.%${normalizedSearch}%`
      )
    }

    const { data, error } = await query
      .order('grupo')
      .order('subgrupo')
      .order('producto')

    if (error) throw error

    const rows = (data as CatalogRow[] | null) ?? []
    const skus = Array.from(new Set(rows.map((item) => item.sku).filter(Boolean)))
    const imageBySku = new Map<string, string>()

    if (skus.length > 0) {
      const { data: imageRows, error: imageError } = await supabase
        .from('productos')
        .select('sku, imagen_url')
        .in('sku', skus)
        .not('imagen_url', 'is', null)

      if (!imageError) {
        ;((imageRows as ProductImageRow[] | null) ?? []).forEach((row) => {
          if (row.sku && row.imagen_url) {
            imageBySku.set(row.sku, row.imagen_url)
          }
        })
      }
    }

    return rows.map((item, index) => ({
      id: `${item.sku}-${index}`,
      name: item.producto,
      brand: item.marca_pieza || 'Sin marca',
      ref: item.numero_parte_oem || item.sku || 'S/N',
      price: Number(item.precio_oferta ?? item.precio ?? 0),
      seller: item.vendedor || 'Vendedor verificado',
      sellerRating: 5,
      delivery: (item.stock ?? 0) > 0 ? '2-4' : 'a consultar',
      category: slugifyCategory(item.grupo || item.subgrupo || 'general'),
      image: imageBySku.get(item.sku) || undefined,
      group: item.grupo || 'General',
      subgroup: item.subgrupo || 'Otros',
      version: item.version,
      engine: item.motor_codigo,
      stock: item.stock ?? 0,
      liquidation: Boolean(item.liquidacion),
    }))
  } catch (error) {
    console.error('Error fetching catalog products:', error)
    return []
  }
}
