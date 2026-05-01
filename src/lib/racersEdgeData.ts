// ─────────────────────────────────────────────
//  THE RACER'S EDGE — Data & Types
// ─────────────────────────────────────────────

export type RECategory =
  | 'motor'
  | 'turbo'
  | 'frenos'
  | 'suspension'
  | 'escape'
  | 'llantas'
  | 'body'
  | 'interior'
  | 'electronica'

export type RECompat = 'exact' | 'compat' | 'univ'

export interface REProduct {
  id: number
  category: RECategory
  brand: string
  name: string
  specs?: string
  price: number
  priceUnit?: string
  emoji: string
  compat: RECompat
  tag?: 'TOP SELLER' | 'NUEVO' | 'OFERTA'
  universal?: boolean
}

export interface REVehicle {
  brand: string
  model: string
  year: number
}

// ── Category metadata ──────────────────────────
export const RE_CATEGORIES: {
  key: RECategory | 'todos'
  label: string
  emoji: string
}[] = [
  { key: 'todos',       label: 'Todos',            emoji: '🏁' },
  { key: 'motor',       label: 'Motor',             emoji: '🔧' },
  { key: 'turbo',       label: 'Turbo / Inducción', emoji: '💨' },
  { key: 'frenos',      label: 'Frenos',            emoji: '🔴' },
  { key: 'suspension',  label: 'Suspensión',        emoji: '⚙️' },
  { key: 'escape',      label: 'Escape',            emoji: '🔊' },
  { key: 'llantas',     label: 'Llantas',           emoji: '⭕' },
  { key: 'body',        label: 'Body Kit',          emoji: '🏎️' },
  { key: 'interior',    label: 'Interior',          emoji: '🪑' },
  { key: 'electronica', label: 'Electrónica',       emoji: '📡' },
]

export const CATEGORY_COLOR: Record<RECategory, string> = {
  motor:       '#e05a20',
  turbo:       '#cc1111',
  frenos:      '#cc3300',
  suspension:  '#aa6600',
  escape:      '#888888',
  llantas:     '#4488cc',
  body:        '#9944cc',
  interior:    '#44aa66',
  electronica: '#2299cc',
}

export const COMPAT_LABEL: Record<RECompat, string> = {
  exact: 'FIT EXACTO',
  compat: 'COMPATIBLE',
  univ: 'UNIVERSAL',
}

export const COMPAT_STYLE: Record<RECompat, React.CSSProperties> = {
  exact:  { background: 'rgba(68,204,136,0.15)',  color: '#44cc88', borderColor: 'rgba(68,204,136,0.35)' },
  compat: { background: 'rgba(240,224,64,0.12)',  color: '#f0e040', borderColor: 'rgba(240,224,64,0.30)' },
  univ:   { background: 'rgba(100,160,255,0.12)', color: '#80aaff', borderColor: 'rgba(100,160,255,0.30)' },
}

// ── Vehicle catalog for selector ───────────────
export const VEHICLE_CATALOG: Record<string, { models: string[]; years: number[] }> = {
  Nissan: {
    models: ['Skyline GT-R', '350Z', '370Z', 'Silvia S15', '180SX', 'Sentra SE-R'],
    years: [2023,2022,2021,2020,2019,2018,2015,2012,2010,2005,2002,1999,1998,1995,1993,1990],
  },
  Toyota: {
    models: ['Supra A80', 'GR86', 'Corolla AE86', 'MR2', 'Chaser JZX100'],
    years: [2023,2022,2021,2020,2019,2018,2015,2012,2005,2002,1999,1998,1995],
  },
  Mitsubishi: {
    models: ['Lancer Evo IX', 'Eclipse GSX', '3000GT VR-4'],
    years: [2023,2022,2020,2018,2015,2010,2007,2005,2002,1999,1996],
  },
  Subaru: {
    models: ['Impreza WRX STI', 'BRZ', 'Legacy GT'],
    years: [2023,2022,2021,2020,2019,2018,2015,2012,2010,2007,2005,2002,1999],
  },
  Honda: {
    models: ['Civic Type R', 'NSX NA1', 'Integra Type R', 'S2000'],
    years: [2023,2022,2021,2020,2019,2018,2015,2012,2010,2007,2005,2002,2000,1999],
  },
  Mazda: {
    models: ['RX-7 FD3S', 'MX-5 NA', 'RX-8'],
    years: [2023,2022,2021,2020,2015,2012,2010,2007,2002,1999,1997,1993,1990],
  },
  BMW: {
    models: ['M3 E46', 'M2 F87', '135i E82', 'M4 F82'],
    years: [2023,2022,2021,2020,2019,2018,2015,2012,2010,2007,2005,2002],
  },
  Ford: {
    models: ['Mustang GT', 'Focus RS', 'Fiesta ST'],
    years: [2023,2022,2021,2020,2019,2018,2016,2015,2012,2010,2007],
  },
}

