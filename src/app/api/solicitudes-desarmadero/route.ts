import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const ALLOWED_CATEGORIES = new Set(['A', 'B', 'C', 'D', 'E', 'F'])
const EXTENSIONS_BY_TYPE: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
}

type AttachmentInput = {
  field: string
  description: string
  required?: boolean
  multiple?: boolean
  maximumFiles?: number
}

function getTextField(formData: FormData, name: string, maximumLength: number) {
  const value = formData.get(name)
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maximumLength)
}

function escapeEmailText(value: string) {
  return value.replace(/[\r\n\x00-\x1f\x7f]/g, ' ')
}

function safeFilename(filename: string) {
  const cleaned = filename.replace(/[^\w.-]+/g, '_').replace(/^\.+/, '')
  return (cleaned || 'documento').slice(0, 100)
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
  let value = ''
  for (let index = start; index < end; index += 1) {
    value += String.fromCharCode(bytes[index])
  }
  return value
}

async function matchesFileType(file: File) {
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  switch (file.type) {
    case 'application/pdf':
      return readAscii(signature, 0, 5) === '%PDF-'
    case 'image/jpeg':
      return signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff
    case 'image/png':
      return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
        .every((byte, index) => signature[index] === byte)
    case 'image/webp':
      return readAscii(signature, 0, 4) === 'RIFF'
        && readAscii(signature, 8, 12) === 'WEBP'
    default:
      return false
  }
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!accessToken) {
    return Response.json({ error: 'Iniciá sesión para enviar la solicitud.' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Faltan las variables de Supabase para validar la cuenta que solicita el alta.')
    return Response.json({ error: 'El servicio no está configurado correctamente.' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await supabase.auth.getUser(accessToken)
  if (authError || !userData.user?.email) {
    return Response.json({ error: 'La sesión no es válida. Iniciá sesión nuevamente.' }, { status: 401 })
  }

  const recipient = process.env.DISMANTLER_APPLICATION_TO_EMAIL
  const sender = process.env.DISMANTLER_APPLICATION_FROM_EMAIL
  const resendApiKey = process.env.RESEND_API_KEY
  if (!recipient || !sender || !resendApiKey) {
    console.error('Falta configurar el destinatario, remitente o clave de Resend para solicitudes de desarmadero.')
    return Response.json({ error: 'El envío de solicitudes todavía no está configurado. Contactá a Clavel Parts.' }, { status: 503 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'No se pudo leer el formulario. Revisá los archivos e intentá nuevamente.' }, { status: 400 })
  }

  const fields = {
    nombreComercial: getTextField(formData, 'nombre_comercial', 120),
    razonSocial: getTextField(formData, 'razon_social', 160),
    cuit: getTextField(formData, 'cuit', 32),
    representanteLegal: getTextField(formData, 'representante_legal', 160),
    domicilioComercial: getTextField(formData, 'domicilio_comercial', 240),
    localidad: getTextField(formData, 'localidad', 100),
    provincia: getTextField(formData, 'provincia', 100),
    telefono: getTextField(formData, 'telefono', 40),
    emailContacto: getTextField(formData, 'email_contacto', 254),
    numeroRudac: getTextField(formData, 'numero_rudac', 80),
    comentarios: getTextField(formData, 'comentarios', 2000),
  }

  if (Object.entries(fields).some(([name, value]) => name !== 'comentarios' && !value)) {
    return Response.json({ error: 'Completá todos los campos obligatorios.' }, { status: 400 })
  }

  if (!/^[\d\s-]+$/.test(fields.cuit) || fields.cuit.replace(/\D/g, '').length !== 11) {
    return Response.json({ error: 'El CUIT debe contener 11 dígitos.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.emailContacto)) {
    return Response.json({ error: 'Ingresá un email de contacto válido.' }, { status: 400 })
  }

  if (formData.get('acepta_contacto') !== 'on') {
    return Response.json({ error: 'Debés aceptar el uso de los datos para enviar la solicitud.' }, { status: 400 })
  }

  const categories = formData.getAll('categoria')
    .filter((value): value is string => typeof value === 'string')
  if (categories.length === 0 || categories.some((category) => !ALLOWED_CATEGORIES.has(category))) {
    return Response.json({ error: 'Seleccioná una o más categorías RUDAC válidas.' }, { status: 400 })
  }

  const attachmentInputs: AttachmentInput[] = [
    { field: 'documento_rudac', description: 'Constancia RUDAC', required: true },
    { field: 'documento_fiscal', description: 'Constancia de inscripción fiscal', required: true },
    { field: 'documento_habilitacion', description: 'Habilitación municipal' },
    { field: 'documentacion_adicional', description: 'Documentación adicional', multiple: true, maximumFiles: 3 },
  ]

  const selectedFiles: Array<{ file: File; description: string }> = []
  for (const input of attachmentInputs) {
    const values = input.multiple ? formData.getAll(input.field) : [formData.get(input.field)]
    const files = values.filter((value): value is File => value instanceof File && value.size > 0)
    if (input.required && files.length !== 1) {
      return Response.json({ error: `Adjuntá ${input.description.toLowerCase()}.` }, { status: 400 })
    }
    if (files.length > (input.maximumFiles ?? 1)) {
      return Response.json({ error: `Podés adjuntar hasta ${input.maximumFiles} archivos de ${input.description.toLowerCase()}.` }, { status: 400 })
    }
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        return Response.json({ error: 'Los documentos deben estar en PDF, JPG, PNG o WebP.' }, { status: 400 })
      }
      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ error: 'Cada archivo puede pesar hasta 8 MB.' }, { status: 400 })
      }
      const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (!EXTENSIONS_BY_TYPE[file.type].includes(extension) || !(await matchesFileType(file))) {
        return Response.json({ error: 'El tipo de archivo no coincide con su contenido. Revisá el documento e intentá nuevamente.' }, { status: 400 })
      }
      selectedFiles.push({ file, description: input.description })
    }
  }

  const totalFileSize = selectedFiles.reduce((total, item) => total + item.file.size, 0)
  if (totalFileSize > MAX_TOTAL_FILE_SIZE) {
    return Response.json({ error: 'El tamaño total de los archivos no puede superar 20 MB.' }, { status: 400 })
  }

  const attachments = await Promise.all(selectedFiles.map(async ({ file }) => ({
    filename: safeFilename(file.name),
    content: Buffer.from(await file.arrayBuffer()).toString('base64'),
    content_type: file.type,
  })))

  const safeFields = Object.fromEntries(
    Object.entries(fields).map(([name, value]) => [name, escapeEmailText(value)])
  ) as typeof fields
  const emailLines = [
    'Nueva solicitud de alta profesional de desarmadero',
    '',
    `Cuenta Clavel Parts: ${escapeEmailText(userData.user.email)}`,
    `Nombre comercial: ${safeFields.nombreComercial}`,
    `Razón social: ${safeFields.razonSocial}`,
    `CUIT: ${safeFields.cuit}`,
    `Representante legal: ${safeFields.representanteLegal}`,
    `Domicilio comercial: ${safeFields.domicilioComercial}`,
    `Localidad: ${safeFields.localidad}`,
    `Provincia: ${safeFields.provincia}`,
    `Teléfono: ${safeFields.telefono}`,
    `Email de contacto: ${safeFields.emailContacto}`,
    `Número RUDAC: ${safeFields.numeroRudac}`,
    `Categorías declaradas: ${categories.join(', ')}`,
    `Comentarios: ${safeFields.comentarios || 'Sin comentarios'}`,
    '',
    'La solicitud requiere revisión y alta manual. La categoría declarada no constituye aprobación automática.',
    '',
    'Documentación adjunta:',
    ...selectedFiles.map(({ file, description }) => `- ${description}: ${safeFilename(file.name)}`),
  ]

  let emailResponse: Response
  try {
    emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: fields.emailContacto,
        subject: `Solicitud de desarmadero: ${safeFields.nombreComercial} - CUIT ${safeFields.cuit}`,
        text: emailLines.join('\n'),
        attachments,
      }),
    })
  } catch (error) {
    console.error('No se pudo conectar con el servicio de correo:', error)
    return Response.json({ error: 'No se pudo conectar con el servicio de correo. Intentá nuevamente más tarde.' }, { status: 502 })
  }

  if (!emailResponse.ok) {
    console.error('El servicio de correo rechazó la solicitud:', emailResponse.status)
    return Response.json({ error: 'No se pudo enviar la solicitud por email. Intentá nuevamente más tarde.' }, { status: 502 })
  }

  return Response.json({ success: true })
}
