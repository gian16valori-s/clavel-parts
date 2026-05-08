import SolicitudVendedorForm from "@/components/SolicitudVendedorForm";
import AuthTopbar from '@/components/layout/AuthTopbar'

export default function SolicitarVendedorPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #141618 0%, #1c1f23 100%)' }}>
      <AuthTopbar backFallback="/login" />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <SolicitudVendedorForm />
        </div>
      </main>
    </div>
  );
}
