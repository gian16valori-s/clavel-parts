import SolicitudVendedorForm from "@/components/SolicitudVendedorForm";

export default function SolicitarVendedorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'linear-gradient(135deg, #141618 0%, #1c1f23 100%)' }}>
      <div className="w-full max-w-lg">
        <SolicitudVendedorForm />
      </div>
    </main>
  );
}
