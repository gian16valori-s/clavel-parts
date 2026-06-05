import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GarageVehicle {
  id: string
  user_id: string
  // FK columns (stored in DB)
  marca_id: number
  modelo_id: number
  version_id: number
  vin: string
  // Display fields (populated via JOIN, not stored)
  brand: string
  model: string
  version: string
  versionLabel: string
  engine: string
  year: string
  // Extra fields
  plate: string
  km: number
  color: string
  photo: string | null
  created_at: string
}

export interface NewVehicleInput {
  marca_id: number
  modelo_id: number
  version_id: number
  vin?: string | null
  brand?: string
  model?: string
  version?: string
  year?: string
  plate: string
  km: number
  color: string
  photo?: string | null
}

export interface GarageBitacoraEntry {
  id: string
  vehicle_id: string
  user_id: string
  date: string
  type: 'compra' | 'service' | 'reparacion' | 'revision'
  description: string
  parts: string[] | null
  cost: number
  km: number
  seller: string | null
  created_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  producto_id: number
  created_at: string
  productos?: {
    producto: string
    imagen_url: string | null
    precio: number | null
    marca_pieza: string | null
  }
}

export interface UserAlert {
  id: string
  user_id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface GarageStats {
  vehiclesCount: number
  favoritesCount: number
  alertsUnreadCount: number
}

interface RawGarageVehicleRow {
  id: string
  user_id: string
  marca_id?: number | null
  modelo_id?: number | null
  version_id?: number | null
  vin?: string | null
  brand?: string | null
  model?: string | null
  version?: string | null
  year?: string | null
  plate?: string | null
  km?: number | null
  color?: string | null
  photo?: string | null
  created_at?: string | null
}

// ─── User helpers ─────────────────────────────────────────────────────────────

export function getDisplayName(user: User): string {
  return (
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Usuario'
  )
}

export function getDisplayInitial(user: User): string {
  return (getDisplayName(user)[0] ?? user.email?.[0] ?? 'U').toUpperCase()
}

const NEW_VEHICLE_SELECTS = [
  'id, user_id, marca_id, modelo_id, version_id, vin, plate, km, color, photo',
  'id, user_id, marca_id, modelo_id, version_id, plate, km, color, photo',
]

const LEGACY_VEHICLE_SELECTS = [
  'id, user_id, brand, model, version, year, vin, plate, km, color, photo',
  'id, user_id, brand, model, version, year, plate, km, color, photo',
]

// ─── Vehicles ─────────────────────────────────────────────────────────────────

async function hydrateVehicleRows(rows: RawGarageVehicleRow[]): Promise<GarageVehicle[]> {
  const brandIds = [...new Set(rows.map((row) => row.marca_id).filter((value): value is number => typeof value === 'number'))]
  const modelIds = [...new Set(rows.map((row) => row.modelo_id).filter((value): value is number => typeof value === 'number'))]
  const versionIds = [...new Set(rows.map((row) => row.version_id).filter((value): value is number => typeof value === 'number'))]

  const [brandsRes, modelsRes, versionsRes] = await Promise.all([
    brandIds.length > 0 ? supabase.from('marcas').select('id, nombre').in('id', brandIds) : Promise.resolve({ data: [], error: null } as const),
    modelIds.length > 0 ? supabase.from('modelos').select('id, nombre').in('id', modelIds) : Promise.resolve({ data: [], error: null } as const),
    versionIds.length > 0 ? supabase.from('versiones').select('id, version, motor_codigo, anio').in('id', versionIds) : Promise.resolve({ data: [], error: null } as const),
  ])

  if (brandsRes.error) console.error('[garageService] brands lookup:', brandsRes.error.message)
  if (modelsRes.error) console.error('[garageService] models lookup:', modelsRes.error.message)
  if (versionsRes.error) console.error('[garageService] versions lookup:', versionsRes.error.message)

  const brands = new Map((brandsRes.data ?? []).map((item) => [item.id, item.nombre]))
  const models = new Map((modelsRes.data ?? []).map((item) => [item.id, item.nombre]))
  const versions = new Map((versionsRes.data ?? []).map((item) => [item.id, item]))

  return rows.map((row) => {
    const version = typeof row.version_id === 'number' ? versions.get(row.version_id) : null
    const displayBrand = typeof row.marca_id === 'number'
      ? brands.get(row.marca_id) ?? ''
      : (row.brand ?? '')
    const displayModel = typeof row.modelo_id === 'number'
      ? models.get(row.modelo_id) ?? ''
      : (row.model ?? '')
    const displayVersion = version
      ? `${version.version} ${version.motor_codigo}`.trim()
      : (row.version ?? '')
    const displayVersionLabel = version?.version ?? (row.version ?? '')
    const displayEngine = version?.motor_codigo ?? ''
    const displayYear = version?.anio != null
      ? String(version.anio)
      : (row.year ?? '')
    return {
      id: row.id,
      user_id: row.user_id,
      marca_id: row.marca_id ?? 0,
      modelo_id: row.modelo_id ?? 0,
      version_id: row.version_id ?? 0,
      vin: row.vin ?? '',
      brand: displayBrand,
      model: displayModel,
      version: displayVersion,
      versionLabel: displayVersionLabel,
      engine: displayEngine,
      year: displayYear,
      plate: row.plate ?? '',
      km: row.km ?? 0,
      color: row.color ?? '',
      photo: row.photo ?? null,
      created_at: row.created_at ?? '',
    }
  })
}

async function queryVehicleRowsByUser(userId: string, columns: string) {
  return supabase
    .from('garage_vehicles')
    .select(columns)
    .eq('user_id', userId)
    .order('id', { ascending: false })
}

async function queryVehicleRowById(vehicleId: string, columns: string) {
  return supabase
    .from('garage_vehicles')
    .select(columns)
    .eq('id', vehicleId)
    .single()
}

async function fetchVehicleRows(userId: string): Promise<RawGarageVehicleRow[]> {
  let lastError: string | null = null

  for (const columns of NEW_VEHICLE_SELECTS) {
    const { data, error } = await queryVehicleRowsByUser(userId, columns)
    if (!error) return (data ?? []) as RawGarageVehicleRow[]
    lastError = error.message
  }

  for (const columns of LEGACY_VEHICLE_SELECTS) {
    const { data, error } = await queryVehicleRowsByUser(userId, columns)
    if (!error) return (data ?? []) as RawGarageVehicleRow[]
    lastError = error.message
  }

  console.error('[garageService] getGarageVehicles:', lastError ?? 'Unknown error')
  return []
}

async function fetchVehicleRowById(vehicleId: string): Promise<RawGarageVehicleRow | null> {
  for (const columns of NEW_VEHICLE_SELECTS) {
    const { data, error } = await queryVehicleRowById(vehicleId, columns)
    if (!error && data) return data as RawGarageVehicleRow
  }

  for (const columns of LEGACY_VEHICLE_SELECTS) {
    const { data, error } = await queryVehicleRowById(vehicleId, columns)
    if (!error && data) return data as RawGarageVehicleRow
  }

  return null
}

export async function getGarageVehicles(userId: string): Promise<GarageVehicle[]> {
  const rows = await fetchVehicleRows(userId)
  return hydrateVehicleRows(rows)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getGarageStats(userId: string): Promise<GarageStats> {
  const [vehiclesRes, favoritesRes, alertsRes] = await Promise.all([
    supabase
      .from('garage_vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false),
  ])

  return {
    vehiclesCount:     vehiclesRes.count  ?? 0,
    favoritesCount:    favoritesRes.count ?? 0,
    alertsUnreadCount: alertsRes.count    ?? 0,
  }
}

// ─── Bitácora ─────────────────────────────────────────────────────────────────

export async function getBitacoraByVehicle(vehicleId: string): Promise<GarageBitacoraEntry[]> {
  const { data, error } = await supabase
    .from('garage_bitacora')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('date', { ascending: false })

  if (error) {
    console.error('[garageService] getBitacoraByVehicle:', error.message)
    return []
  }
  return (data ?? []) as GarageBitacoraEntry[]
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*, productos(producto, imagen_url, precio, marca_pieza)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[garageService] getUserFavorites:', error.message)
    return []
  }
  return (data ?? []) as UserFavorite[]
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getUserAlerts(userId: string): Promise<UserAlert[]> {
  const { data, error } = await supabase
    .from('user_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('[garageService] getUserAlerts:', error.message)
    return []
  }
  return (data ?? []) as UserAlert[]
}

export async function markAlertRead(alertId: string): Promise<void> {
  await supabase.from('user_alerts').update({ read: true }).eq('id', alertId)
}

export async function addVehicle(
  userId: string,
  vehicle: NewVehicleInput,
): Promise<{ data: GarageVehicle | null; error: string | null }> {
  const normalizedVin = vehicle.vin?.trim() ? vehicle.vin.trim().toUpperCase() : null

  const insertNewSchema = async () => {
    const { data, error } = await supabase
      .from('garage_vehicles')
      .insert({
        marca_id: vehicle.marca_id,
        modelo_id: vehicle.modelo_id,
        version_id: vehicle.version_id,
        vin: normalizedVin,
        plate: vehicle.plate,
        km: vehicle.km,
        color: vehicle.color,
        photo: vehicle.photo ?? null,
        user_id: userId,
      })
      .select(NEW_VEHICLE_SELECTS[0])
      .single()
    return { data, error }
  }

  const insertLegacySchema = async () => {
    const { data, error } = await supabase
      .from('garage_vehicles')
      .insert({
        brand: vehicle.brand ?? '',
        model: vehicle.model ?? '',
        version: vehicle.version ?? '',
        year: vehicle.year ?? '',
        vin: normalizedVin,
        plate: vehicle.plate,
        km: vehicle.km,
        color: vehicle.color,
        photo: vehicle.photo ?? null,
        user_id: userId,
      })
      .select(LEGACY_VEHICLE_SELECTS[0])
      .single()
    return { data, error }
  }

  const primary = await insertNewSchema()
  if (!primary.error && primary.data) {
    const [hydrated] = await hydrateVehicleRows([primary.data as RawGarageVehicleRow])
    return { data: hydrated, error: null }
  }

  const legacy = await insertLegacySchema()
  if (legacy.error || !legacy.data) {
    const message = primary.error?.message ?? legacy.error?.message ?? 'No se pudo guardar el auto.'
    console.error('[garageService] addVehicle:', message)
    return { data: null, error: message }
  }

  const [hydratedLegacy] = await hydrateVehicleRows([legacy.data as RawGarageVehicleRow])
  return { data: hydratedLegacy, error: null }
}

export async function updateVehicle(
  vehicleId: string,
  vehicle: NewVehicleInput,
): Promise<{ data: GarageVehicle | null; error: string | null }> {
  const normalizedVin = vehicle.vin?.trim() ? vehicle.vin.trim().toUpperCase() : null

  const updateNewSchema = async () => {
    const { data, error } = await supabase
      .from('garage_vehicles')
      .update({
        marca_id: vehicle.marca_id,
        modelo_id: vehicle.modelo_id,
        version_id: vehicle.version_id,
        vin: normalizedVin,
        plate: vehicle.plate,
        km: vehicle.km,
        color: vehicle.color,
        photo: vehicle.photo ?? null,
      })
      .eq('id', vehicleId)
      .select(NEW_VEHICLE_SELECTS[0])
      .single()

    return { data, error }
  }

  const updateLegacySchema = async () => {
    const { data, error } = await supabase
      .from('garage_vehicles')
      .update({
        brand: vehicle.brand ?? '',
        model: vehicle.model ?? '',
        version: vehicle.version ?? '',
        year: vehicle.year ?? '',
        vin: normalizedVin,
        plate: vehicle.plate,
        km: vehicle.km,
        color: vehicle.color,
        photo: vehicle.photo ?? null,
      })
      .eq('id', vehicleId)
      .select(LEGACY_VEHICLE_SELECTS[0])
      .single()

    return { data, error }
  }

  const primary = await updateNewSchema()
  if (!primary.error && primary.data) {
    const [hydrated] = await hydrateVehicleRows([primary.data as RawGarageVehicleRow])
    return { data: hydrated, error: null }
  }

  const legacy = await updateLegacySchema()
  if (legacy.error || !legacy.data) {
    const message = primary.error?.message ?? legacy.error?.message ?? 'No se pudo actualizar el auto.'
    console.error('[garageService] updateVehicle:', message)
    return { data: null, error: message }
  }

  const [hydratedLegacy] = await hydrateVehicleRows([legacy.data as RawGarageVehicleRow])
  return { data: hydratedLegacy, error: null }
}

export async function deleteVehicle(vehicleId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('garage_vehicles')
    .delete()
    .eq('id', vehicleId)

  if (error) {
    console.error('[garageService] deleteVehicle:', error.message)
    return { error: error.message }
  }

  return { error: null }
}
