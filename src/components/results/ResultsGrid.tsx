'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/cartStore'
import { getCatalogProducts, type CatalogProduct } from '@/lib/supabaseCatalog'
import { getCategoryImage } from '@/lib/categoryImages'
import FiltersPanel from './FiltersPanel'
import ListingCard from './ListingCard'

const MAIN_CATEGORIES = [
  { label: 'Motor', aliases: ['Motor'] },
  { label: 'Distribución', aliases: ['Distribución'] },
  { label: 'Lubricación', aliases: ['Lubricación'] },
  { label: 'Encendido', aliases: ['Encendido'] },
  { label: 'Suspensión', aliases: ['Suspensión'] },
  { label: 'Dirección', aliases: ['Dirección'] },
  { label: 'Frenos', aliases: ['Frenos'] },
  { label: 'Transmisión', aliases: ['Transmisión'] },
  { label: 'Embrague', aliases: ['Embrague'] },
  { label: 'Electricidad', aliases: ['Electricidad'] },
  { label: 'Interior', aliases: ['Interior', 'Electricidad Interior'] },
  { label: 'A/C y Calefacción', aliases: ['A/C y Calefacción', 'Calefacción', 'Climatización'] },
  { label: 'Inyección y Admisión', aliases: ['Inyección y Admisión', 'Inyección', 'Admisión', 'Combustible / Inyección'] },
  { label: 'Refrigeración', aliases: ['Refrigeración'] },
  { label: 'Escape', aliases: ['Escape'] },
  { label: 'Ruedas y Neumáticos', aliases: ['Ruedas y Neumáticos', 'Ruedas', 'Neumáticos'] },
  { label: 'Carrocería', aliases: ['Carrocería'] },
  { label: 'Accesorios', aliases: ['Accesorios'] },
  { label: 'Liquidaciones', aliases: ['Liquidaciones'] },
  { label: 'Otros', aliases: ['Otros'] },
] as const

const CATEGORY_DETAILS: Record<string, { description: string; highlights: string[] }> = {
  Motor: {
    description: 'Explorá componentes críticos del motor con compatibilidad por versión, síntoma y motorización.',
    highlights: ['Sensores', 'Juntas', 'Bombas', 'Accesorios'],
  },
  'Distribución': {
    description: 'Entrá al detalle de correas, tensores, poleas y kit de distribución para tu versión exacta.',
    highlights: ['Correas', 'Tensores', 'Poleas', 'Kits'],
  },
  'Lubricación': {
    description: 'Filtrá consumibles y mantenimiento periódico para cuidar la vida útil del motor.',
    highlights: ['Filtros', 'Aceites', 'Tapones', 'Aditivos'],
  },
  Encendido: {
    description: 'Accedé a piezas del sistema de chispa y arranque con búsqueda más fina por subgrupo.',
    highlights: ['Bujías', 'Bobinas', 'Cables', 'Sensores'],
  },
  'Suspensión': {
    description: 'Separá repuestos de tren delantero y trasero para una navegación más específica.',
    highlights: ['Amortiguadores', 'Bujes', 'Cazoletas', 'Resortes'],
  },
  'Dirección': {
    description: 'Profundizá la búsqueda de terminales, rótulas y componentes de mando.',
    highlights: ['Terminales', 'Rótulas', 'Cremallera', 'Bombas'],
  },
  Frenos: {
    description: 'Encontrá piezas de desgaste y mantenimiento para el sistema de frenado de tu auto.',
    highlights: ['Pastillas', 'Discos', 'Sensores', 'Líquido'],
  },
  'Transmisión': {
    description: 'Repuestos para transmisión, selectora y arrastre, listos para bajar a detalle.',
    highlights: ['Homocinéticas', 'Retenes', 'Soportes', 'Mandos'],
  },
  Embrague: {
    description: 'Mostrá kits, bombines y componentes asociados para intervenir el sistema completo.',
    highlights: ['Kits', 'Bombines', 'Rulemanes', 'Volantes'],
  },
  Electricidad: {
    description: 'Abrí una capa más detallada para alternador, arranque, sensores y módulos eléctricos.',
    highlights: ['Alternador', 'Arranque', 'Sensores', 'Módulos'],
  },
  Interior: {
    description: 'Piezas y accesorios de cabina compatibles con tu versión: paneles, comandos, tapizados y detalles del habitáculo.',
    highlights: ['Paneles', 'Tapizados', 'Comandos', 'Accesorios interiores'],
  },
  'A/C y Calefacción': {
    description: 'Encontrá desde compresores hasta filtros de habitáculo y componentes de climatización.',
    highlights: ['Compresor', 'Filtro habitáculo', 'Radiador calefacción', 'Ventilación'],
  },
  'Inyección y Admisión': {
    description: 'Profundizá inyectores, cuerpos mariposa, caudalímetros y componentes de admisión.',
    highlights: ['Inyectores', 'Cuerpo mariposa', 'Caudalímetro', 'Mangueras'],
  },
  'Refrigeración': {
    description: 'Navegá radiadores, termostatos y bombas para el circuito de enfriamiento.',
    highlights: ['Radiadores', 'Termostatos', 'Bombas de agua', 'Mangueras'],
  },
  Escape: {
    description: 'Abrí la categoría para ver desde sondas hasta tramos y silenciadores.',
    highlights: ['Sondas lambda', 'Silenciadores', 'Catalizadores', 'Abrazaderas'],
  },
  'Ruedas y Neumáticos': {
    description: 'Separá llantas, neumáticos, bulonería y sensores TPMS dentro de la misma familia.',
    highlights: ['Llantas', 'Neumáticos', 'Bulones', 'Sensores TPMS'],
  },
  'Carrocería': {
    description: 'Partes exteriores y terminaciones visuales para mantener la línea original del vehículo.',
    highlights: ['Paragolpes', 'Molduras', 'Rejillas', 'Tapas'],
  },
  Accesorios: {
    description: 'Mostrá organizadores, cobertores y extras útiles para completar el auto.',
    highlights: ['Cobertores', 'Organización', 'Soportes', 'Cuidado interior'],
  },
  Liquidaciones: {
    description: 'Juntá oportunidades y saldos con descuento en un acceso rápido por categoría.',
    highlights: ['Últimas unidades', 'Ofertas', 'Promo taller', 'Descatalogados'],
  },
  Otros: {
    description: 'Agrupá piezas complementarias o difíciles de clasificar sin perder compatibilidad.',
    highlights: ['Grampas', 'Clips', 'Fijaciones', 'Misceláneos'],
  },
}

