# clavel-parts
Marketplace especializado en repuestos con compatibilidad asegurada por modelo y versión de tu auto.
Conectamos a los vendedores de repuestos con el clavero (entusiasta de los autos) que quiere encontrar el repuesto correcto para su vehículo. El mundo de las autopartes es complejo por la enorme variedad de piezas y compatibilidades incluso dentro de un mismo modelo, y ClavelParts busca resolver ese problema con una propuesta más clara, específica y orientada a la compatibilidad real.

## Solicitudes de alta para desarmaderos

El formulario del perfil vendedor envía los datos y documentos adjuntos al correo configurado. El envío no crea ni habilita vendedores: el alta se realiza manualmente después de revisar cada solicitud.

Configurar estas variables en el entorno de servidor antes de habilitar el formulario:

- `RESEND_API_KEY`: clave de API del proveedor Resend.
- `DISMANTLER_APPLICATION_TO_EMAIL`: correo que recibe las solicitudes.
- `DISMANTLER_APPLICATION_FROM_EMAIL`: remitente validado en Resend.

El formulario también requiere `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para verificar que la solicitud provenga de una cuenta autenticada. Los documentos se adjuntan al email y no se almacenan en Supabase Storage.

Se admiten PDF, JPG, PNG y WebP, con un máximo de 8 MB por archivo y 20 MB en total. El entorno de despliegue debe permitir ese tamaño de solicitud.

Después de revisar la documentación, el alta se completa manualmente en `vendedores` y se habilita el acceso a donantes insertando el vendedor autorizado en `perfiles_desarmadero`. Esa tabla no permite altas desde el cliente; el alta o suspensión debe gestionarse desde un canal administrativo confiable.
