'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  getDisplayName,
  getDisplayInitial,
  getBitacoraByVehicle,
  getUserFavorites,
  getUserAlerts,
  markAlertRead,
  type GarageVehicle,
  type GarageBitacoraEntry,
  type UserFavorite,
  type UserAlert,
  type GarageStats,
} from '@/lib/garageService'

type ActiveTab = 'datos' | 'bitacora' | 'favoritos' | 'alertas'

const typeColors: Record<string, string> = {
  compra:     '#f0e040',
  service:    '#6ee7b7',
  reparacion: '#f97316',
  revision:   '#8a9299',
}
const typeLabels: Record<string, string> = {
  compra:     'Compra',
  service:    'Service',
  reparacion: 'Reparación',
  revision:   'Revisión',
}

interface GaragePanelProps {
  user: User
  vehicles: GarageVehicle[]
  activeVehicle: GarageVehicle | null
  onSelectCar: (car: GarageVehicle | null) => void
  onEditCar: (car: GarageVehicle) => void
  onAddCar: () => void
  stats: GarageStats
  onLogout: () => Promise<void>
}

export default function GaragePanel({ user, vehicles, activeVehicle, onSelectCar, onEditCar, onAddCar, stats, onLogout }: GaragePanelProps) {
  const [activeTab,   setActiveTab]   = useState<ActiveTab>('datos')
  const [autosOpen,   setAutosOpen]   = useState(false)
  const [bitacora,    setBitacora]    = useState<GarageBitacoraEntry[]>([])
  const [favorites,   setFavorites]   = useState<UserFavorite[]>([])
  const [alerts,      setAlerts]      = useState<UserAlert[]>([])
  const [loading,     setLoading]     = useState(false)

  const displayName = getDisplayName(user)
  const initial     = getDisplayInitial(user)

  useEffect(() => {
    if (activeTab !== 'bitacora' || !activeVehicle) return
    setLoading(true)
    getBitacoraByVehicle(activeVehicle.id)
      .then(setBitacora)
      .finally(() => setLoading(false))
  }, [activeTab, activeVehicle])

  useEffect(() => {
    if (activeTab !== 'favoritos') return
    setLoading(true)
    getUserFavorites(user.id)
      .then(setFavorites)
      .finally(() => setLoading(false))
  }, [activeTab, user.id])

  useEffect(() => {
    if (activeTab !== 'alertas') return
    setLoading(true)
    getUserAlerts(user.id)
      .then(setAlerts)
      .finally(() => setLoading(false))
  }, [activeTab, user.id])

  async function handleMarkRead(alertId: string) {
    await markAlertRead(alertId)
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)))
  }

  const tabs: { id: ActiveTab; label: string; badge?: number }[] = [
    { id: 'datos',     label: 'DATOS' },
    { id: 'bitacora',  label: 'BITÁCORA' },
    { id: 'favoritos', label: 'FAV',    badge: stats.favoritesCount    || undefined },
    { id: 'alertas',   label: 'ALERTAS', badge: stats.alertsUnreadCount || undefined },
  ]

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        width: 'clamp(360px, 38vw, 480px)',
        background: 'rgba(10,12,14,0.97)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {/* ── Tabs ── */}
      <div
        className="flex flex-shrink-0 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1 py-3 font-condensed font-bold uppercase"
              style={{
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                color: isActive ? 'var(--yellow)' : 'var(--gray)',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--yellow)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s',
                marginBottom: -1,
              }}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="flex items-center justify-center font-black"
                  style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--yellow)', color: '#000', fontSize: '0.58rem',
                  }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* MIS DATOS */}
        {activeTab === 'datos' && (
          <div>
            {/* Profile header */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center font-black flex-shrink-0"
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '2px solid var(--yellow)',
                    color: 'var(--yellow)', fontSize: '1.3rem',
                    fontFamily: '"Barlow Condensed", sans-serif',
                    background: 'transparent',
                  }}
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  <div
                    className="font-black uppercase truncate"
                    style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.05em', fontFamily: '"Barlow Condensed", sans-serif' }}
                  >
                    {displayName}
                  </div>
                  <div className="truncate" style={{ color: '#777', fontSize: '0.72rem', marginTop: 1 }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 text-center">
                {[
                  { value: stats.vehiclesCount,     label: 'AUTOS'    },
                  { value: stats.favoritesCount,    label: 'FAVORITOS' },
                  { value: stats.alertsUnreadCount, label: 'ALERTAS'   },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
                  >
                    <div
                      className="font-black"
                      style={{ color: '#fff', fontSize: '1.5rem', lineHeight: 1.1, fontFamily: '"Barlow Condensed", sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ color: '#555', fontSize: '0.58rem', marginTop: 1, letterSpacing: '0.08em' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">

              {/* MIS AUTOS — expandible */}
              <div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onClick={() => setAutosOpen((v) => !v)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#888' }}>
                    <IconAutos />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold uppercase" style={{ color: '#e8e8e8', fontSize: '0.78rem', letterSpacing: '0.05em', fontFamily: '"Barlow Condensed", sans-serif' }}>
                      MIS AUTOS
                    </div>
                    <div style={{ color: '#555', fontSize: '0.66rem', marginTop: 1 }}>
                      {vehicles.length === 0 ? 'Ningún auto cargado' : `${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth={2}
                    style={{ width: 14, height: 14, flexShrink: 0, transition: 'transform 0.2s', transform: autosOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {autosOpen && (
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: 260, background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {vehicles.length === 0 ? (
                      <div className="flex flex-col items-center text-center py-8 px-4 gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} style={{ width: 40, height: 40 }}>
                          <rect x="1" y="8" width="22" height="10" rx="2" />
                          <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" />
                          <circle cx="7" cy="18" r="1.5" />
                          <circle cx="17" cy="18" r="1.5" />
                        </svg>
                        <p style={{ color: '#444', fontSize: '0.78rem', lineHeight: 1.5 }}>
                          Aún no tenés autos cargados
                        </p>
                        <button
                          onClick={onAddCar}
                          className="font-condensed font-bold uppercase rounded-md px-4 py-2"
                          style={{ background: 'var(--yellow)', color: 'var(--text-dark)', border: 'none', cursor: 'pointer', fontSize: '0.78rem', letterSpacing: '0.06em', marginTop: 4 }}
                        >
                          + Agregar auto
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { onSelectCar(null); setAutosOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-3"
                          style={{
                            background: activeVehicle === null ? 'rgba(240,224,64,0.07)' : 'none',
                            border: 'none',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => { if (activeVehicle !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                          onMouseLeave={(e) => { if (activeVehicle !== null) e.currentTarget.style.background = 'none' }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0 rounded"
                            style={{ width: 44, height: 36, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke={activeVehicle === null ? 'var(--yellow)' : '#444'} strokeWidth={1.2} style={{ width: 22, height: 22 }}>
                              <rect x="1" y="8" width="22" height="10" rx="2" />
                              <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" />
                              <circle cx="7" cy="18" r="1.5" />
                              <circle cx="17" cy="18" r="1.5" />
                              <line x1="5" y1="5" x2="19" y2="19" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-black uppercase truncate"
                              style={{ color: activeVehicle === null ? 'var(--yellow)' : '#ddd', fontSize: '0.78rem', letterSpacing: '0.04em', fontFamily: '"Barlow Condensed", sans-serif' }}
                            >
                              Ninguno
                            </div>
                            <div style={{ color: '#555', fontSize: '0.66rem' }}>
                              Mostrar garage vacío
                            </div>
                          </div>
                          {activeVehicle === null && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)', flexShrink: 0 }} />
                          )}
                        </button>

                        {vehicles.map((car) => {
                        const isActive = car.id === activeVehicle?.id
                        return (
                          <div
                            key={car.id}
                            className="flex items-center gap-2 px-3 py-2"
                            style={{
                              background: isActive ? 'rgba(240,224,64,0.07)' : 'none',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <button
                              onClick={() => { onSelectCar(car); setAutosOpen(false) }}
                              className="flex-1 flex items-center gap-3 py-1"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.88' }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                            >
                              <div
                                className="flex items-center justify-center flex-shrink-0 rounded"
                                style={{ width: 44, height: 36, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}
                              >
                                {car.photo ? (
                                  <img src={car.photo} alt={car.brand} className="w-full h-full object-cover" />
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--yellow)' : '#333'} strokeWidth={1.2} style={{ width: 22, height: 22 }}>
                                    <rect x="1" y="8" width="22" height="10" rx="2" />
                                    <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" />
                                    <circle cx="7" cy="18" r="1.5" />
                                    <circle cx="17" cy="18" r="1.5" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="font-black uppercase truncate"
                                  style={{ color: isActive ? 'var(--yellow)' : '#ddd', fontSize: '0.78rem', letterSpacing: '0.04em', fontFamily: '"Barlow Condensed", sans-serif' }}
                                >
                                  {car.brand} {car.model}
                                </div>
                                <div style={{ color: '#555', fontSize: '0.66rem' }}>
                                  {car.year}{car.plate ? ` · ${car.plate}` : ''}
                                </div>
                              </div>
                              {isActive && (
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)', flexShrink: 0 }} />
                              )}
                            </button>
                            <button
                              onClick={() => onEditCar(car)}
                              className="font-condensed font-bold uppercase"
                              style={{
                                background: 'none',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#b8bcc2',
                                fontSize: '0.64rem',
                                letterSpacing: '0.08em',
                                padding: '0.45rem 0.6rem',
                                borderRadius: 8,
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              Editar
                            </button>
                          </div>
                        )
                      })}
                      </>
                    )}
                  </div>
                )}
              </div>

              {[
                { icon: IconCompras,  label: 'MIS COMPRAS',   sublabel: 'Historial de pedidos' },
                { icon: IconPerfil,   label: 'MI PERFIL',     sublabel: user.email ?? '' },
                { icon: IconConfig,   label: 'CONFIGURACIÓN', sublabel: 'Dirección, pagos, seguridad' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#888' }}
                  >
                    <item.icon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-bold uppercase"
                      style={{ color: '#e8e8e8', fontSize: '0.78rem', letterSpacing: '0.05em', fontFamily: '"Barlow Condensed", sans-serif' }}
                    >
                      {item.label}
                    </div>
                    <div className="truncate" style={{ color: '#555', fontSize: '0.66rem', marginTop: 1 }}>
                      {item.sublabel}
                    </div>
                  </div>
                </button>
              ))}

              {/* Logout */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 mt-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#f87171' }}
                onClick={onLogout}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(220,38,38,0.1)', color: '#f87171' }}
                >
                  <IconLogout />
                </div>
                <div
                  className="font-bold uppercase"
                  style={{ fontSize: '0.78rem', letterSpacing: '0.05em', fontFamily: '"Barlow Condensed", sans-serif' }}
                >
                  Cerrar sesión
                </div>
              </button>
            </div>
          </div>
        )}

        {/* BITÁCORA */}
        {activeTab === 'bitacora' && (
          <div className="p-4">
            {!activeVehicle ? (
              <EmptyState icon="🚗" text="Seleccioná un auto para ver su historial de mantenimiento" />
            ) : loading ? (
              <LoadingState />
            ) : bitacora.length === 0 ? (
              <EmptyState
                icon="📋"
                text={`Todavía no hay entradas para tu ${activeVehicle.brand} ${activeVehicle.model}`}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {bitacora.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg p-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span
                        className="px-2 py-0.5 rounded font-condensed font-bold uppercase"
                        style={{
                          background: `${typeColors[entry.type] ?? '#888'}22`,
                          color: typeColors[entry.type] ?? '#888',
                          fontSize: '0.62rem', letterSpacing: '0.08em',
                        }}
                      >
                        {typeLabels[entry.type] ?? entry.type}
                      </span>
                      <span style={{ color: '#444', fontSize: '0.66rem' }}>
                        {new Date(entry.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-bold" style={{ color: '#e8e8e8', fontSize: '0.82rem', marginBottom: 2 }}>
                      {entry.description}
                    </div>
                    {entry.parts && entry.parts.length > 0 && (
                      <div style={{ color: '#555', fontSize: '0.68rem' }}>
                        {entry.parts.join(' · ')}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {entry.cost > 0 && (
                        <span style={{ color: 'var(--yellow)', fontSize: '0.8rem', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700 }}>
                          ${entry.cost.toLocaleString('es-AR')}
                        </span>
                      )}
                      <span style={{ color: '#444', fontSize: '0.66rem', marginLeft: 'auto' }}>
                        {entry.km.toLocaleString('es-AR')} km
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="p-4">
            {loading ? (
              <LoadingState />
            ) : favorites.length === 0 ? (
              <EmptyState icon="⭐" text="Guardá repuestos como favoritos para acceder rápido desde tu garage" />
            ) : (
              <div className="flex flex-col gap-2">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {fav.productos?.imagen_url ? (
                      <img
                        src={fav.productos.imagen_url}
                        alt={fav.productos.producto}
                        className="rounded object-cover flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      />
                    ) : (
                      <div
                        className="rounded flex items-center justify-center flex-shrink-0"
                        style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth={1.5} style={{ width: 20, height: 20 }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18M9 21V9" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate" style={{ color: '#e8e8e8', fontSize: '0.8rem' }}>
                        {fav.productos?.producto ?? `Producto #${fav.producto_id}`}
                      </div>
                      {fav.productos?.marca_pieza && (
                        <div style={{ color: '#555', fontSize: '0.68rem' }}>{fav.productos.marca_pieza}</div>
                      )}
                      {fav.productos?.precio !== null && fav.productos?.precio !== undefined && (
                        <div style={{ color: 'var(--yellow)', fontSize: '0.78rem', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700 }}>
                          ${fav.productos.precio.toLocaleString('es-AR')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALERTAS */}
        {activeTab === 'alertas' && (
          <div className="p-4">
            {loading ? (
              <LoadingState />
            ) : alerts.length === 0 ? (
              <EmptyState icon="🔔" text="No tenés alertas nuevas" />
            ) : (
              <div className="flex flex-col gap-2">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => { if (!alert.read) void handleMarkRead(alert.id) }}
                    className="w-full rounded-lg p-3 text-left"
                    style={{
                      background: alert.read ? 'rgba(255,255,255,0.02)' : 'rgba(240,224,64,0.05)',
                      border: `1px solid ${alert.read ? 'rgba(255,255,255,0.04)' : 'rgba(240,224,64,0.14)'}`,
                      cursor: alert.read ? 'default' : 'pointer',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold" style={{ color: alert.read ? '#666' : '#e8e8e8', fontSize: '0.8rem' }}>
                        {alert.title}
                      </div>
                      {!alert.read && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--yellow)', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                    {alert.body && (
                      <div style={{ color: '#555', fontSize: '0.7rem', marginTop: 3 }}>{alert.body}</div>
                    )}
                    <div style={{ color: '#3a3a3a', fontSize: '0.63rem', marginTop: 4 }}>
                      {new Date(alert.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4 gap-3">
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <p style={{ color: '#444', fontSize: '0.82rem', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div style={{ color: '#444', fontSize: '0.82rem', fontFamily: '"Barlow Condensed", sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Cargando...
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconAutos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={17} height={17}>
      <rect x="1" y="8" width="22" height="10" rx="2" />
      <path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  )
}

function IconCompras() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={17} height={17}>
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  )
}

function IconPerfil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={17} height={17}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconConfig() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={17} height={17}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={17} height={17}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