// ── Hero slides ────────────────────────────────
export interface REHeroSlide {
  id: number
  eyebrow: string
  title: string[]      // each item = one line
  description: string
  cta: string
  emoji: string
  badgeText: string
  badgeBg: string
  badgeColor: string
  badgeBorder: string
  stripeColor: string
}

export const HERO_SLIDES: REHeroSlide[] = [
  {
    id: 0,
    eyebrow: 'Lanzamiento exclusivo · Mayo 2025',
    title: ['HKS GT', 'Full', 'Turbo Kit'],
    description: 'El sistema completo de turboalimentación para RB26 con intercooler, piping y BOV. Hasta 520HP garantizados.',
    cta: 'VER PRODUCTO →',
    emoji: '💨',
    badgeText: 'NUEVO',
    badgeBg: 'rgba(204,17,17,0.2)',
    badgeColor: '#ff5555',
    badgeBorder: 'rgba(204,17,17,0.4)',
    stripeColor: '#cc1111',
  },
  {
    id: 1,
    eyebrow: 'Oferta por tiempo limitado',
    title: ['Tein', 'Super', 'Street'],
    description: 'Coilovers altura y dureza ajustable. Compatibilidad ampliada: más de 200 modelos disponibles en stock local.',
    cta: 'VER OFERTA →',
    emoji: '⚙️',
    badgeText: '25% OFF',
    badgeBg: 'rgba(68,136,204,0.2)',
    badgeColor: '#80aaff',
    badgeBorder: 'rgba(68,136,204,0.4)',
    stripeColor: '#4488cc',
  },
  {
    id: 2,
    eyebrow: 'Top seller · Stock disponible',
    title: ['RAYS', 'Volk', 'TE37 SL'],
    description: 'El aro más icónico del JDM tuning. Forjado en una sola pieza, 18" en múltiples offsets. Envío desde Japón.',
    cta: 'EXPLORAR LLANTAS →',
    emoji: '⭕',
    badgeText: 'TOP SELLER',
    badgeBg: 'rgba(240,224,64,0.15)',
    badgeColor: '#f0e040',
    badgeBorder: 'rgba(240,224,64,0.35)',
    stripeColor: '#f0e040',
  },
  {
    id: 3,
    eyebrow: 'Combo exclusivo The Racer\'s Edge',
    title: ['Brembo', 'GT Big', 'Brake Kit'],
    description: '6 pistones, discos de 355mm y pastillas racing incluidas. El upgrade de frenado más brutal del mercado.',
    cta: 'VER COMBO →',
    emoji: '🔴',
    badgeText: 'COMBO',
    badgeBg: 'rgba(204,51,0,0.2)',
    badgeColor: '#ff6644',
    badgeBorder: 'rgba(204,51,0,0.4)',
    stripeColor: '#cc3300',
  },
]

