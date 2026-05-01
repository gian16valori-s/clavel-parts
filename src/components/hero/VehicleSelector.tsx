'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAppStore } from '@/lib/cartStore'
import { supabase } from '@/lib/supabase'

type CatalogVehicleRow = {
  marca: string
  modelo: string
  anio: number
  version: string
  motor_codigo: string
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  )
}

export default function VehicleSelector() {
  const { setVehicle, setView, setSearchQuery } = useAppStore()

  const [rows, setRows] = useState<CatalogVehicleRow[]>([])

  const [brandName, setBrandName] = useState('')
  const [modelName, setModelName] = useState('')
  const [year, setYear] = useState('')
  const [versionKey, setVersionKey] = useState('')
  const [versionLabel, setVersionLabel] = useState('')
  const [engine, setEngine] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadVehicleOptions = async () => {
      setLoading(true)
      setLoadError(null)

      const { data, error } = await supabase
        .from('vista_catalogo')
        .select('marca,modelo,anio,version,motor_codigo')
        .eq('activo', true)

      if (error) {
        setRows([])
        setLoadError('No se pudieron cargar vehículos con productos desde Supabase.')
        setLoading(false)
        return
      }

      setRows((data as CatalogVehicleRow[] | null) ?? [])
      setLoading(false)
    }

    void loadVehicleOptions()
  }, [])

  const brands = useMemo(() => uniqueSorted(rows.map((item) => item.marca)), [rows])

  const models = useMemo(() => {
    if (!brandName) return []
    return uniqueSorted(rows.filter((item) => item.marca === brandName).map((item) => item.modelo))
  }, [rows, brandName])

  const years = useMemo(() => {
    if (!brandName || !modelName) return []
    const values = Array.from(
      new Set(
        rows
          .filter((item) => item.marca === brandName && item.modelo === modelName)
          .map((item) => String(item.anio))
      )
    )
    return values.sort((a, b) => Number(b) - Number(a))
  }, [rows, brandName, modelName])

  const versions = useMemo(() => {
    if (!brandName || !modelName || !year) return []

    const filtered = rows.filter(
      (item) =>
        item.marca === brandName &&
        item.modelo === modelName &&
        String(item.anio) === year
    )

    const byKey = new Map<string, { key: string; label: string; engine: string }>()

    filtered.forEach((item) => {
      const key = `${item.version}__${item.motor_codigo}`
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          label: item.version,
          engine: item.motor_codigo,
        })
      }
    })

    return Array.from(byKey.values()).sort((a, b) =>
      `${a.label} ${a.engine}`.localeCompare(`${b.label} ${b.engine}`, 'es', { sensitivity: 'base' })
    )
  }, [rows, brandName, modelName, year])

  const isComplete = Boolean(brandName && modelName && year && versionLabel && engine)

  function handleVersionChange(nextKey: string) {
    setVersionKey(nextKey)
    const selected = versions.find((item) => item.key === nextKey)
    setVersionLabel(selected?.label ?? '')
    setEngine(selected?.engine ?? '')
  }

  function handleSearch() {
    if (!isComplete) return

    setVehicle({
      brand: brandName,
      model: modelName,
      engine,
      year,
      versionLabel,
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
      className="flex flex-col justify-center gap-[0.85rem] px-[1.8rem] py-8 border-r-2 w-full"
      style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', minHeight: 'calc(100vh - 126px)' }}
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
          value={brandName}
          disabled={loading}
          onChange={(e) => {
            const nextBrand = e.target.value
            setBrandName(nextBrand)
            setModelName('')
            setYear('')
            setVersionKey('')
            setVersionLabel('')
            setEngine('')
          }}
        >
          <option value="">{loading ? 'CARGANDO MARCAS…' : 'MARCA'}</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* MODELO */}
      <div className="relative">
        <select
          className={selectClass}
          value={modelName}
          disabled={!brandName || loading}
          onChange={(e) => {
            const nextModel = e.target.value
            setModelName(nextModel)
            setYear('')
            setVersionKey('')
            setVersionLabel('')
            setEngine('')
          }}
        >
          <option value="">MODELO</option>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* AÑO */}
      <div className="relative">
        <select
          className={selectClass}
          value={year}
          disabled={!modelName || loading}
          onChange={(e) => {
            setYear(e.target.value)
            setVersionKey('')
            setVersionLabel('')
            setEngine('')
          }}
        >
          <option value="">AÑO</option>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* MOTOR / VERSION */}
      <div className="relative">
        <select
          className={selectClass}
          value={versionKey}
          disabled={!year || loading}
          onChange={(e) => handleVersionChange(e.target.value)}
        >
          <option value="">MOTOR / VERSIÓN</option>
          {versions.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label} {item.engine ? `· ${item.engine}` : ''}
            </option>
          ))}
        </select>
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
