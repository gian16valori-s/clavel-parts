'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { useAppStore } from '@/lib/cartStore'
import { supabase } from '@/lib/supabase'
import {
  getGarageVehicles,
  getGarageStats,
  type GarageVehicle,
  type GarageStats,
} from '@/lib/garageService'
import CarShowcase from './CarShowcase'
import CarSidebar  from './CarSidebar'
import GaragePanel from './GaragePanel'
import AddCarModal  from './AddCarModal'

export default function GaragePage() {
  const router = useRouter()
  const { setVehicle, clearVehicle, clearSearchQuery } = useAppStore()
  const [user,      setUser]      = useState<User | null>(null)
  const [vehicles,  setVehicles]  = useState<GarageVehicle[]>([])
  const [stats,     setStats]     = useState<GarageStats>({ vehiclesCount: 0, favoritesCount: 0, alertsUnreadCount: 0 })
  const [activeCar, setActiveCar] = useState<GarageVehicle | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCar,   setEditingCar]   = useState<GarageVehicle | null>(null)

  function syncSelectedVehicle(vehicle: GarageVehicle | null) {
    clearSearchQuery()

    if (!vehicle) {
      clearVehicle()
      return
    }

    setVehicle({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      engine: vehicle.engine,
      versionLabel: vehicle.versionLabel,
    })
  }

  function handleSelectGarageVehicle(vehicle: GarageVehicle | null) {
    setActiveCar(vehicle)
    syncSelectedVehicle(vehicle)
  }

  useEffect(() => {
    let cancelled = false

    async function loadData(userId: string) {
      const [vehiclesData, statsData] = await Promise.all([
        getGarageVehicles(userId),
        getGarageStats(userId),
      ])
      if (cancelled) return
      setVehicles(vehiclesData)
      setStats(statsData)
      const nextActiveCar = vehiclesData[0] ?? null
      setActiveCar(nextActiveCar)
      syncSelectedVehicle(nextActiveCar)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (!data.session?.user) { router.replace('/login'); return }
      setUser(data.session.user)
      void loadData(data.session.user.id)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (!session?.user) { router.replace('/login'); return }
      setUser(session.user)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function handleCarAdded(car: GarageVehicle) {
    setVehicles((prev) => [car, ...prev])
    setStats((prev) => ({ ...prev, vehiclesCount: prev.vehiclesCount + 1 }))
    setActiveCar(car)
    clearSearchQuery()
    setVehicle({
      brand: car.brand,
      model: car.model,
      year: car.year,
      engine: car.engine,
      versionLabel: car.versionLabel,
    })
    setShowAddModal(false)
  }

  function handleCarUpdated(car: GarageVehicle) {
    setVehicles((prev) => prev.map((item) => (item.id === car.id ? car : item)))
    setActiveCar((prev) => (prev?.id === car.id ? car : prev))
    clearSearchQuery()
    setVehicle({
      brand: car.brand,
      model: car.model,
      year: car.year,
      engine: car.engine,
      versionLabel: car.versionLabel,
    })
    setEditingCar(null)
  }

  function handleCarDeleted(vehicleId: string) {
    setVehicles((prev) => {
      const nextVehicles = prev.filter((item) => item.id !== vehicleId)
      setActiveCar((current) => {
        if (current?.id !== vehicleId) return current
        return nextVehicles[0] ?? null
      })
      const nextActiveVehicle = nextVehicles.find((item) => item.id !== vehicleId) ?? nextVehicles[0] ?? null
      clearSearchQuery()
      if (nextActiveVehicle) {
        setVehicle({
          brand: nextActiveVehicle.brand,
          model: nextActiveVehicle.model,
          year: nextActiveVehicle.year,
          engine: nextActiveVehicle.engine,
          versionLabel: nextActiveVehicle.versionLabel,
        })
      } else {
        clearVehicle()
      }
      return nextVehicles
    })
    setStats((prev) => ({ ...prev, vehiclesCount: Math.max(0, prev.vehiclesCount - 1) }))
    setEditingCar(null)
  }

  if (loading || !user) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: '#080a0c' }}
      >
        <div style={{ color: '#444', fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Cargando garage...
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden flex flex-col"
      style={{ background: '#080a0c' }}
    >
      <div className="garage-layout relative flex flex-1 overflow-hidden" style={{ paddingTop: 126 }}>

        {/* LEFT — sidebar de autos (solo si hay al menos 1) */}
        {vehicles.length > 0 && (
          <CarSidebar
            vehicles={vehicles}
            activeId={activeCar?.id ?? null}
            onSelect={handleSelectGarageVehicle}
            onAdd={() => setShowAddModal(true)}
          />
        )}

        {/* CENTER — showcase del auto activo */}
        <CarShowcase car={activeCar} hasVehicles={vehicles.length > 0} />

        {/* RIGHT — panel del usuario */}
        <GaragePanel
          user={user}
          vehicles={vehicles}
          activeVehicle={activeCar}
          onSelectCar={handleSelectGarageVehicle}
          onEditCar={setEditingCar}
          stats={stats}
          onLogout={handleLogout}
          onAddCar={() => setShowAddModal(true)}
        />

      </div>

      {/* Modal agregar auto */}
      {showAddModal && (
        <AddCarModal
          userId={user.id}
          onClose={() => setShowAddModal(false)}
          onSaved={handleCarAdded}
        />
      )}

      {editingCar && (
        <AddCarModal
          userId={user.id}
          vehicle={editingCar}
          onClose={() => setEditingCar(null)}
          onSaved={handleCarUpdated}
          onDeleted={handleCarDeleted}
        />
      )}
    </div>
  )
}
