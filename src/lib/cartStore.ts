import { create } from 'zustand'

export interface CartProduct {
  id: string
  name: string
  brand: string
  ref: string
  price: number
  seller: string
  sellerRating: number
  delivery: string
  category: string
  image?: string
  qty: number
}

export interface SelectedVehicle {
  brand: string
  model: string
  engine: string
  year: string
  versionLabel?: string
  versionId?: number
}

interface AppState {
  // Cart
  cart: CartProduct[]
  addToCart: (product: Omit<CartProduct, 'qty'>) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number

  // Selected vehicle
  vehicle: SelectedVehicle | null
  setVehicle: (v: SelectedVehicle) => void
  clearVehicle: () => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearchQuery: () => void

  // UI state
  currentView: 'home' | 'results' | 'cart' | 'garage' | 'racers-edge-home' | 'racers-edge-catalog'
  setView: (v: 'home' | 'results' | 'cart' | 'garage' | 'racers-edge-home' | 'racers-edge-catalog') => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Cart ──
  cart: [],

  addToCart: (product) => {
    const { cart } = get()
    const existing = cart.find((p) => p.id === product.id)
    if (existing) {
      set({ cart: cart.map((p) => p.id === product.id ? { ...p, qty: p.qty + 1 } : p) })
    } else {
      set({ cart: [...cart, { ...product, qty: 1 }] })
    }
  },

  removeFromCart: (id) => {
    set({ cart: get().cart.filter((p) => p.id !== id) })
  },

  updateQty: (id, delta) => {
    const updated = get().cart
      .map((p) => p.id === id ? { ...p, qty: p.qty + delta } : p)
      .filter((p) => p.qty > 0)
    set({ cart: updated })
  },

  clearCart: () => set({ cart: [] }),

  cartTotal: () => get().cart.reduce((acc, p) => acc + p.price * p.qty, 0),

  cartCount: () => get().cart.reduce((acc, p) => acc + p.qty, 0),

  // ── Vehicle ──
  vehicle: null,
  setVehicle: (v) => set({ vehicle: v }),
  clearVehicle: () => set({ vehicle: null }),

  // ── Search ──
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query.trim() }),
  clearSearchQuery: () => set({ searchQuery: '' }),

  // ── UI ──
  currentView: 'home',
  setView: (v) => set({ currentView: v }),
}))

// ── Demo products (BMW Serie 1 130i 2009) ──
export const demoProducts: Omit<CartProduct, 'qty'>[] = [
  { id: '1', name: 'Pastillas de freno delanteras', brand: 'Brembo',  ref: 'P06098',        price: 28500,  seller: 'Frenos del Sur',       sellerRating: 5, delivery: '3-5',  category: 'frenos' },
  { id: '2', name: 'Filtro de aceite',               brand: 'Bosch',   ref: 'F026407006',    price: 8200,   seller: 'Auto Repuestos GBA',   sellerRating: 5, delivery: '2-4',  category: 'filtros' },
  { id: '3', name: 'Amortiguador delantero (x1)',    brand: 'Sachs',   ref: '312 584',       price: 54000,  seller: 'Suspensiones Cañon',   sellerRating: 4, delivery: '5-7',  category: 'amortiguacion' },
  { id: '4', name: 'Disco de freno delantero',       brand: 'Brembo',  ref: '09.C328.11',    price: 42800,  seller: 'Frenos del Sur',       sellerRating: 5, delivery: '3-5',  category: 'frenos' },
  { id: '5', name: 'Filtro de aire',                 brand: 'Mahle',   ref: 'LX 1804',       price: 11400,  seller: 'Auto Repuestos GBA',   sellerRating: 5, delivery: '2-4',  category: 'filtros' },
  { id: '6', name: 'Kit de embrague completo',       brand: 'Valeo',   ref: '835067',        price: 118000, seller: 'Importadora BSport',   sellerRating: 4, delivery: '7-10', category: 'embrague' },
]
