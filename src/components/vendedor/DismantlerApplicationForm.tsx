'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const rudacCategories = ['A', 'B', 'C', 'D', 'E', 'F']

type SubmissionResponse = {
  error?: string
}

export default function DismantlerApplicationForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [emailContacto, setEmailContacto] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setAuthError('No se pudo verificar tu sesión. Volvé a iniciar sesión e intentá nuevamente.')
      const email = data.session?.user.email ?? ''
      setEmailContacto(email)
      setIsAuthenticated(Boolean(data.session?.user))
      setAuthLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const email = session?.user.email ?? ''
      setEmailContacto(email)
      setIsAuthenticated(Boolean(session?.user))
      setAuthLoading(false)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  function toggleCategory(category: string) {
    setSelectedCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (selectedCategories.length === 0) {
      setError('Seleccioná al menos una categoría RUDAC en la que estés inscripto.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error('No se pudo verificar tu sesión. Volvé a iniciar sesión e intentá nuevamente.')
      if (!data.session?.access_token) throw new Error('Iniciá sesión para enviar la solicitud.')
      if (!formRef.current) throw new Error('No se pudo preparar el formulario.')

      const response = await fetch('/api/solicitudes-desarmadero', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        body: new FormData(formRef.current),
      })
      const result = await response.json() as SubmissionResponse
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la solicitud.')

      setSubmitted(true)
      formRef.current.reset()
      setSelectedCategories([])
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return <p className="rounded-lg border border-gray-700 bg-[#11161b] p-5 text-gray-300">Verificando tu cuenta...</p>
  }

  if (authError) {
    return <p role="alert" className="rounded-lg border border-red-800 bg-red-950 p-5 text-red-200">{authError}</p>
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-gray-700 bg-[#11161b] p-6 text-gray-200">
        <h2 className="text-xl font-bold uppercase text-[#f0e040]">Iniciá sesión para continuar</h2>
        <p className="mt-2 text-sm text-gray-400">La solicitud queda asociada a tu cuenta para que podamos contactarte.</p>
        <Link href="/login" className="mt-5 inline-block rounded bg-[#f0e040] px-5 py-3 font-bold uppercase text-black">
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-xl border border-green-800 bg-green-950 p-6 text-green-100">
        <h2 className="text-xl font-bold uppercase">Solicitud enviada</h2>
        <p className="mt-2">Recibimos tus datos y documentación. Clavel Parts revisará la solicitud y te contactará.</p>
        <p className="mt-2 text-sm text-green-200">El envío no crea una cuenta de vendedor ni habilita publicaciones. El alta se realiza manualmente después de la revisión.</p>
        <Link href="/panel" className="mt-5 inline-block rounded bg-[#f0e040] px-5 py-3 font-bold uppercase text-black">
          Volver al perfil vendedor
        </Link>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-700 bg-[#11161b] p-5 text-white md:p-7">
      <div>
        <h2 className="text-2xl font-black uppercase text-[#f0e040]">Solicitud para desarmaderos</h2>
        <p className="mt-2 text-sm text-gray-400">
          Completá la información del comercio y adjuntá la documentación para que Clavel Parts evalúe el alta manual.
        </p>
      </div>

      <div className="rounded-lg border border-amber-900 bg-amber-950/50 p-4 text-sm text-amber-100">
        Enviar la solicitud no habilita a publicar. La categoría RUDAC se revisará junto con la actividad declarada; no implica por sí sola una autorización de Clavel Parts ni un aval estatal.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm md:col-span-2">
          Nombre comercial
          <input name="nombre_comercial" required maxLength={120} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm md:col-span-2">
          Razón social
          <input name="razon_social" required maxLength={160} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm">
          CUIT
          <input name="cuit" required inputMode="numeric" placeholder="00-00000000-0" className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm">
          Representante legal (nombre y apellido)
          <input name="representante_legal" required maxLength={160} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm md:col-span-2">
          Domicilio comercial
          <input name="domicilio_comercial" required maxLength={240} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm">
          Localidad
          <input name="localidad" required maxLength={100} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm">
          Provincia
          <input name="provincia" required maxLength={100} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm">
          Teléfono de contacto
          <input name="telefono" required type="tel" maxLength={40} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
        <label className="text-sm">
          Email de contacto
          <input
            name="email_contacto"
            required
            type="email"
            maxLength={254}
            value={emailContacto}
            onChange={(event) => setEmailContacto(event.target.value)}
            className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3"
          />
        </label>
        <label className="text-sm">
          Número de inscripción RUDAC
          <input name="numero_rudac" required maxLength={80} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-bold">Categorías RUDAC en las que estás inscripto</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {rudacCategories.map((category) => (
            <label key={category} className="flex items-center gap-2 rounded border border-gray-700 px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="categoria"
                value={category}
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              Categoría {category}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4">
        <label className="text-sm">
          Constancia RUDAC vigente (PDF o imagen, hasta 8 MB)
          <input name="documento_rudac" required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-[#f0e040] file:px-3 file:py-2 file:font-bold file:text-black" />
        </label>
        <label className="text-sm">
          Constancia de inscripción fiscal (PDF o imagen, hasta 8 MB)
          <input name="documento_fiscal" required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-[#f0e040] file:px-3 file:py-2 file:font-bold file:text-black" />
        </label>
        <label className="text-sm">
          Habilitación municipal, si corresponde (PDF o imagen)
          <input name="documento_habilitacion" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-[#f0e040] file:px-3 file:py-2 file:font-bold file:text-black" />
        </label>
        <label className="text-sm">
          Documentación adicional (opcional; máximo 3 archivos)
          <input name="documentacion_adicional" multiple type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-[#f0e040] file:px-3 file:py-2 file:font-bold file:text-black" />
        </label>
      </div>

      <label className="block text-sm">
        Comentarios adicionales
        <textarea name="comentarios" maxLength={2000} rows={4} className="mt-1 w-full rounded border border-gray-600 bg-[#080a0c] p-3" />
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-300">
        <input name="acepta_contacto" type="checkbox" required className="mt-1" />
        Autorizo a Clavel Parts a tratar estos datos y documentos para evaluar esta solicitud y contactarme sobre el alta.
      </label>

      {error && <p role="alert" className="rounded border border-red-800 bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      <button type="submit" disabled={submitting} className="w-full rounded bg-[#f0e040] px-5 py-3 font-bold uppercase text-black disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Enviando solicitud...' : 'Enviar solicitud de alta'}
      </button>
    </form>
  )
}
