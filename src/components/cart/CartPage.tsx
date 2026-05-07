'use client'

import { useAppStore } from '@/lib/cartStore'
import CartItemRow from './CartItem'
import OrderSummary from './OrderSummary'

export default function CartPage() {
  const { cart, cartCount, setView } = useAppStore()
  const count = cartCount()

  return (
    <div
      className="fixed inset-0 z-[450] overflow-y-auto"
      style={{ background: 'var(--dark)' }}
    >
      {/* Topbar */}
      <div
        className="cart-topbar sticky top-0 z-10 flex items-center justify-between px-10 border-b-2"
        style={{ background: 'var(--dark2)', height: 64, borderColor: 'var(--dark3)' }}
      >
        <button
          className="flex items-center gap-2 font-condensed font-bold uppercase tracking-[0.06em] transition-colors duration-200"
          style={{ background: 'none', border: 'none', color: 'var(--gray2)', fontSize: '0.95rem', cursor: 'pointer' }}
          onClick={() => setView('results')}
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
          className="font-condensed font-black italic uppercase text-white"
          style={{ fontSize: '1.4rem' }}
        >
          Mi Carrito
        </div>

        <div
          className="font-condensed font-black uppercase tracking-[0.06em]"
          style={{
            background: 'var(--yellow)',
            color: 'var(--text-dark)',
            padding: '0.3rem 0.8rem',
            borderRadius: 20,
            fontSize: '0.85rem',
          }}
        >
          {count} {count === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
        </div>
      </div>

      {/* Content */}
      <div
        className="cart-grid max-w-[1200px] mx-auto py-8 px-8 grid items-start gap-8"
        style={{ gridTemplateColumns: '1fr 380px' }}
      >
        {/* Items */}
        <div className="flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--gray)' }}>
              <div className="text-6xl mb-4">🛒</div>
              <div className="font-condensed font-bold italic uppercase text-white" style={{ fontSize: '1.4rem' }}>
                Tu carrito está vacío
              </div>
              <button
                onClick={() => setView('results')}
                className="mt-6 font-condensed font-bold italic uppercase"
                style={{
                  background: 'var(--yellow)',
                  color: 'var(--text-dark)',
                  border: 'none',
                  padding: '0.7rem 2rem',
                  borderRadius: 4,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Ver repuestos compatibles
              </button>
            </div>
          ) : (
            cart.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && <OrderSummary />}
      </div>
    </div>
  )
}