// ── Products ───────────────────────────────────
export const reProducts: REProduct[] = [
  {
    id: 1,
    category: 'turbo',
    brand: 'HKS',
    name: 'GT2530 Turbo Kit',
    specs: 'RB26DETT · up to 450HP',
    price: 2850000,
    emoji: '💨',
    compat: 'exact',
    tag: 'TOP SELLER',
  },
  {
    id: 2,
    category: 'turbo',
    brand: 'Garrett',
    name: 'G25-660 Turbocharger',
    specs: 'Adaptable RB / SR / CA',
    price: 1990000,
    emoji: '💨',
    compat: 'compat',
  },
  {
    id: 3,
    category: 'turbo',
    brand: 'TiAL',
    name: 'BOV Q Blow-off Valve',
    specs: 'Universal 38–52mm',
    price: 320000,
    emoji: '💨',
    compat: 'univ',
    universal: true,
  },
  {
    id: 4,
    category: 'suspension',
    brand: 'Tein',
    name: 'Super Street Coilovers',
    specs: 'BNR32 · Full Kit',
    price: 1650000,
    emoji: '⚙️',
    compat: 'exact',
    tag: 'OFERTA',
  },
  {
    id: 5,
    category: 'frenos',
    brand: 'Brembo',
    name: 'GT Big Brake Kit',
    specs: '6 pistones · 355mm',
    price: 3200000,
    emoji: '🔴',
    compat: 'exact',
  },
  {
    id: 6,
    category: 'frenos',
    brand: 'Project Mu',
    name: 'B-Spec Racing Pads',
    specs: 'Universal disc ≥300mm',
    price: 185000,
    emoji: '🔴',
    compat: 'univ',
    universal: true,
  },
  {
    id: 7,
    category: 'escape',
    brand: 'HKS',
    name: 'Hi-Power Exhaust',
    specs: 'BNR32 · cat-back',
    price: 890000,
    emoji: '🔊',
    compat: 'exact',
  },
  {
    id: 8,
    category: 'llantas',
    brand: 'RAYS',
    name: 'Volk TE37 SL 18"',
    specs: '18x9.5 +22 · 5x114.3',
    price: 2100000,
    emoji: '⭕',
    compat: 'compat',
    tag: 'TOP SELLER',
  },
  {
    id: 9,
    category: 'motor',
    brand: 'Tomei',
    name: 'Camshaft PONCAM Set',
    specs: 'RB26DETT · IN/EX',
    price: 720000,
    emoji: '🔧',
    compat: 'exact',
    tag: 'NUEVO',
  },
  {
    id: 10,
    category: 'interior',
    brand: 'Bride',
    name: 'Zeta III Racing Seat',
    specs: 'Universal · FIA homol.',
    price: 1450000,
    emoji: '🪑',
    compat: 'univ',
    universal: true,
  },
  {
    id: 11,
    category: 'electronica',
    brand: 'Defi',
    name: 'BF Boost Gauge 60mm',
    specs: 'Universal · 0-200kPa',
    price: 215000,
    emoji: '📡',
    compat: 'univ',
    universal: true,
  },
  {
    id: 12,
    category: 'motor',
    brand: 'Nismo',
    name: 'Fuel Injector Set 740cc',
    specs: 'RB26DETT · 6-pack',
    price: 580000,
    emoji: '🔧',
    compat: 'exact',
  },
  {
    id: 13,
    category: 'body',
    brand: 'Varis',
    name: 'Arising-II Front Bumper',
    specs: 'BNR32 · FRP',
    price: 1250000,
    emoji: '🏎️',
    compat: 'exact',
    tag: 'NUEVO',
  },
  {
    id: 14,
    category: 'electronica',
    brand: 'HKS',
    name: 'F-CON iS ECU',
    specs: 'RB26DETT · piggyback',
    price: 980000,
    emoji: '📡',
    compat: 'exact',
  },
  {
    id: 15,
    category: 'suspension',
    brand: 'Cusco',
    name: 'Strut Bar Front',
    specs: 'Universal bolt-on 50mm',
    price: 290000,
    emoji: '⚙️',
    compat: 'compat',
  },
]

// ── Promos ─────────────────────────────────────
export interface REPromo {
  id: number
  tag: string
  tagBg: string
  tagColor: string
  tagBorder: string
  name: string
  description: string
  priceFrom?: number
  pricePrev?: number
  priceNow: number
  emoji: string
  accentColor: string
  wide?: boolean
  discountPct?: number
}

export const RE_PROMOS: REPromo[] = [
  {
    id: 1,
    tag: 'LIQUIDACIÓN DE INVIERNO',
    tagBg: 'rgba(204,17,17,0.2)',
    tagColor: '#ff5555',
    tagBorder: 'rgba(204,17,17,0.4)',
    name: 'Motor & Inducción — 20% OFF',
    description: 'Turbos, intercoolers, filtros de alto flujo y pistones seleccionados. Liquidamos stock antes de los nuevos ingresos de Japón.',
    pricePrev: 850000,
    priceNow: 680000,
    emoji: '🔧',
    accentColor: '#cc1111',
    wide: true,
    discountPct: 20,
  },
  {
    id: 2,
    tag: 'COMBO LLANTAS',
    tagBg: 'rgba(68,136,204,0.2)',
    tagColor: '#80aaff',
    tagBorder: 'rgba(68,136,204,0.4)',
    name: 'Juego x4 + Neumáticos',
    description: 'RAYS TE37 + Yokohama Advan. El combo definitivo para la pista.',
    pricePrev: 5800000,
    priceNow: 4990000,
    emoji: '⭕',
    accentColor: '#4488cc',
  },
  {
    id: 3,
    tag: 'NUEVO INGRESO',
    tagBg: 'rgba(240,224,64,0.12)',
    tagColor: '#f0e040',
    tagBorder: 'rgba(240,224,64,0.3)',
    name: 'Bride & Sparco Interior',
    description: 'Butacas, volantes y arneses homologados FIA. Stock limitado, sin previo aviso.',
    priceNow: 890000,
    emoji: '🪑',
    accentColor: '#f0e040',
  },
]