function createDemoProduct(
  id: string,
  group: string,
  subgroup: string,
  name: string,
  brand: string,
  ref: string,
  price: number,
  extra?: Partial<Pick<CatalogProduct, 'seller' | 'sellerRating' | 'delivery' | 'stock' | 'liquidation' | 'image'>>,
): CatalogProduct {
  return {
    id: `demo-${id}`,
    name,
    brand,
    ref,
    price,
    seller: extra?.seller ?? 'Clavel Demo Store',
    sellerRating: extra?.sellerRating ?? 5,
    delivery: extra?.delivery ?? '2-4',
    category: normalizeValue(group),
    image: extra?.image ?? getCategoryImage(group),
    group,
    subgroup,
    version: 'Compatible con tu versión',
    engine: 'Catálogo',
    stock: extra?.stock ?? 4,
    liquidation: extra?.liquidation ?? false,
  }
}

const SUBGROUP_HINTS: Record<string, string> = {
  Sensores: 'Temperatura, presión, RPM y control de funcionamiento.',
  Juntas: 'Tapas, retenes y sellados para armado fino.',
  Bombas: 'Aceite, vacío o alimentación según el sistema.',
  Accesorios: 'Soportes, poleas y periféricos del conjunto.',
  Discos: 'Ventilados, sólidos y opciones según eje y diámetro.',
  Pastillas: 'Compuesto, desgaste y uso diario o sport.',
  'Líquido': 'Mantenimiento hidráulico y punto de ebullición.',
  Alternador: 'Carga y regulación del sistema eléctrico.',
  Arranque: 'Impulso inicial y encendido del motor.',
  'Módulos': 'Control electrónico y funcionamiento de confort.',
  Correas: 'Distribución y auxiliares según mantenimiento.',
  Tensores: 'Tensión correcta y guiado del sistema.',
  Poleas: 'Accesorios y transmisión del movimiento.',
  Kits: 'Soluciones completas listas para instalar.',
  'Amortiguadores': 'Control del rebote y estabilidad en marcha.',
  Bujes: 'Absorción de vibraciones y juego en tren delantero.',
  Cazoletas: 'Apoyo superior del conjunto McPherson.',
  Resortes: 'Altura, carga y respuesta del vehículo.',
  'Homocinéticas': 'Transmisión de fuerza a rueda con giro y articulación.',
  Retenes: 'Sellado de aceite en caja y salidas.',
  Soportes: 'Apoyo y absorción de vibración de caja y conjunto.',
  Mandos: 'Selectora, cables y varillajes de cambio.',
  Paneles: 'Terminaciones internas de puerta y laterales.',
  Tapizados: 'Consola, fuelles y acabados de cabina.',
  Comandos: 'Botoneras, teclas y módulos de habitáculo.',
  'Accesorios interiores': 'Alfombras, organización y confort.',
}

