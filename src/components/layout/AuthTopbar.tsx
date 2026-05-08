'use client'

import { useRouter } from 'next/navigation'

type AuthTopbarProps = {
  backFallback?: string
}

export default function AuthTopbar({ backFallback = '/' }: AuthTopbarProps) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push(backFallback)
  }

  return (
    <div
      className="w-full h-[62px] border-b flex items-center justify-between px-4 sm:px-6"
      style={{ background: 'rgba(10,12,14,0.85)', borderColor: 'var(--dark4)' }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="font-condensed font-bold uppercase tracking-[0.06em]"
        style={{ background: 'transparent', border: 'none', color: 'var(--gray2)', cursor: 'pointer' }}
      >
        ← Volver
      </button>

      <div className="font-condensed font-black italic uppercase" style={{ fontSize: '1.5rem', color: 'var(--yellow)' }}>
        CLAVEL PARTS
      </div>

      <div style={{ width: 64 }} />
    </div>
  )
}
