// Seed TRE via supabase-js (no direct DB connection needed)
// Requiere que el DDL ya fue aplicado (tre_ddl_only.sql)

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\n❌ Faltan variables de entorno para Supabase.')
  console.error('   Requeridas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const ok  = (m) => console.log(`  ✅ ${m}`)
const err = (m) => console.error(`  ❌ ${m}`)
const log = (m) => console.log(`     ${m}`)

// ── Verify familia column exists before running ──
const { data: colCheck } = await sb.from('productos').select('familia').limit(1)
if (colCheck === null) {
  console.error('\n❌ La columna "familia" no existe en productos.')
  console.error('   Primero ejecutá supabase/tre_ddl_only.sql en el SQL Editor de Supabase.\n')
  process.exit(1)
}
ok('Columna "familia" verificada')

// ─── HELPERS ───────────────────────────────────────────────────

async function upsertGrupo(nombre) {
  const { data } = await sb.from('grupos').select('id').eq('nombre', nombre).maybeSingle()
  if (data) return data.id
  const { data: ins, error } = await sb.from('grupos').insert({ nombre }).select('id').single()
  if (error) { err(`Grupo "${nombre}": ${error.message}`); return null }
  return ins.id
}

async function upsertSubgrupo(grupoId, nombre) {
  const { data } = await sb.from('subgrupos').select('id').eq('grupo_id', grupoId).eq('nombre', nombre).maybeSingle()
  if (data) return data.id
  const { data: ins, error } = await sb.from('subgrupos').insert({ grupo_id: grupoId, nombre }).select('id').single()
  if (error) { err(`Subgrupo "${nombre}": ${error.message}`); return null }
  return ins.id
}

// ── STEP 1: Grupos ──────────────────────────────────────────────
console.log('\n📦 STEP 1: Grupos...')
const GRUPOS = ['Motor','Turbo','Frenos','Suspensión','Escape','Llantas','Body','Interior','Electrónica']
const grupoIds = {}
for (const g of GRUPOS) {
  const id = await upsertGrupo(g)
  if (id) { grupoIds[g] = id; ok(`${g} → id ${id}`) }
}

// ── STEP 2: Subgrupos ───────────────────────────────────────────
console.log('\n📂 STEP 2: Subgrupos...')
const SUBGRUPOS = [
  ['Motor','Cabezas de cilindro'], ['Motor','Pistones y bielas'],
  ['Turbo','Turbos'], ['Turbo','Intercoolers'], ['Turbo','Tuberías'],
  ['Frenos','Pastillas'], ['Frenos','Discos'], ['Frenos','Cilindros'],
  ['Suspensión','Amortiguadores'], ['Suspensión','Muelles'], ['Suspensión','Barras'],
  ['Escape','Catalizadores'], ['Escape','Silenciadores'],
  ['Llantas','Ruedas forjadas'], ['Llantas','Neumáticos'],
  ['Body','Spoilers'], ['Body','Difusores'],
  ['Interior','Asientos'], ['Interior','Volantes'],
  ['Electrónica','ECUs'], ['Electrónica','Sensores'],
]
const subgrupoIds = {}
for (const [g, s] of SUBGRUPOS) {
  if (!grupoIds[g]) { err(`Grupo "${g}" faltante`); continue }
  const id = await upsertSubgrupo(grupoIds[g], s)
  if (id) { subgrupoIds[`${g}|${s}`] = id; ok(`${g} > ${s}`) }
}

// ── STEP 3: Productos ───────────────────────────────────────────
console.log('\n🛒 STEP 3: Productos TRE...')
const PRODUCTOS = [
  { tipo: 'Turbo Compresor',   sku: 'TRE-TURBO-001',       nombre: 'IHI VF52 Turbocharger',         marca: 'IHI',         oem: 'VF52',             precio: 2500, oferta: 2200, stock: 8,  g: 'Turbo',       s: 'Turbos',            specs: 'Compatible EJ20/EJ25. Boost 0.8-1.0 bar' },
  { tipo: 'Turbo Compresor',   sku: 'TRE-TURBO-002',       nombre: 'Garrett GTX3076R Turbo',         marca: 'Garrett',     oem: 'GTX3076R',         precio: 3800, oferta: 3500, stock: 5,  g: 'Turbo',       s: 'Turbos',            specs: 'Boost máximo 1.2 bar. Spool rápido' },
  { tipo: 'Intercooler',       sku: 'TRE-INTERCOOLER-001', nombre: 'Treadstone Intercooler Pro',     marca: 'Treadstone',  oem: 'TSP-IC-001',       precio: 1800, oferta: 1650, stock: 12, g: 'Turbo',       s: 'Intercoolers',      specs: 'Intercooler frontal aluminio' },
  { tipo: 'Pastilla de Freno', sku: 'TRE-FRENO-001',       nombre: 'Brembo Racing Pad Set',          marca: 'Brembo',      oem: 'P06051',           precio: 450,  oferta: 400,  stock: 20, g: 'Frenos',      s: 'Pastillas',         specs: 'Juego de pastillas. Agarre máximo' },
  { tipo: 'Disco de Freno',    sku: 'TRE-FRENO-002',       nombre: 'Brembo Disc Rotor 320mm',        marca: 'Brembo',      oem: 'BREM-320-SPORT',   precio: 550,  oferta: 480,  stock: 16, g: 'Frenos',      s: 'Discos',            specs: 'Disco ventilado. Resistencia al fade' },
  { tipo: 'Amortiguador',      sku: 'TRE-SUSP-001',        nombre: 'Bilstein B16 PSS Coilover',      marca: 'Bilstein',    oem: 'BIL-B16-PSS',      precio: 2200, oferta: 2000, stock: 6,  g: 'Suspensión',  s: 'Amortiguadores',    specs: 'Coilover ajustable. Altura y rigidez variables' },
  { tipo: 'Muelle',            sku: 'TRE-SUSP-002',        nombre: 'Eibach ProKit Springs',          marca: 'Eibach',      oem: 'E10-35-014-01-22', precio: 380,  oferta: 340,  stock: 10, g: 'Suspensión',  s: 'Muelles',           specs: 'Reducción altura 35mm' },
  { tipo: 'Catalizador',       sku: 'TRE-ESCAPE-001',      nombre: 'High Flow Catalytic Converter',  marca: 'Universal',   oem: 'HFC-100',          precio: 650,  oferta: 580,  stock: 7,  g: 'Escape',      s: 'Catalizadores',     specs: 'Flujo alto. +5-7 HP' },
  { tipo: 'Tubo de Escape',    sku: 'TRE-ESCAPE-002',      nombre: 'Tomei Expreme Muffler',          marca: 'Tomei',       oem: 'TOMEI-EXM-002',    precio: 890,  oferta: 800,  stock: 5,  g: 'Escape',      s: 'Silenciadores',     specs: 'Titanio. Sonido deportivo' },
  { tipo: 'Rueda Forjada',     sku: 'TRE-WHEEL-001',       nombre: 'Work Emotion CR Kiwami',         marca: 'Work',        oem: 'WORK-CR-18',       precio: 2800, oferta: 2500, stock: 4,  g: 'Llantas',     s: 'Ruedas forjadas',   specs: 'Juego x4 18". Ultra ligeras' },
  { tipo: 'Neumático',         sku: 'TRE-TIRE-001',        nombre: 'Bridgestone Potenza RE71R',      marca: 'Bridgestone', oem: 'BST-RE71R-205',    precio: 520,  oferta: 480,  stock: 12, g: 'Llantas',     s: 'Neumáticos',        specs: 'Juego x4 205/55R16' },
  { tipo: 'Splitter',          sku: 'TRE-BODY-001',        nombre: 'Carbon Fiber Front Splitter',    marca: 'ACS',         oem: 'ACSFSP-CF-001',    precio: 1200, oferta: 1100, stock: 3,  g: 'Body',        s: 'Spoilers',          specs: 'Carbono. Downforce +45kg' },
  { tipo: 'Difusor',           sku: 'TRE-BODY-002',        nombre: 'Rear Diffuser Carbon Kit',       marca: 'TRA Kyoto',   oem: 'TKY-DIFF-CF',      precio: 1400, oferta: 1250, stock: 2,  g: 'Body',        s: 'Difusores',         specs: 'Difusor trasero full carbono' },
  { tipo: 'Asiento',           sku: 'TRE-INT-001',         nombre: 'Sparco Racing Seat Pro',         marca: 'Sparco',      oem: 'SPARCO-PRO-7',     precio: 1100, oferta: 1000, stock: 4,  g: 'Interior',    s: 'Asientos',          specs: 'FIA homologado' },
  { tipo: 'Volante',           sku: 'TRE-INT-002',         nombre: 'OMP Corsica 330',                marca: 'OMP',         oem: 'OMP-CORS-330',     precio: 320,  oferta: 290,  stock: 6,  g: 'Interior',    s: 'Volantes',          specs: 'Diámetro 330mm gamuza' },
  { tipo: 'Chip de Potencia',  sku: 'TRE-ECU-001',         nombre: 'HKS F-Con V Pro ECU',            marca: 'HKS',         oem: 'HKS-FCON-VPRO',    precio: 1800, oferta: 1600, stock: 5,  g: 'Electrónica', s: 'ECUs',              specs: 'Programable. +50-80 HP' },
  { tipo: 'Sensor',            sku: 'TRE-ECU-002',         nombre: 'AEM Wideband O2 Sensor',         marca: 'AEM',         oem: 'AEM-WB-O2',        precio: 250,  oferta: 220,  stock: 10, g: 'Electrónica', s: 'Sensores',          specs: 'Banda ancha. Lectura AFR precisa' },
  { tipo: 'Pistón',            sku: 'TRE-MOTOR-001',       nombre: 'Cosworth Forged Piston Set',     marca: 'Cosworth',    oem: 'COS-PST-EJ20',     precio: 580,  oferta: 520,  stock: 4,  g: 'Motor',       s: 'Pistones y bielas', specs: 'Forjados 9.5:1' },
  { tipo: 'Cabeza',            sku: 'TRE-MOTOR-002',       nombre: 'ORC Full Ball Bearing Kit',      marca: 'ORC',         oem: 'ORC-BB-TURBO',     precio: 2100, oferta: 1900, stock: 2,  g: 'Motor',       s: 'Cabezas de cilindro', specs: 'Rodamientos de bolas. Máxima RPM' },
]

const productosIds = {}
for (const p of PRODUCTOS) {
  if (!grupoIds[p.g]) { err(`Grupo "${p.g}" faltante para ${p.sku}`); continue }

  const { data: existing } = await sb.from('productos').select('id').eq('sku', p.sku).maybeSingle()
  if (existing) { log(`Ya existe: ${p.sku}`); productosIds[p.sku] = existing.id; continue }

  const { data, error } = await sb.from('productos').insert({
    tipo_pieza: p.tipo, sku: p.sku, producto: p.nombre,
    marca_pieza: p.marca, numero_parte_oem: p.oem,
    precio: p.precio, precio_oferta: p.oferta, stock: p.stock,
    liquidacion: false, activo: true, especificaciones: p.specs,
    vendedor: 'TRE Verified', imagen_url: null,
    grupo_id: grupoIds[p.g], subgrupo_id: subgrupoIds[`${p.g}|${p.s}`] ?? null,
    familia: 'tre_performance',
  }).select('id').single()

  if (error) { err(`${p.sku}: ${error.message}`); continue }
  productosIds[p.sku] = data.id
  ok(`${p.nombre}`)
}

// ── STEP 4: Vehículos ───────────────────────────────────────────
console.log('\n🚗 STEP 4: Vehículos de prueba...')
const VEHICULOS = [
  { marca: 'Subaru', modelos: [
    { nombre: 'Impreza WRX STI', vers: [{ anio: 2015, ver: 'STI', motor: 'EJ257' }, { anio: 2018, ver: 'STI Type RA', motor: 'EJ257' }] },
    { nombre: 'BRZ',             vers: [{ anio: 2017, ver: 'Sport-Tech', motor: 'FA20' }] },
  ]},
  { marca: 'Nissan', modelos: [
    { nombre: '350Z', vers: [{ anio: 2006, ver: 'Track', motor: 'VQ35DE' }, { anio: 2008, ver: 'Nismo', motor: 'VQ35HR' }] },
    { nombre: 'GT-R', vers: [{ anio: 2012, ver: 'Black Edition', motor: 'VR38DETT' }, { anio: 2017, ver: 'Nismo', motor: 'VR38DETT' }] },
  ]},
  { marca: 'Mitsubishi', modelos: [
    { nombre: 'Lancer Evolution X', vers: [{ anio: 2009, ver: 'GSR', motor: '4B11T' }, { anio: 2012, ver: 'Final Edition', motor: '4B11T' }] },
  ]},
  { marca: 'Toyota', modelos: [
    { nombre: 'GR Supra', vers: [{ anio: 2020, ver: '3.0', motor: 'B58' }, { anio: 2022, ver: '3.0 Premium', motor: 'B58' }] },
    { nombre: 'GR86',    vers: [{ anio: 2022, ver: 'Standard', motor: 'FA24' }] },
  ]},
  { marca: 'BMW', modelos: [
    { nombre: 'M3', vers: [{ anio: 2014, ver: 'Competition', motor: 'S55B30' }, { anio: 2021, ver: 'xDrive', motor: 'S58B30' }] },
  ]},
]

const versionIds = []
for (const v of VEHICULOS) {
  let { data: marcaData } = await sb.from('marcas').select('id').ilike('nombre', v.marca).maybeSingle()
  if (!marcaData) {
    const { data, error } = await sb.from('marcas').insert({ nombre: v.marca }).select('id').single()
    if (error) { err(`Marca "${v.marca}": ${error.message}`); continue }
    marcaData = data; ok(`Marca: ${v.marca}`)
  } else { log(`Marca existe: ${v.marca}`) }

  for (const mo of v.modelos) {
    let { data: modeloData } = await sb.from('modelos').select('id').eq('marca_id', marcaData.id).ilike('nombre', mo.nombre).maybeSingle()
    if (!modeloData) {
      const { data, error } = await sb.from('modelos').insert({ marca_id: marcaData.id, nombre: mo.nombre }).select('id').single()
      if (error) { err(`Modelo "${mo.nombre}": ${error.message}`); continue }
      modeloData = data; ok(`  Modelo: ${mo.nombre}`)
    } else { log(`  Modelo existe: ${mo.nombre}`) }

    for (const ve of mo.vers) {
      let { data: vd } = await sb.from('versiones').select('id')
        .eq('modelo_id', modeloData.id).eq('anio', ve.anio).ilike('version', ve.ver).maybeSingle()
      if (!vd) {
        const { data, error } = await sb.from('versiones').insert({
          modelo_id: modeloData.id, anio: ve.anio, version: ve.ver, motor_codigo: ve.motor
        }).select('id').single()
        if (error) { err(`Versión "${ve.ver} ${ve.anio}": ${error.message}`); continue }
        vd = data; ok(`    ${mo.nombre} ${ve.anio} ${ve.ver}`)
      } else { log(`    Versión existe: ${mo.nombre} ${ve.anio}`) }
      versionIds.push(vd.id)
    }
  }
}

// ── STEP 5: Compatibilidades ────────────────────────────────────
console.log('\n🔗 STEP 5: Compatibilidades...')
let nuevas = 0
for (const [, productoId] of Object.entries(productosIds)) {
  for (const versionId of versionIds) {
    const { data: ex } = await sb.from('compatibilidades').select('id')
      .eq('producto_id', productoId).eq('version_id', versionId).maybeSingle()
    if (!ex) {
      const { error } = await sb.from('compatibilidades').insert({ producto_id: productoId, version_id: versionId })
      if (!error) nuevas++
    }
  }
}
ok(`${nuevas} compatibilidades nuevas`)

// ── RESUMEN ─────────────────────────────────────────────────────
const { count: totalProd } = await sb.from('productos').select('*', { count: 'exact', head: true }).eq('familia', 'tre_performance')
const { count: totalMod }  = await sb.from('vista_tre_modelos').select('*', { count: 'exact', head: true })

console.log('\n═══════════════════════════════════════════')
console.log('  SEED TRE COMPLETADO 🏁')
console.log('═══════════════════════════════════════════')
console.log(`  Productos TRE en DB : ${totalProd}`)
console.log(`  Modelos TRE listos  : ${totalMod}`)
console.log(`  Compat. nuevas      : ${nuevas}`)
console.log('═══════════════════════════════════════════\n')