const DEMO_CATALOG_PRODUCTS: CatalogProduct[] = [
  createDemoProduct('motor-sensor', 'Motor', 'Sensores', 'Sensor de temperatura de motor', 'Bosch', '0261230456', 28900),
  createDemoProduct('motor-junta', 'Motor', 'Juntas', 'Juego de junta tapa de válvulas', 'Elring', '476.221', 41900),
  createDemoProduct('motor-bomba', 'Motor', 'Bombas', 'Bomba de aceite alta presión', 'Pierburg', '7.07919.02', 118900),
  createDemoProduct('motor-accesorio', 'Motor', 'Accesorios', 'Soporte lateral de motor reforzado', 'Lemförder', '34756', 38400),
  createDemoProduct('motor-sensor-rpm', 'Motor', 'Sensores', 'Sensor de cigüeñal / RPM', 'Hella', '6PU 009 163-311', 45200),
  createDemoProduct('motor-junta-admision', 'Motor', 'Juntas', 'Junta múltiple de admisión', 'Victor Reinz', '71-38367-00', 23100),
  createDemoProduct('dist-correa', 'Distribución', 'Correas', 'Correa de distribución reforzada', 'Gates', 'K015PK', 56200),
  createDemoProduct('dist-tensor', 'Distribución', 'Tensores', 'Tensor automático de distribución', 'INA', '531 0760', 48800),
  createDemoProduct('lube-filtro', 'Lubricación', 'Filtros', 'Filtro de aceite premium', 'Mahle', 'OC-91', 12400),
  createDemoProduct('lube-aceite', 'Lubricación', 'Aceites', 'Aceite sintético 5W40', 'Liqui Moly', 'LM-5W40', 36900, { liquidation: true }),
  createDemoProduct('enc-bujia', 'Encendido', 'Bujías', 'Juego de bujías iridium', 'NGK', 'ILZKBR7B8G', 44800),
  createDemoProduct('enc-bobina', 'Encendido', 'Bobinas', 'Bobina de encendido individual', 'Bosch', '0986221079', 53900),
  createDemoProduct('susp-amort', 'Suspensión', 'Amortiguadores', 'Amortiguador delantero sport', 'Sachs', '312-584', 54000),
  createDemoProduct('susp-buje', 'Suspensión', 'Bujes', 'Buje de parrilla delantero', 'Lemförder', '35394', 19200),
  createDemoProduct('susp-cazoleta', 'Suspensión', 'Cazoletas', 'Cazoleta superior de amortiguador', 'SKF', 'VKDA 35623', 27400),
  createDemoProduct('susp-resorte', 'Suspensión', 'Resortes', 'Resorte delantero progresivo', 'Lesjöfors', '4095031', 48700),
  createDemoProduct('dir-terminal', 'Dirección', 'Terminales', 'Terminal de dirección exterior', 'TRW', 'JTE457', 21800),
  createDemoProduct('dir-crema', 'Dirección', 'Cremallera', 'Kit reparación cremallera', 'ZF', '7852', 68900),
  createDemoProduct('trans-homo', 'Transmisión', 'Homocinéticas', 'Homocinética rueda delantera', 'GKN', '305481', 73100),
  createDemoProduct('trans-reten', 'Transmisión', 'Retenes', 'Retén semieje caja', 'Corteco', '12015264', 13800),
  createDemoProduct('trans-soporte', 'Transmisión', 'Soportes', 'Soporte de caja de cambios hidráulico', 'Febi', '32240', 51900),
  createDemoProduct('trans-mando', 'Transmisión', 'Mandos', 'Cable selector de cambios', 'ATEC', 'CMB-130I', 44700),
  createDemoProduct('trans-reten-salida', 'Transmisión', 'Retenes', 'Retén eje de salida diferencial', 'Corteco', '12019443', 14900),
  createDemoProduct('trans-homo-int', 'Transmisión', 'Homocinéticas', 'Kit homocinética lado caja', 'SKF', 'VKJA 3022', 68800),
  createDemoProduct('embr-kit', 'Embrague', 'Kits', 'Kit de embrague completo', 'Valeo', '835067', 118000, { liquidation: true }),
  createDemoProduct('embr-bombin', 'Embrague', 'Bombines', 'Bombín concéntrico hidráulico', 'Sachs', '3182998801', 86400),
  createDemoProduct('freno-disco-sport', 'Frenos', 'Discos', 'Disco de freno delantero ventilado sport', 'Zimmermann', '150.2905.20', 58400),
  createDemoProduct('freno-pastilla-cer', 'Frenos', 'Pastillas', 'Pastillas de freno cerámicas traseras', 'Brembo', 'P06099N', 33800),
  createDemoProduct('freno-liquido-dot4', 'Frenos', 'Líquido', 'Líquido de frenos DOT 4 LV', 'ATE', '706202', 12900, { liquidation: true }),
  createDemoProduct('freno-sensor-desgaste', 'Frenos', 'Sensores', 'Sensor de desgaste de pastillas', 'Textar', '98044300', 8900),
  createDemoProduct('elec-alt', 'Electricidad', 'Alternador', 'Alternador 120A remanufacturado', 'Bosch', '0121715001', 149000),
  createDemoProduct('elec-sensor', 'Electricidad', 'Sensores', 'Sensor ABS delantero', 'ATE', '24.0711', 33800),
  createDemoProduct('elec-arranque', 'Electricidad', 'Arranque', 'Motor de arranque 1.4kW', 'Valeo', '438329', 127000),
  createDemoProduct('elec-modulo', 'Electricidad', 'Módulos', 'Módulo confort levantavidrios', 'Hella', '5DK 008 214-00', 69200),
  createDemoProduct('int-panel', 'Interior', 'Paneles', 'Panel interior de puerta delantera', 'BMW', '51419123456', 98000, { seller: 'Cabina Premium', stock: 2 }),
  createDemoProduct('int-comando', 'Interior', 'Comandos', 'Botonera levantavidrios conductor', 'BMW', '61319217332', 42900, { seller: 'Cabina Premium', stock: 5 }),
  createDemoProduct('int-tapizado', 'Interior', 'Tapizados', 'Fuelle y perilla de cambios', 'BMW', '25117527252', 38900, { seller: 'Cabina Premium' }),
  createDemoProduct('int-alfombra', 'Interior', 'Accesorios interiores', 'Juego de alfombras premium habitáculo', '3D Mats', '82112410888', 32900, { seller: 'Cabina Premium', liquidation: true, stock: 7 }),
  createDemoProduct('ac-compresor', 'A/C y Calefacción', 'Compresor', 'Compresor de aire acondicionado', 'Denso', '447220-8021', 176000),
  createDemoProduct('ac-filtro', 'A/C y Calefacción', 'Filtro habitáculo', 'Filtro de cabina anti-polen', 'Mann', 'CUK 8430', 18400),
  createDemoProduct('adm-mariposa', 'Inyección y Admisión', 'Cuerpo mariposa', 'Cuerpo mariposa electrónico', 'VDO', 'A2C59511698', 132000),
  createDemoProduct('adm-inyector', 'Inyección y Admisión', 'Inyectores', 'Inyector de combustible', 'Bosch', '0280158117', 61300),
  createDemoProduct('refr-radiador', 'Refrigeración', 'Radiadores', 'Radiador principal aluminio', 'Nissens', '60682A', 147000),
  createDemoProduct('refr-termo', 'Refrigeración', 'Termostatos', 'Termostato completo con carcasa', 'Behr', 'TX 26 95D', 52900),
  createDemoProduct('escape-sonda', 'Escape', 'Sondas lambda', 'Sonda lambda pre-catalizador', 'Bosch', '0258017025', 67900),
  createDemoProduct('escape-silen', 'Escape', 'Silenciadores', 'Silenciador trasero deportivo', 'Walker', '73058', 139000),
  createDemoProduct('rueda-llanta', 'Ruedas y Neumáticos', 'Llantas', 'Llanta original 17” M Sport', 'BMW', '36116855123', 215000),
  createDemoProduct('rueda-neumatico', 'Ruedas y Neumáticos', 'Neumáticos', 'Neumático 225/45 R17', 'Pirelli', 'P7C2-22545R17', 184000),
  createDemoProduct('carro-rejilla', 'Carrocería', 'Rejillas', 'Rejilla frontal riñón negra', 'BMW', '51137201967', 46800),
  createDemoProduct('carro-espejo', 'Carrocería', 'Molduras', 'Tapa espejo exterior imprimada', 'TYC', '337-0123', 25900),
  createDemoProduct('carro-paragolpe', 'Carrocería', 'Paragolpes', 'Paragolpe delantero imprimado', 'Tong Yang', 'TYG-BM-130F', 186000),
  createDemoProduct('carro-tapa', 'Carrocería', 'Tapas', 'Tapa gancho paragolpe delantera', 'BMW', '51117134090', 14900),
  createDemoProduct('acc-cobertor', 'Accesorios', 'Cobertores', 'Cobertor exterior impermeable', 'Cover Pro', 'CP-BMW1', 34500),
  createDemoProduct('acc-soporte', 'Accesorios', 'Soportes', 'Soporte magnético celular rejilla', 'Baseus', 'SUCC0001', 14900, { liquidation: true }),
  createDemoProduct('otros-grampa', 'Otros', 'Grampas', 'Kit de grampas plásticas universales', 'FixPro', 'GRP-120', 9600),
  createDemoProduct('otros-clip', 'Otros', 'Clips', 'Clips de fijación interior x20', 'FixPro', 'CLP-20', 7800),
]

function normalizeValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function matchesCategory(product: CatalogProduct, category: string) {
  if (category === 'TODOS') return true
  if (category === 'Liquidaciones') return product.liquidation

  const categoryConfig = MAIN_CATEGORIES.find((item) => item.label === category)
  if (!categoryConfig) return product.group === category

  const normalizedGroup = normalizeValue(product.group)
  return categoryConfig.aliases.some((alias) => normalizeValue(alias) === normalizedGroup)
}

function getCategoryDetail(category: string) {
  return CATEGORY_DETAILS[category] ?? {
    description: `Explorá repuestos compatibles dentro de ${category.toLowerCase()} para tu vehículo.`,
    highlights: [] as string[],
  }
}

export default function ResultsGrid() {
  const { vehicle, searchQuery, setView, cartCount } = useAppStore()
  const [toast, setToast] = useState(false)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState('TODOS')
  const [selectedSubgroup, setSelectedSubgroup] = useState('TODOS')

  useEffect(() => {
    const loadProducts = async () => {
      if (!vehicle && !searchQuery) {
        setProducts([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const items = await getCatalogProducts(vehicle, searchQuery)
        setProducts(items)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los repuestos desde Supabase.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [vehicle, searchQuery])

  useEffect(() => {
    setSelectedGroup('TODOS')
    setSelectedSubgroup('TODOS')
  }, [vehicle?.brand, vehicle?.model, vehicle?.year, vehicle?.engine, searchQuery])

  useEffect(() => {
    setSelectedSubgroup('TODOS')
  }, [selectedGroup])

  function showToast() {
    setToast(true)
    setTimeout(() => setToast(false), 2200)
  }

  const categoryDetail = useMemo(() => getCategoryDetail(selectedGroup), [selectedGroup])

  const catalogProducts = useMemo(() => {
    if (!vehicle || searchQuery) return products

    const missingCategoryProducts = MAIN_CATEGORIES
      .filter((category) => category.label !== 'Liquidaciones')
      .flatMap((category) => {
        const hasCategoryData = products.some((product) => matchesCategory(product, category.label))
        if (hasCategoryData) return []

        return DEMO_CATALOG_PRODUCTS.filter((demoProduct) => matchesCategory(demoProduct, category.label))
      })

    return [...products, ...missingCategoryProducts]
  }, [products, vehicle, searchQuery])

  const groups = useMemo(
    () => ['TODOS', ...MAIN_CATEGORIES.map((category) => category.label)],
    []
  )

  const subgroups = useMemo(() => {
    const filteredByGroup = selectedGroup === 'TODOS'
      ? catalogProducts
      : catalogProducts.filter((product) => matchesCategory(product, selectedGroup))

    return ['TODOS', ...Array.from(new Set(filteredByGroup.map((product) => product.subgroup)))].filter(Boolean)
  }, [catalogProducts, selectedGroup])

  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((product) => {
      const matchesGroupFilter = matchesCategory(product, selectedGroup)
      const matchesSubgroup = selectedSubgroup === 'TODOS' || product.subgroup === selectedSubgroup
      return matchesGroupFilter && matchesSubgroup
    })
  }, [catalogProducts, selectedGroup, selectedSubgroup])

  const groupCards = useMemo(
    () => MAIN_CATEGORIES.map((category) => ({
      name: category.label,
      count: catalogProducts.filter((product) => matchesCategory(product, category.label)).length,
      image: getCategoryImage(category.label),
    })),
    [catalogProducts]
  )

  const subgroupCards = useMemo(
    () => subgroups
      .filter((subgroup) => subgroup !== 'TODOS')
      .map((subgroup) => ({
        name: subgroup,
        hint: SUBGROUP_HINTS[subgroup] ?? 'Entrá para ver piezas compatibles dentro de esta familia.',
        count: catalogProducts.filter((product) => {
          const matchesGroupFilter = matchesCategory(product, selectedGroup)
          return matchesGroupFilter && product.subgroup === subgroup
        }).length,
      })),
    [subgroups, catalogProducts, selectedGroup]
  )

  const vehicleLabel = vehicle
    ? `${vehicle.brand} ${vehicle.model} · ${vehicle.engine} · ${vehicle.year}`
    : searchQuery
      ? `Búsqueda general · ${searchQuery}`
      : 'Tu vehículo'

  return (
    <div
      id="results-page"
      className="fixed inset-0 z-[400] overflow-y-auto"
      style={{ background: 'var(--dark)' }}
    >
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-10 border-b-2"
        style={{ background: 'var(--dark2)', height: 64, borderColor: 'var(--dark3)' }}
      >
        <button
          className="flex items-center gap-2 font-condensed font-bold uppercase tracking-[0.06em] transition-colors duration-200"
          style={{ background: 'none', border: 'none', color: 'var(--gray2)', fontSize: '0.95rem', cursor: 'pointer' }}
          onClick={() => setView('home')}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--yellow)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray2)')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[18px] h-[18px]">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 5 5 12 12 19"/>
          </svg>
          VOLVER
        </button>

        <div
          className="flex items-center gap-2 px-4 py-[0.4rem] rounded-[20px] font-condensed font-bold uppercase tracking-[0.05em]"
          style={{
            background: 'var(--dark3)',
            border: '1px solid var(--dark4)',
            fontSize: '0.88rem',
            color: 'var(--yellow)',
          }}
        >
          🚗 {vehicleLabel}
        </div>

        <div
          className="font-condensed font-bold uppercase tracking-[0.06em]"
          style={{ fontSize: '0.9rem', color: 'var(--gray)' }}
        >
          CATÁLOGO COMPATIBLE
        </div>
      </div>

      <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {selectedGroup !== 'TODOS' && (
          <FiltersPanel
            groups={groups}
            subgroups={subgroups}
            selectedGroup={selectedGroup}
            selectedSubgroup={selectedSubgroup}
            onSelectGroup={setSelectedGroup}
            onSelectSubgroup={setSelectedSubgroup}
          />
        )}

        <main className="flex-1 p-8" style={{ background: 'var(--light-bg)' }}>
          <div className="flex items-center justify-between mb-6">
            <div
              className="font-condensed font-bold uppercase tracking-[0.05em]"
              style={{ fontSize: '1.1rem', color: 'var(--text-dark)' }}
            >
              {selectedGroup === 'TODOS' ? (
                <>
                  <strong style={{ color: 'var(--yellow)' }}>{groupCards.length}</strong>{' '}
                  {searchQuery && !vehicle
                    ? `categorías disponibles para “${searchQuery}”`
                    : `categorías disponibles para tu ${vehicle?.brand ?? 'vehículo'}`}
                </>
              ) : selectedSubgroup === 'TODOS' ? (
                <>
                  <strong style={{ color: 'var(--yellow)' }}>{subgroupCards.length}</strong> subcategorías dentro de {selectedGroup}
                </>
              ) : (
                <>
                  <strong style={{ color: 'var(--yellow)' }}>{filteredProducts.length}</strong> repuestos en {selectedSubgroup}
                </>
              )}
            </div>
            <div
              className="font-condensed font-semibold uppercase tracking-[0.06em]"
              style={{ fontSize: '0.85rem', color: 'var(--slate)' }}
            >
              {selectedGroup !== 'TODOS'
                ? selectedSubgroup !== 'TODOS'
                  ? `SUBGRUPO: ${selectedSubgroup}`
                  : `GRUPO: ${selectedGroup}`
                : searchQuery
                  ? `BÚSQUEDA: ${searchQuery}`
                  : 'ELEGÍ UNA CATEGORÍA'}
            </div>
          </div>

          {loading ? (
            <div className="rounded-md p-6" style={{ background: 'var(--light-card)', border: '1px solid #d9dde3', color: 'var(--text-dark)' }}>
              Cargando repuestos desde Supabase...
            </div>
          ) : error ? (
            <div className="rounded-md p-6" style={{ background: 'rgba(220,38,38,0.1)', color: '#fca5a5' }}>
              {error}
            </div>
          ) : catalogProducts.length === 0 ? (
            <div className="rounded-md p-6" style={{ background: 'var(--light-card)', border: '1px solid #d9dde3', color: 'var(--text-dark)' }}>
              No hay repuestos cargados para esa combinación de vehículo, categoría o búsqueda.
            </div>
          ) : selectedGroup === 'TODOS' ? (
            <>
              <div
                className="rounded-md p-5 mb-6"
                style={{ background: 'var(--light-card)', border: '1px solid #d9dde3', color: 'var(--text-dark)' }}
              >
                Elegí una categoría para ver los repuestos compatibles con tu vehículo.
              </div>

              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {groupCards.map((group) => {
                  const disabled = group.count === 0

                  return (
                    <button
                      key={group.name}
                      onClick={() => {
                        if (!disabled) setSelectedGroup(group.name)
                      }}
                      className="rounded-md p-5 text-center transition-all duration-200"
                      style={{
                        background: 'var(--light-card)',
                        border: '1px solid #d9dde3',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: 1,
                      }}
                      onMouseEnter={(e) => {
                        if (disabled) return
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--yellow)'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'none'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#d9dde3'
                      }}
                    >
                      <div
                        className="relative mb-4 overflow-hidden rounded-md"
                        style={{ height: 170, background: '#f8f9fb' }}
                      >
                        <Image
                          src={group.image}
                          alt={group.name}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      </div>
                      <div className="font-condensed font-extrabold uppercase" style={{ fontSize: '1rem', color: 'var(--text-dark)', lineHeight: 1.2 }}>
                        {group.name}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => {
                    setSelectedGroup('TODOS')
                    setSelectedSubgroup('TODOS')
                  }}
                  className="font-condensed font-bold uppercase"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--dark4)',
                    color: 'var(--gray2)',
                    padding: '0.45rem 0.8rem',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  ← Volver a categorías
                </button>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>
                  {selectedGroup} {selectedSubgroup !== 'TODOS' ? `· ${selectedSubgroup}` : ''}
                </div>
              </div>

              <div
                className="rounded-xl border p-4 mb-6"
                style={{ background: 'var(--light-card)', borderColor: '#d9dde3' }}
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div
                    className="relative overflow-hidden rounded-md shrink-0"
                    style={{ width: 120, height: 90, background: '#f8f9fb' }}
                  >
                    <Image
                      src={getCategoryImage(selectedGroup)}
                      alt={selectedGroup}
                      fill
                      className="object-contain p-2"
                      sizes="120px"
                    />
                  </div>

                  <div>
                    <div
                      className="font-condensed font-extrabold uppercase"
                      style={{ fontSize: '1rem', color: 'var(--text-dark)' }}
                    >
                      {selectedGroup} · catálogo detallado
                    </div>
                    <p className="mt-1" style={{ color: 'var(--slate)', fontSize: '0.92rem' }}>
                      {categoryDetail.description}
                    </p>

                    {categoryDetail.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {categoryDetail.highlights.map((highlight) => {
                          const hasHighlight = subgroups.includes(highlight)

                          return (
                            <button
                              key={highlight}
                              type="button"
                              onClick={() => {
                                if (hasHighlight) setSelectedSubgroup(highlight)
                              }}
                              className="rounded-full px-3 py-1 font-condensed font-bold uppercase"
                              style={{
                                background: hasHighlight ? 'rgba(240,224,64,0.12)' : '#f4f6f8',
                                border: `1px solid ${hasHighlight ? 'rgba(240,224,64,0.3)' : '#d9dde3'}`,
                                color: hasHighlight ? '#8a6d00' : 'var(--slate)',
                                cursor: hasHighlight ? 'pointer' : 'default',
                                fontSize: '0.76rem',
                              }}
                            >
                              {highlight}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {subgroupCards.length > 0 && (
                <div className="mb-8">
                  <div
                    className="font-condensed font-extrabold uppercase tracking-[0.1em] mb-3"
                    style={{ fontSize: '0.82rem', color: 'var(--slate)' }}
                  >
                    SUBCATEGORÍAS
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <button
                      onClick={() => setSelectedSubgroup('TODOS')}
                      className="rounded-md px-4 py-3 text-left transition-all duration-200"
                      style={{
                          background: selectedSubgroup === 'TODOS' ? 'rgba(240,224,64,0.12)' : 'var(--light-card)',
                          border: `1px solid ${selectedSubgroup === 'TODOS' ? 'rgba(240,224,64,0.3)' : '#d9dde3'}`,
                          color: selectedSubgroup === 'TODOS' ? '#8a6d00' : 'var(--text-dark)',
                        cursor: 'pointer',
                      }}
                    >
                      TODOS
                    </button>
                    {subgroupCards.map((subgroup) => (
                      <button
                        key={subgroup.name}
                        onClick={() => setSelectedSubgroup(subgroup.name)}
                        className="rounded-md px-4 py-3 text-left transition-all duration-200"
                        style={{
                          background: selectedSubgroup === subgroup.name ? 'rgba(240,224,64,0.12)' : 'var(--light-card)',
                          border: `1px solid ${selectedSubgroup === subgroup.name ? 'rgba(240,224,64,0.3)' : '#d9dde3'}`,
                          color: selectedSubgroup === subgroup.name ? '#8a6d00' : 'var(--text-dark)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="font-condensed font-bold uppercase" style={{ fontSize: '0.85rem' }}>
                          {subgroup.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {subgroup.count} item{subgroup.count !== 1 ? 's' : ''}
                        </div>
                        <div style={{ fontSize: '0.72rem', marginTop: '0.35rem', color: 'var(--slate)' }}>
                          {subgroup.hint}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="rounded-md p-6" style={{ background: 'var(--light-card)', border: '1px solid #d9dde3', color: 'var(--text-dark)' }}>
                  No hay repuestos cargados en esa subcategoría.
                </div>
              ) : (
                <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {filteredProducts.map((product) => (
                    <ListingCard key={product.id} product={product} onAdded={showToast} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {cartCount() > 0 && (
        <button
          onClick={() => setView('cart')}
          className="fixed z-[410] flex items-center gap-2 font-condensed font-black italic uppercase transition-transform duration-150 hover:-translate-y-0.5"
          style={{
            bottom: '5.5rem',
            right: '2rem',
            background: 'var(--yellow)',
            color: 'var(--text-dark)',
            border: 'none',
            borderRadius: '50px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(240,224,64,0.3)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          VER CARRITO
          <span
            className="flex items-center justify-center rounded-full font-extrabold"
            style={{
              background: 'var(--text-dark)',
              color: 'var(--yellow)',
              width: 22,
              height: 22,
              fontSize: '0.75rem',
            }}
          >
            {cartCount()}
          </span>
        </button>
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>
        ✓ Agregado al carrito
      </div>
    </div>
  )
}
