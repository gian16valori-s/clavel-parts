'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/cartStore'
import {
  getBrands,
  getModelsByBrand,
  getYearsByModel,
  getVersionsByModelAndYear,
  type Brand,
  type Model,
  type Version,
} from '@/lib/supabaseVehicles'

// ── Componente ────────────────────────────────────────────────────────────────
export default function VehicleSelector() {
  const { setVehicle, setView } = useAppStore()

  // Selecciones del usuario
  const [brandId,    setBrandId]    = useState<number | null>(null)
  const [modelId,    setModelId]    = useState<number | null>(null)
  const [year,       setYear]       = useState<number | null>(null)
  const [versionId,  setVersionId]  = useState<number | null>(null)
  const [brandName,  setBrandName]  = useState('')
  const [modelName,  setModelName]  = useState('')
  const [versionStr, setVersionStr] = useState('')

  // Listas dinámicas
  const [brands,   setBrands]   = useState<Brand[]>([])
  const [models,   setModels]   = useState<Model[]>([])
  const [years,    setYears]    = useState<number[]>([])
  const [versions, setVersions] = useState<Version[]>([])

  // Loading / error
  const [loadingBrands,   setLoadingBrands]   = useState(true)
  const [loadingModels,   setLoadingModels]   = useState(false)
  const [loadingYears,    setLoadingYears]    = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [brandsError,     setBrandsError]     = useState<string | null>(null)

  // ── Cargar marcas al montar ───────────────────────────────────────────────
  useEffect(() => {
    setLoadingBrands(true)
    setBrandsError(null)
    getBrands()
      .then((data) => setBrands(data))
      .catch((e) => setBrandsError(String(e)))
      .finally(() => setLoadingBrands(false))
  }, [])

  // ── Cargar modelos cuando cambia la marca ─────────────────────────────────
  useEffect(() => {
    if (!brandId) return
    setLoadingModels(true)
    setModels([]); setModelId(null); setModelName('')
    setYears([]); setYear(null)
    setVersions([]); setVersionId(null); setVersionStr('')
    getModelsByBrand(brandId)
      .then((data) => setModels(data))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false))
  }, [brandId])

  // ── Cargar años cuando cambia el modelo ──────────────────────────────────
  useEffect(() => {
    if (!modelId) return
    setLoadingYears(true)
    setYears([]); setYear(null)
    setVersions([]); setVersionId(null); setVersionStr('')
    getYearsByModel(modelId)
      .then((data) => setYears(data))
      .catch(() => setYears([]))
      .finally(() => setLoadingYears(false))
  }, [modelId])

  // ── Cargar versiones cuando cambia el año ────────────────────────────────
  useEffect(() => {
    if (!modelId || !year) return
    setLoadingVersions(true)
    setVersions([]); setVersionId(null); setVersionStr('')
    getVersionsByModelAndYear(modelId, year)
      .then((data) => setVersions(data))
      .catch(() => setVersions([]))
      .finally(() => setLoadingVersions(false))
  }, [modelId, year])

  const isComplete = brandName && modelName && year && versionStr

  function handleSearch() {
    if (!isComplete) return
    setVehicle({
      brand: brandName,
      model: modelName,
      engine: versionStr,
      year: String(year),
      versionId: versionId ?? undefined,
      versionLabel: versionStr,
    })
    setView('results')
  }

  // ── Estilos ────────────────────────────────────────────────────────────────
  const selectClass = `
    w-full px-[1.1rem] py-[0.78rem] rounded-full
    font-condensed font-bold text-[1rem] uppercase tracking-[0.05em]
    cursor-pointer transition-shadow duration-200 border-none
    text-[var(--text-dark)] bg-white select-arrow
    focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]
    disabled:opacity-40 disabled:cursor-not-allowed
  `

  return (
    <div
      className="flex flex-col justify-center gap-[0.85rem] px-[1.8rem] py-8 border-r-2"
      style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', width: 400, minHeight: 'calc(100vh - 126px)' }}
    >
      <p
        className="text-center font-condensed font-black italic uppercase text-white mb-1"
        style={{ fontSize: '1.55rem', letterSpacing: '0.06em' }}
      >
        ¿QUÉ AUTO <span style={{ color: 'var(--yellow)' }}>TENÉS?</span>
      </p>

      {/* Error de API — solo se muestra si las marcas no pudieron cargar */}
      {brandsError && (
        <div
          className="text-center font-condensed rounded-lg px-3 py-2"
          style={{ background: 'rgba(204,17,17,0.12)', border: '1px solid rgba(204,17,17,0.3)', color: '#ff7070', fontSize: '0.75rem' }}
        >
          ⚠️ No se pudo conectar con la base de datos.<br />
          <span style={{ opacity: 0.7 }}>Verificá las credenciales de Supabase en .env.local</span>
        </div>
      )}

      {/* ── MARCA ── */}
      <div className="relative">
        <select
          className={selectClass}
          value={brandId ?? ''}
          disabled={loadingBrands || !!brandsError}
          onChange={(e) => {
            const id = Number(e.target.value)
            const b  = brands.find((x) => x.id === id)
            setBrandId(id || null)
            setBrandName(b?.nombre ?? '')
          }}
        >
          <option value="">
            {loadingBrands ? 'CARGANDO MARCAS…' : 'MARCA'}
          </option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.nombre}</option>
          ))}
        </select>
        {loadingBrands && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── MODELO ── */}
      <div className="relative">
        <select
          className={selectClass}
          value={modelId ?? ''}
          disabled={!brandId || loadingModels}
          onChange={(e) => {
            const id = Number(e.target.value)
            const m  = models.find((x) => x.id === id)
            setModelId(id || null)
            setModelName(m?.nombre ?? '')
          }}
        >
          <option value="">
            {loadingModels ? 'CARGANDO MODELOS…' : 'MODELO'}
          </option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        {loadingModels && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── AÑO ── */}
      <div className="relative">
        <select
          className={selectClass}
          value={year ?? ''}
          disabled={!modelId || loadingYears}
          onChange={(e) => setYear(Number(e.target.value) || null)}
        >
          <option value="">
            {loadingYears ? 'CARGANDO AÑOS…' : 'AÑO'}
          </option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {loadingYears && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── VERSIÓN / MOTOR ── */}
      <div className="relative">
        <select
          className={selectClass}
          value={versionId ?? ''}
          disabled={!year || loadingVersions}
          onChange={(e) => {
            const id = Number(e.target.value)
            const v  = versions.find((x) => x.id === id)
            setVersionId(id || null)
            setVersionStr(v?.version ?? '')
          }}
        >
          <option value="">
            {loadingVersions ? 'CARGANDO VERSIONES…' : 'MOTOR / VERSIÓN'}
          </option>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>{v.version}</option>
          ))}
        </select>
        {loadingVersions && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      {isComplete && (
        <button
          onClick={handleSearch}
          className="w-full flex items-center justify-center gap-2 rounded-full font-condensed font-black italic uppercase transition-all duration-150 mt-1"
          style={{
            padding: '0.85rem 1.1rem',
            background: 'var(--yellow)',
            color: 'var(--text-dark)',
            fontSize: '1.1rem',
            letterSpacing: '0.08em',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(240,224,64,0.3)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[18px] h-[18px]">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          VER REPUESTOS COMPATIBLES
        </button>
      )}

      {/* ── Divider ── */}
      <div className="flex items-center gap-2 my-1">
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}/>
        <span className="text-[0.72rem] uppercase tracking-[0.1em] whitespace-nowrap" style={{ color: 'var(--gray)' }}>
          O BUSCÁ POR NOMBRE O CÓDIGO
        </span>
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}/>
      </div>

      {/* ── Búsqueda por texto ── */}
      <input
        type="text"
        placeholder="Introducí el nombre o número de pieza…"
        className="w-full px-[1.1rem] py-[0.78rem] rounded-full font-barlow text-[0.9rem] transition-all duration-200 focus:outline-none"
        style={{ background: 'var(--dark4)', border: '1px solid var(--slate)', color: 'var(--white)' }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--yellow)'; e.target.style.boxShadow = '0 0 0 2px rgba(240,224,64,0.2)' }}
        onBlur={(e)  => { e.target.style.borderColor = 'var(--slate)';  e.target.style.boxShadow = 'none' }}
      />

      <button
        className="w-full flex items-center justify-center gap-2 rounded-full font-condensed font-black italic uppercase transition-all duration-200"
        style={{ padding: '0.85rem 1.1rem', background: 'var(--slate)', color: 'var(--white)', fontSize: '1.1rem', letterSpacing: '0.08em', border: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--slate2)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--slate)';  (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[18px] h-[18px]">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        BUSCAR REPUESTO
      </button>

      <p className="text-center italic leading-[1.4]" style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
        Solo te mostramos repuestos compatibles con tu vehículo exacto.<br />Cero margen de error.
      </p>
    </div>
  )
}
