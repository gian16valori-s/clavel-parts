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

export default function VehicleSelector() {
  const { setVehicle, setView, setSearchQuery } = useAppStore()

  // Selecciones del usuario
  const [brandId, setBrandId] = useState<number | null>(null)
  const [modelId, setModelId] = useState<number | null>(null)
  const [versionId, setVersionId] = useState<number | null>(null)
  const [brandName, setBrandName] = useState('')
  const [modelName, setModelName] = useState('')
  const [versionLabel, setVersionLabel] = useState('')
  const [engine, setEngine] = useState('')
  const [year, setYear] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Listas dinámicas (Supabase)
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [years, setYears] = useState<string[]>([])
  const [versions, setVersions] = useState<Version[]>([])

  // Loading / error
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingYears, setLoadingYears] = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Cargar marcas desde Supabase al montar
  useEffect(() => {
    setLoadingBrands(true)
    setLoadError(null)
    getBrands()
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setLoadError('No se pudieron cargar las marcas desde Supabase.'))
      .finally(() => setLoadingBrands(false))
  }, [])

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (!brandId) return

    setLoadingModels(true)
    setModels([])
    setModelId(null)
    setModelName('')
    setYears([])
    setYear('')
    setVersions([])
    setVersionId(null)
    setVersionLabel('')
    setEngine('')

    getModelsByBrand(brandId)
      .then((data) => setModels(Array.isArray(data) ? data : []))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false))
  }, [brandId])

  // Cargar años cuando cambia el modelo
  useEffect(() => {
    if (!modelId) return

    setLoadingYears(true)
    setYears([])
    setYear('')
    setVersions([])
    setVersionId(null)
    setVersionLabel('')
    setEngine('')

    getYearsByModel(modelId)
      .then((data) => setYears((Array.isArray(data) ? data : []).map(String)))
      .catch(() => setYears([]))
      .finally(() => setLoadingYears(false))
  }, [modelId])

  // Cargar versiones cuando cambia el año
  useEffect(() => {
    if (!modelId || !year) return

    setLoadingVersions(true)
    setVersions([])
    setVersionId(null)
    setVersionLabel('')
    setEngine('')

    getVersionsByModelAndYear(modelId, Number(year))
      .then((data) => setVersions(Array.isArray(data) ? data : []))
      .catch(() => setVersions([]))
      .finally(() => setLoadingVersions(false))
  }, [modelId, year])

  function handleVersionChange(nextVersionId: string) {
    const id = Number(nextVersionId)
    const v = versions.find((item) => item.id === id)

    setVersionId(id || null)
    setVersionLabel(v?.version ?? '')
    setEngine(v?.motor_codigo ?? '')
  }

  const isComplete = brandName && modelName && engine && year && versionLabel && versionId

  function handleSearch() {
    if (!isComplete || !versionId) return

    setVehicle({
      brand: brandName,
      model: modelName,
      engine,
      year,
      versionLabel,
      versionId,
    })
    setView('results')
  }

  function handleTextSearch() {
    const normalized = searchInput.trim()
    if (!normalized) return

    setSearchQuery(normalized)
    setView('results')
  }

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

      {loadError && (
        <div
          className="text-center font-condensed rounded-lg px-3 py-2"
          style={{ background: 'rgba(204,17,17,0.12)', border: '1px solid rgba(204,17,17,0.3)', color: '#ff7070', fontSize: '0.75rem' }}
        >
          ⚠️ {loadError}
        </div>
      )}

      {/* MARCA */}
      <div className="relative">
        <select
          className={selectClass}
          value={brandId ?? ''}
          disabled={loadingBrands}
          onChange={(e) => {
            const id = Number(e.target.value)
            const selected = brands.find((item) => item.id === id)
            setBrandId(id || null)
            setBrandName(selected?.nombre ?? '')
          }}
        >
          <option value="">{loadingBrands ? 'CARGANDO MARCAS…' : 'MARCA'}</option>
          {brands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
        {loadingBrands && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* MODELO */}
      <div className="relative">
        <select
          className={selectClass}
          value={modelId ?? ''}
          disabled={!brandId || loadingModels}
          onChange={(e) => {
            const id = Number(e.target.value)
            const selected = models.find((item) => item.id === id)
            setModelId(id || null)
            setModelName(selected?.nombre ?? '')
          }}
        >
          <option value="">{loadingModels ? 'CARGANDO MODELOS…' : 'MODELO'}</option>
          {models.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
        {loadingModels && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* AÑO */}
      <div className="relative">
        <select
          className={selectClass}
          value={year}
          disabled={!modelId || loadingYears}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">{loadingYears ? 'CARGANDO AÑOS…' : 'AÑO'}</option>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {loadingYears && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* MOTOR / VERSION */}
      <div className="relative">
        <select
          className={selectClass}
          value={versionId ?? ''}
          disabled={!year || loadingVersions}
          onChange={(e) => handleVersionChange(e.target.value)}
        >
          <option value="">{loadingVersions ? 'CARGANDO VERSIONES…' : 'MOTOR / VERSIÓN'}</option>
          {versions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.version} {item.motor_codigo ? `· ${item.motor_codigo}` : ''}
            </option>
          ))}
        </select>
        {loadingVersions && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

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
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[18px] h-[18px]">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          VER REPUESTOS COMPATIBLES
        </button>
      )}

      <div className="flex items-center gap-2 my-1">
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
        <span className="text-[0.72rem] uppercase tracking-[0.1em] whitespace-nowrap" style={{ color: 'var(--gray)' }}>
          O BUSCÁ POR NOMBRE O CÓDIGO
        </span>
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
      </div>

      <input
        type="text"
        placeholder="Introducí el nombre o número de pieza…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleTextSearch()
        }}
        className="w-full px-[1.1rem] py-[0.78rem] rounded-full font-barlow text-[0.9rem] transition-all duration-200 focus:outline-none"
        style={{ background: 'var(--dark4)', border: '1px solid var(--slate)', color: 'var(--white)' }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--yellow)'
          e.target.style.boxShadow = '0 0 0 2px rgba(240,224,64,0.2)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--slate)'
          e.target.style.boxShadow = 'none'
        }}
      />

      <button
        className="w-full flex items-center justify-center gap-2 rounded-full font-condensed font-black italic uppercase transition-all duration-200"
        style={{
          padding: '0.85rem 1.1rem',
          background: 'var(--slate)',
          color: 'var(--white)',
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={handleTextSearch}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--slate2)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--slate)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[18px] h-[18px]">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        BUSCAR REPUESTO
      </button>

      <p className="text-center italic leading-[1.4]" style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
        Solo te mostramos repuestos compatibles con tu vehículo exacto.
        <br />
        Cero margen de error.
      </p>
    </div>
  )
}
