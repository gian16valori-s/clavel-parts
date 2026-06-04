import type { SelectedVehicle } from './cartStore'

const SNAPSHOT_KEY = 'clavelparts.catalog.snapshot'
const PENDING_KEY = 'clavelparts.catalog.pending-return'
const RETURN_QUERY_KEY = 'catalogReturn'

export type CatalogNavigationSnapshot = {
  vehicle: SelectedVehicle | null
  searchQuery: string
  selectedGroup: string
  selectedSubgroup: string
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function saveCatalogNavigationSnapshot(snapshot: CatalogNavigationSnapshot) {
  if (!isBrowser()) return
  window.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
  window.sessionStorage.setItem(PENDING_KEY, '1')
}

export function markCatalogReturnUrl() {
  if (!isBrowser()) return

  const url = new URL(window.location.href)
  url.searchParams.set(RETURN_QUERY_KEY, '1')
  window.history.replaceState(window.history.state, '', url.toString())
}

export function hasCatalogReturnQuery() {
  if (!isBrowser()) return false
  const url = new URL(window.location.href)
  return url.searchParams.get(RETURN_QUERY_KEY) === '1'
}

export function clearCatalogReturnQuery() {
  if (!isBrowser()) return
  const url = new URL(window.location.href)
  if (!url.searchParams.has(RETURN_QUERY_KEY)) return
  url.searchParams.delete(RETURN_QUERY_KEY)
  window.history.replaceState(window.history.state, '', url.toString())
}

export function readCatalogNavigationSnapshot(): CatalogNavigationSnapshot | null {
  if (!isBrowser()) return null

  const raw = window.sessionStorage.getItem(SNAPSHOT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as CatalogNavigationSnapshot
  } catch {
    return null
  }
}

export function consumeCatalogNavigationPending() {
  if (!isBrowser()) return false
  const pending = window.sessionStorage.getItem(PENDING_KEY) === '1'
  if (pending) {
    window.sessionStorage.removeItem(PENDING_KEY)
  }
  return pending
}