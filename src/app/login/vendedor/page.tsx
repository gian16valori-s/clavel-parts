'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirección — el login es único, ya no hay distinción comprador/vendedor.
// El acceso al panel se hace desde el dropdown de usuario una vez logueado.
export default function LoginVendedorRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/login')
  }, [router])
  return null
}
