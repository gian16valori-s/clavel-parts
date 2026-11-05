import Link from 'next/link'
import DismantlerApplicationForm from '@/components/vendedor/DismantlerApplicationForm'

export default function DismantlerApplicationPage() {
  return (
    <main className="min-h-screen bg-[#080a0c] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/panel" className="text-sm font-bold uppercase text-[#f0e040]">← Volver al perfil vendedor</Link>
        <div className="mt-5">
          <DismantlerApplicationForm />
        </div>
      </div>
    </main>
  )
}
