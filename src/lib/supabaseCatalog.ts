import { supabase } from './supabase'
import type { CartProduct, SelectedVehicle } from './cartStore'

interface CatalogRow {
  product_id?: number | null
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
  vendedor?: string | null
  vendedor_id?: number | null
  imagen_url?: string | null
}

export interface CatalogProduct extends Omit<CartProduct, 'qty'> {
  group: string
  subgroup: string
  version: string
  engine: string
  stock: number
  liquidation: boolean
  isUsed?: boolean
  donorId?: number
}

function slugifyCategory(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function resolveSubgroup(item: CatalogRow) {
  const tipoPieza = item.tipo_pieza?.trim() ?? ''
  if (normalizeText(tipoPieza) === 'parrilla delantera') {
    return 'Parrilla delantera'
  }
  return item.subgrupo || 'Otros'
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
    const catalogProductIds = Array.from(
      new Set(
        rows
          .map((item) => (item.product_id != null ? Number(item.product_id) : null))
          .filter((id): id is number => id != null && !isNaN(id))
      )
    )

    const usedPartByProductId = new Map<number, { donorId: number; status: string }>()
    if (catalogProductIds.length > 0) {
      const { data: usedRows, error: usedError } = await supabase
        .from('piezas_usadas')
        .select('producto_id, vehiculo_donante_id, estado')
        .in('producto_id', catalogProductIds)

      // Si la migración de piezas usadas aún no se aplicó, el catálogo sigue funcionando sin ella.
      if (usedError && usedError.code !== 'PGRST205' && usedError.code !== '42P01') throw usedError
      for (const usedPart of usedRows ?? []) {
        usedPartByProductId.set(Number(usedPart.producto_id), {
          donorId: Number(usedPart.vehiculo_donante_id),
          status: usedPart.estado,
        })
      }
    }

    const visibleRows = rows.filter((item) => {
      if (item.product_id == null) return true
      const usedPart = usedPartByProductId.get(Number(item.product_id))
      return !usedPart || usedPart.status === 'publicada'
    })

    // Collect numeric product IDs for fotos_producto query (new photo system)
    const visibleProductIds = Array.from(
      new Set(
        visibleRows
          .map((item) => (item.product_id != null ? Number(item.product_id) : null))
          .filter((id): id is number => id != null && !isNaN(id))
      )
    )

    const imageByProductId = new Map<number, string>()

    // Fetch from fotos_producto (new system — vendor-uploaded photos)
    if (visibleProductIds.length > 0) {
      const { data: fotoRows, error: fotoError } = await supabase
        .from('fotos_producto')
        .select('producto_id, url')
        .in('producto_id', visibleProductIds)
        .order('orden')

      if (!fotoError && fotoRows) {
        ;(fotoRows as { producto_id: number; url: string }[]).forEach((row) => {
          const pid = Number(row.producto_id)
          if (!isNaN(pid) && row.url && !imageByProductId.has(pid)) {
            imageByProductId.set(pid, row.url)
          }
        })
      }
    }

    return visibleRows.map((item, index) => {
      const usedPart = item.product_id != null ? usedPartByProductId.get(Number(item.product_id)) : undefined
      return {
        id: String(item.product_id ?? `${item.sku}-${index}`),
        name: item.producto,
        brand: item.marca_pieza || 'Sin marca',
        ref: item.numero_parte_oem || item.sku || 'S/N',
        price: Number(item.precio_oferta ?? item.precio ?? 0),
        seller: item.vendedor || (item.vendedor_id ? `Vendedor #${item.vendedor_id}` : 'Vendedor verificado'),
        sellerRating: 5,
        delivery: (item.stock ?? 0) > 0 ? '2-4' : 'a consultar',
        category: slugifyCategory(item.grupo || item.subgrupo || 'general'),
        image: (item.product_id != null ? imageByProductId.get(Number(item.product_id)) : undefined)
          ?? (item.imagen_url || undefined),
        group: item.grupo || 'General',
        subgroup: resolveSubgroup(item),
        version: item.version,
        engine: item.motor_codigo,
        stock: item.stock ?? 0,
        liquidation: Boolean(item.liquidacion),
        isUsed: Boolean(usedPart),
        donorId: usedPart?.donorId,
      }
    })
  } catch (error) {
    console.error('Error fetching catalog products:', error)
    throw error
  }
}
