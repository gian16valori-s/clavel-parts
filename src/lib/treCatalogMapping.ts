import type { CatalogProduct } from './supabaseCatalog'
import type { RECategory } from './racersEdgeData'

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function toNumericId(value: string) {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

export function resolveTRECategory(group: string, subgroup: string): RECategory {
  const value = normalizeText(`${group} ${subgroup}`)

  if (value.includes('turbo') || value.includes('induccion') || value.includes('intercooler')) return 'turbo'
  if (value.includes('freno')) return 'frenos'
  if (value.includes('susp') || value.includes('amort') || value.includes('coilover')) return 'suspension'
  if (value.includes('escape') || value.includes('exhaust')) return 'escape'
  if (value.includes('llanta') || value.includes('rueda') || value.includes('wheel') || value.includes('aro')) return 'llantas'
  if (value.includes('body') || value.includes('carroceria') || value.includes('aero')) return 'body'
  if (value.includes('interior') || value.includes('asiento') || value.includes('cabina')) return 'interior'
  if (value.includes('electron') || value.includes('ecu') || value.includes('sensor')) return 'electronica'
  return 'motor'
}

export function mapCatalogProductToTREProduct(product: CatalogProduct) {
  return {
    id: toNumericId(product.id),
    category: resolveTRECategory(product.group, product.subgroup),
    brand: product.brand,
    name: product.name,
    specs: [product.group, product.subgroup, product.ref].filter(Boolean).join(' · '),
    price: product.price,
    emoji: product.image ? '🖼️' : '🏁',
    compat: product.engine ? 'exact' : 'compat',
    universal: false,
  } as const
}
