export function normalizeCategoryKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const CATEGORY_IMAGES: Record<string, string> = {
  motor: '/categories/motor.png',
  distribucion: '/categories/distribucion.png',
  lubricacion: '/categories/lubricacion.png',
  encendido: '/categories/encendido.png',
  suspension: '/categories/suspension.png',
  direccion: '/categories/direccion.png',
  frenos: '/categories/frenos.png',
  transmision: '/categories/transmision.png',
  embrague: '/categories/embrague.png',
  electricidadinterior: '/categories/electricidad.png',
  electricidad: '/categories/electricidad.png',
  interior: '/categories/interior.png',
  acycalefaccion: '/categories/aire y calefaccion.png',
  calefaccion: '/categories/aire y calefaccion.png',
  climatizacion: '/categories/aire y calefaccion.png',
  inyeccionyadmision: '/categories/inyeccion.png',
  inyeccion: '/categories/inyeccion.png',
  admision: '/categories/inyeccion.png',
  refrigeracion: '/categories/refrigeracion.png',
  escape: '/categories/escape.png',
  ruedasyneumaticos: '/categories/neumaticos y llantas.png',
  ruedas: '/categories/neumaticos y llantas.png',
  neumaticos: '/categories/neumaticos y llantas.png',
  carroceria: '/categories/carroceria.png',
  opticas: '/categories/carroceria.png',
  iluminacion: '/categories/carroceria.png',
  accesorios: '/categories/accesorios.png',
  liquidaciones: '/categories/luiquidaciones.png',
  otros: '/categories/otros.png',
  default: '/categories/otros.png',
}

export function getCategoryImage(value?: string | null) {
  if (!value) return CATEGORY_IMAGES.default
  return CATEGORY_IMAGES[normalizeCategoryKey(value)] ?? CATEGORY_IMAGES.default
}
