import { supabase } from './supabase'

export interface TREBrand {
  id: number
  nombre: string
}

export interface TREModel {
  id: number
  nombre: string
  marca_id: number
  marca: string
}

/**
 * Devuelve las marcas que tienen al menos un producto TRE Performance activo.
 * Si la vista aún no existe o la DB está vacía, devuelve un array vacío.
 */
export async function getTREBrands(): Promise<TREBrand[]> {
  try {
    const { data, error } = await supabase
      .from('vista_tre_marcas')
      .select('id, nombre')

    if (error) throw error
    return (data as TREBrand[]) ?? []
  } catch (err) {
    console.error('Error fetching TRE brands:', err)
    return []
  }
}

/**
 * Devuelve los modelos de una marca que tienen productos TRE Performance activos.
 */
export async function getTREModelsByBrand(brandId: number): Promise<TREModel[]> {
  try {
    const { data, error } = await supabase
      .from('vista_tre_modelos')
      .select('id, nombre, marca_id, marca')
      .eq('marca_id', brandId)

    if (error) throw error
    return (data as TREModel[]) ?? []
  } catch (err) {
    console.error('Error fetching TRE models:', err)
    return []
  }
}

/**
 * Devuelve todos los productos TRE Performance (para la home y catálogo TRE).
 * Opcionalmente filtra por marca, modelo, o grupo.
 */
export async function getTREProducts(filters?: {
  marca?: string
  modelo?: string
  grupo?: string
}): Promise<import('./supabaseCatalog').CatalogProduct[]> {
  const { getCatalogProducts } = await import('./supabaseCatalog')

  try {
    let query = supabase
      .from('vista_tre_catalogo')
      .select('*')

    if (filters?.marca)  query = query.ilike('marca', filters.marca)
    if (filters?.modelo) query = query.ilike('modelo', filters.modelo)
    if (filters?.grupo)  query = query.ilike('grupo', filters.grupo)

    const { data, error } = await query.order('grupo').order('producto')

    if (error) throw error

    // Re-usa el mismo tipo que el catálogo general
    const rows = (data ?? []) as Parameters<typeof getCatalogProducts>[0] extends infer V ? never : never

    // Mapeamos manualmente para no duplicar lógica
    return ((data ?? []) as Array<{
      product_id?: number | null
      marca: string; modelo: string; anio: number; version: string; motor_codigo: string
      grupo: string; subgrupo: string; tipo_pieza: string; sku: string; producto: string
      marca_pieza: string | null; numero_parte_oem: string | null; precio: number | null
      precio_oferta: number | null; stock: number | null; liquidacion: boolean | null
      imagen_url: string | null; vendedor?: string | null; vendedor_id?: number | null
    }>).map((item, index) => ({
      id: String(item.product_id ?? `tre-${item.sku}-${index}`),
      name: item.producto,
      brand: item.marca_pieza || 'Sin marca',
      ref: item.numero_parte_oem || item.sku || 'S/N',
      price: Number(item.precio_oferta ?? item.precio ?? 0),
      seller: item.vendedor || (item.vendedor_id ? `Vendedor #${item.vendedor_id}` : 'TRE Verified'),
      sellerRating: 5,
      delivery: (item.stock ?? 0) > 0 ? '2-4' : 'a consultar',
      category: item.grupo?.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'general',
      image: item.imagen_url || undefined,
      group: item.grupo || 'General',
      subgroup: item.subgrupo || 'General',
      version: item.version,
      engine: item.motor_codigo,
      stock: item.stock ?? 0,
      liquidation: Boolean(item.liquidacion),
    }))
  } catch (err) {
    console.error('Error fetching TRE products:', err)
    return []
  }
}
