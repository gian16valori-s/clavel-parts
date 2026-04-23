import { createClient } from './supabase'
import { getVendedorActual } from './vendedorAuth'

export interface NuevoProductoInput {
  sku: string
  producto: string
  tipo_pieza: string
  marca_pieza?: string
  numero_parte_oem?: string
  precio: number
  precio_oferta?: number | null
  stock?: number
  imagen_url?: string
  liquidacion?: boolean
  activo?: boolean
}

export interface ProductoVendedorResumen {
  id: number
  sku: string
  nombre: string
  marca_pieza?: string | null
  imagen_url?: string | null
  precio: number | null
  stock: number | null
  activo: boolean | null
}

type ProductoVendedorRow = {
  id: number
  sku: string
  producto: string | null
  marca_pieza: string | null
  imagen_url: string | null
  precio: number | null
  stock: number | null
  activo: boolean | null
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export async function getProductosVendedorActual() {
  try {
    const vendedor = await getVendedorActual()
    if (!vendedor) {
      return {
        data: [] as ProductoVendedorResumen[],
        error: 'No estás habilitado como vendedor.',
      }
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('productos')
      .select('id, sku, producto, marca_pieza, imagen_url, precio, stock, activo')
      .eq('vendedor_id', vendedor.id)
      .order('id', { ascending: false })

    if (error) throw error

    const mappedData: ProductoVendedorResumen[] =
      ((data as ProductoVendedorRow[] | null) ?? []).map((item) => ({
        id: item.id,
        sku: item.sku,
        nombre: item.producto ?? 'Sin nombre',
        marca_pieza: item.marca_pieza,
        imagen_url: item.imagen_url,
        precio: item.precio,
        stock: item.stock,
        activo: item.activo,
      }))

    return {
      data: mappedData,
      error: null as string | null,
    }
  } catch (error) {
    return {
      data: [] as ProductoVendedorResumen[],
      error: getErrorMessage(error, 'No se pudieron cargar tus productos.'),
    }
  }
}

export async function crearProductoVendedor(input: NuevoProductoInput) {
  try {
    const vendedor = await getVendedorActual()
    if (!vendedor) {
      return {
        data: null,
        error: 'No estás habilitado como vendedor.',
      }
    }

    const supabase = createClient()
    const payload = {
      vendedor_id: vendedor.id,
      sku: input.sku.trim(),
      producto: input.producto.trim(),
      tipo_pieza: input.tipo_pieza.trim(),
      marca_pieza: input.marca_pieza?.trim() || null,
      numero_parte_oem: input.numero_parte_oem?.trim() || null,
      precio: Number(input.precio),
      precio_oferta: input.precio_oferta ? Number(input.precio_oferta) : null,
      stock: Number(input.stock ?? 0),
      imagen_url: input.imagen_url?.trim() || null,
      liquidacion: Boolean(input.liquidacion),
      activo: input.activo ?? true,
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([payload])
      .select()
      .single()

    if (error) {
      const rlsError = error.code === '42501' || /row-level security/i.test(error.message)

      return {
        data: null,
        error: rlsError
          ? 'RLS bloqueó la inserción. Verificá que el vendedor autenticado tenga permiso sobre `productos`.'
          : error.message,
      }
    }

    return {
      data,
      error: null as string | null,
    }
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error, 'No se pudo crear el producto.'),
    }
  }
}
