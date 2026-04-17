"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getVendedorActual } from '@/lib/vendedorAuth';
import ProductForm from '@/components/vendedor/ProductForm';

export default function VenderPage() {
  const router = useRouter();
  const [vendedor, setVendedor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const session = await getSession();
      if (!session?.user) {
        router.replace('/login/vendedor');
        return;
      }
      const vendedorActual = await getVendedorActual();
      if (!vendedorActual) {
        setError('No tienes permisos de vendedor.');
      }
      setVendedor(vendedorActual);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return <div style={{color:'#fff',textAlign:'center',marginTop:40}}>Cargando...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:40}}>{error}</div>;
  if (!vendedor) return null;

  console.log("vendedor:", vendedor);
  console.log("url:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'var(--dark)' }}>
      <div className="max-w-xl mx-auto">
        <h1 className="font-condensed font-black italic uppercase mb-6" style={{ fontSize: '2rem', color: 'var(--yellow)' }}>
          Publicar producto
        </h1>
        <ProductForm vendedorId={vendedor.id} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!} />
      </div>
    </main>
  );
}
