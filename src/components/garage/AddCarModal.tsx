'use client'

import { useState, useEffect } from 'react'
import {
  getBrands,
  getModelsByBrand,
  getYearsByModel,
  getVersionsByModelAndYear,
  type Brand,
  type Model,
  type Version,
} from '@/lib/supabaseVehicles'
import { addVehicle, deleteVehicle, updateVehicle, type GarageVehicle } from '@/lib/garageService'

interface AddCarModalProps {
  userId: string
  onClose: () => void
  onSaved: (car: GarageVehicle) => void
  vehicle?: GarageVehicle | null
  onDeleted?: (vehicleId: string) => void
}

type Step = 'marca' | 'modelo' | 'anio' | 'version' | 'detalles'

export default function AddCarModal({ userId, onClose, onSaved, vehicle = null, onDeleted }: AddCarModalProps) {
  const isEditing = !!vehicle

  // ── Selector state ──────────────────────────────────────────────────────────
  const [step,     setStep]     = useState<Step>('marca')
  const [brands,   setBrands]   = useState<Brand[]>([])
  const [models,   setModels]   = useState<Model[]>([])
  const [years,    setYears]    = useState<number[]>([])
  const [versions, setVersions] = useState<Version[]>([])

  const [selectedBrand,   setSelectedBrand]   = useState<Brand | null>(null)
  const [selectedModel,   setSelectedModel]   = useState<Model | null>(null)
  const [selectedYear,    setSelectedYear]    = useState<number | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)

  // ── Detail fields ───────────────────────────────────────────────────────────
  const [vin,    setVin]    = useState('')
  const [km,     setKm]     = useState('')
  const [plate,  setPlate]  = useState('')
  const [color,  setColor]  = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [loading, setLoading] = useState(false)

  // ── Load initial data ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadInitialState() {
      setLoading(true)
      const brandsData = await getBrands()
      if (cancelled) return
      setBrands(brandsData)

      if (!vehicle) {
        setLoading(false)
        return
      }

      const brandMatch = brandsData.find((item) => item.id === vehicle.marca_id) ?? null
      setSelectedBrand(brandMatch)
      setVin(vehicle.vin ?? '')
      setKm(vehicle.km > 0 ? String(vehicle.km) : '')
      setPlate(vehicle.plate ?? '')
      setColor(vehicle.color ?? '')

      if (vehicle.marca_id) {
        const modelsData = await getModelsByBrand(vehicle.marca_id)
        if (cancelled) return
        setModels(modelsData)

        const modelMatch = modelsData.find((item) => item.id === vehicle.modelo_id) ?? null
        setSelectedModel(modelMatch)

        if (vehicle.modelo_id) {
          const yearsData = await getYearsByModel(vehicle.modelo_id)
          if (cancelled) return
          setYears(yearsData)

          const resolvedYear = Number(vehicle.year) || yearsData[0] || null
          setSelectedYear(resolvedYear)

          if (resolvedYear) {
            const versionsData = await getVersionsByModelAndYear(vehicle.modelo_id, resolvedYear)
            if (cancelled) return
            setVersions(versionsData)
            setSelectedVersion(versionsData.find((item) => item.id === vehicle.version_id) ?? null)
          }
        }
      }

      setStep('detalles')
      setLoading(false)
    }

    void loadInitialState()

    return () => {
      cancelled = true
    }
  }, [vehicle])

  // ── Step handlers ───────────────────────────────────────────────────────────
  async function handleSelectBrand(brand: Brand) {
    setSelectedBrand(brand)
    setSelectedModel(null)
    setSelectedYear(null)
    setSelectedVersion(null)
    setStep('modelo')
    setLoading(true)
    getModelsByBrand(brand.id).then(setModels).finally(() => setLoading(false))
  }

  async function handleSelectModel(model: Model) {
    setSelectedModel(model)
    setSelectedYear(null)
    setSelectedVersion(null)
    setStep('anio')
    setLoading(true)
    getYearsByModel(model.id).then(setYears).finally(() => setLoading(false))
  }

  async function handleSelectYear(year: number) {
    setSelectedYear(year)
    setSelectedVersion(null)
    setStep('version')
    setLoading(true)
    getVersionsByModelAndYear(selectedModel!.id, year).then(setVersions).finally(() => setLoading(false))
  }

  function handleSelectVersion(version: Version) {
    setSelectedVersion(version)
    setStep('detalles')
  }

  async function handleSubmit() {
    if (!selectedBrand || !selectedModel || !selectedYear || !selectedVersion) return
    setSaving(true)
    setError('')
    const payload = {
      marca_id:   selectedBrand.id,
      modelo_id:  selectedModel.id,
      version_id: selectedVersion.id,
      vin:        vin.trim().toUpperCase(),
      brand:      selectedBrand.nombre,
      model:      selectedModel.nombre,
      version:    `${selectedVersion.version} ${selectedVersion.motor_codigo}`.trim(),
      year:       String(selectedYear),
      plate:      plate.trim().toUpperCase(),
      km:         parseInt(km.replace(/\D/g, ''), 10) || 0,
      color:      color.trim(),
    }
    const result = isEditing && vehicle
      ? await updateVehicle(vehicle.id, payload)
      : await addVehicle(userId, payload)
    setSaving(false)
    if (!result.data) {
      setError(result.error ?? 'No se pudo guardar el auto.')
      return
    }
    onSaved(result.data)
  }

  async function handleDelete() {
    if (!vehicle) return
    const confirmed = window.confirm('¿Querés eliminar este auto del garage?')
    if (!confirmed) return

    setSaving(true)
    setError('')
    const result = await deleteVehicle(vehicle.id)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onDeleted?.(vehicle.id)
    onClose()
  }

  // ── Step label map ──────────────────────────────────────────────────────────
  const stepLabels: Record<Step, string> = {
    marca:    'Elegí la marca',
    modelo:   'Elegí el modelo',
    anio:     'Elegí el año',
    version:  'Elegí la versión',
    detalles: 'Datos del auto',
  }

  const steps: Step[] = ['marca', 'modelo', 'anio', 'version', 'detalles']
  const stepIdx = steps.indexOf(step)

  function goBack() {
    if (stepIdx > 0) setStep(steps[stepIdx - 1])
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-xl border overflow-hidden"
        style={{
          width: 480,
          maxHeight: '80vh',
          background: 'var(--dark2)',
          borderColor: 'var(--dark4)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--dark4)' }}
        >
          <div className="flex items-center gap-3">
            {stepIdx > 0 && (
              <button
                onClick={goBack}
                className="flex items-center justify-center rounded"
                style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#aaa' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div>
              <div
                className="font-condensed font-black italic uppercase"
                style={{ color: 'var(--yellow)', fontSize: '1.3rem', letterSpacing: '0.04em', lineHeight: 1 }}
              >
                {isEditing ? 'EDITAR AUTO' : 'AGREGAR AUTO'}
              </div>
              <div style={{ color: 'var(--gray)', fontSize: '0.72rem', marginTop: 2 }}>
                {stepLabels[step]}
                {selectedBrand && step !== 'marca' && (
                  <span style={{ color: '#555' }}> · {selectedBrand.nombre}</span>
                )}
                {selectedModel && ['anio', 'version', 'detalles'].includes(step) && (
                  <span style={{ color: '#555' }}> {selectedModel.nombre}</span>
                )}
                {selectedYear && ['version', 'detalles'].includes(step) && (
                  <span style={{ color: '#555' }}> {selectedYear}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--dark4)', flexShrink: 0 }}>
          <div
            style={{
              height: '100%',
              background: 'var(--yellow)',
              width: `${((stepIdx + 1) / steps.length) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Body — scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div style={{ color: '#444', fontFamily: '"Barlow Condensed", sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                Cargando...
              </div>
            </div>
          ) : (

            <>
              {/* MARCA */}
              {step === 'marca' && (
                <div className="p-3 grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleSelectBrand(brand)}
                      className="rounded-lg px-4 py-3 text-left font-condensed font-bold uppercase transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#ddd',
                        fontSize: '0.85rem',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(240,224,64,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(240,224,64,0.3)'
                        e.currentTarget.style.color = 'var(--yellow)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                        e.currentTarget.style.color = '#ddd'
                      }}
                    >
                      {brand.nombre}
                    </button>
                  ))}
                </div>
              )}

              {/* MODELO */}
              {step === 'modelo' && (
                <div className="p-3 flex flex-col gap-2">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      className="rounded-lg px-4 py-3 text-left font-condensed font-bold uppercase transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#ddd',
                        fontSize: '0.85rem',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(240,224,64,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(240,224,64,0.3)'
                        e.currentTarget.style.color = 'var(--yellow)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                        e.currentTarget.style.color = '#ddd'
                      }}
                    >
                      {model.nombre}
                    </button>
                  ))}
                </div>
              )}

              {/* AÑO */}
              {step === 'anio' && (
                <div className="p-3 grid grid-cols-3 gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleSelectYear(year)}
                      className="rounded-lg px-4 py-3 font-condensed font-black transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#ddd',
                        fontSize: '1.1rem',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(240,224,64,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(240,224,64,0.3)'
                        e.currentTarget.style.color = 'var(--yellow)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                        e.currentTarget.style.color = '#ddd'
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}

              {/* VERSIÓN */}
              {step === 'version' && (
                <div className="p-3 flex flex-col gap-2">
                  {versions.map((ver) => (
                    <button
                      key={ver.id}
                      onClick={() => handleSelectVersion(ver)}
                      className="rounded-lg px-4 py-3 text-left transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#ddd',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(240,224,64,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(240,224,64,0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                      }}
                    >
                      <div className="font-condensed font-bold uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.04em' }}>
                        {ver.version}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.72rem', marginTop: 2 }}>
                        {ver.motor_codigo}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* DETALLES */}
              {step === 'detalles' && (
                <div className="p-5 flex flex-col gap-4">
                  {/* Summary */}
                  <div
                    className="rounded-lg p-4"
                    style={{ background: 'rgba(240,224,64,0.06)', border: '1px solid rgba(240,224,64,0.15)' }}
                  >
                    <div className="font-condensed font-black uppercase" style={{ color: 'var(--yellow)', fontSize: '1.1rem', letterSpacing: '0.04em' }}>
                      {selectedBrand?.nombre} {selectedModel?.nombre}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.78rem', marginTop: 2 }}>
                      {selectedYear} · {selectedVersion?.version} · {selectedVersion?.motor_codigo}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="font-condensed font-bold uppercase text-xs" style={{ color: 'var(--gray2)', letterSpacing: '0.08em' }}>
                        VIN <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                      </span>
                      <input
                        type="text"
                        value={vin}
                        onChange={(e) => setVin(e.target.value)}
                        placeholder="ej: 5UXWX7C5BA000001"
                        maxLength={40}
                        className="rounded-md px-3 py-2 outline-none border uppercase"
                        style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)', fontSize: '0.9rem', letterSpacing: '0.08em' }}
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-condensed font-bold uppercase text-xs" style={{ color: 'var(--gray2)', letterSpacing: '0.08em' }}>
                        Kilómetros actuales
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={km}
                        onChange={(e) => setKm(e.target.value)}
                        placeholder="ej: 142500"
                        className="rounded-md px-3 py-2 outline-none border"
                        style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)', fontSize: '0.9rem' }}
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-condensed font-bold uppercase text-xs" style={{ color: 'var(--gray2)', letterSpacing: '0.08em' }}>
                        Patente <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                      </span>
                      <input
                        type="text"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        placeholder="ej: ABC 123"
                        maxLength={8}
                        className="rounded-md px-3 py-2 outline-none border uppercase"
                        style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)', fontSize: '0.9rem', letterSpacing: '0.1em' }}
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-condensed font-bold uppercase text-xs" style={{ color: 'var(--gray2)', letterSpacing: '0.08em' }}>
                        Color <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                      </span>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="ej: Negro Saphir"
                        className="rounded-md px-3 py-2 outline-none border"
                        style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)', color: 'var(--white)', fontSize: '0.9rem' }}
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-md px-3 py-2 text-sm" style={{ background: 'rgba(220,38,38,0.18)', color: '#fecaca' }}>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {isEditing && (
                      <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="rounded-md px-4 py-3 font-condensed font-black italic uppercase"
                        style={{
                          flex: 1,
                          background: 'rgba(220,38,38,0.14)',
                          color: '#fca5a5',
                          fontSize: '0.95rem',
                          letterSpacing: '0.06em',
                          border: '1px solid rgba(220,38,38,0.22)',
                          cursor: saving ? 'wait' : 'pointer',
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        Eliminar auto
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="rounded-md px-4 py-3 font-condensed font-black italic uppercase transition-transform"
                      style={{
                        flex: isEditing ? 1.4 : 1,
                        background: 'var(--yellow)',
                        color: 'var(--text-dark)',
                        fontSize: '1rem',
                        letterSpacing: '0.06em',
                        border: 'none',
                        cursor: saving ? 'wait' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                    >
                      {saving ? 'GUARDANDO...' : isEditing ? 'GUARDAR CAMBIOS' : 'AGREGAR AL GARAGE'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
