'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, getVendedorActual, type Vendedor } from '@/lib/vendedorAuth'
import { getProductosVendedorActual, type ProductoVendedorResumen } from '@/lib/vendedorProducts'
import { createClient } from '@/lib/supabase'
import { deleteProductImages, getProductImages, uploadProductImage } from '@/lib/productImages'

type ProductoEditable = {
  id: number
  sku: string
  producto: string
  marca_pieza: string | null
  numero_parte_oem: string | null
  precio: number | null
  stock: number | null
  activo: boolean | null
  liquidacion: boolean | null
}

type ImageSlot = {
  recordId: number | null
  url: string | null
  preview: string | null
  file: File | null
}

function emptySlots(): ImageSlot[] {
  return [
    { recordId: null, url: null, preview: null, file: null },
    { recordId: null, url: null, preview: null, file: null },
    { recordId: null, url: null, preview: null, file: null },
  ]
}

function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/product-images/'
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

export default function PanelProductosPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [productos, setProductos] = useState<ProductoVendedorResumen[]>([])
  const [editingProduct, setEditingProduct] = useState<ProductoEditable | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editMarca, setEditMarca] = useState('')
  const [editNumeroParte, setEditNumeroParte] = useState('')
  const [editPrecio, setEditPrecio] = useState<number | ''>('')
  const [editStock, setEditStock] = useState<number | ''>('')
  const [editActivo, setEditActivo] = useState(true)
  const [editLiquidacion, setEditLiquidacion] = useState(false)
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(emptySlots())
  const [editLoading, setEditLoading] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  async function reloadProducts() {
    const productsResult = await getProductosVendedorActual()
    if (productsResult.error) {
      setError(productsResult.error)
    }
    setProductos(productsResult.data)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const session = await getSession()
        if (!session?.user) {
          router.replace('/login/vendedor')
          return
        }

        setUserEmail(session.user.email ?? '')

        const vendedorActual = await getVendedorActual()
        if (!vendedorActual) {
          setError('No estas habilitado como vendedor.')
          return
        }

        setVendedor(vendedorActual)
        await reloadProducts()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus productos.')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [router])

  function closeEditor() {
    setEditingProduct(null)
    setEditError('')
    setEditSuccess('')
    setSavingEdit(false)
    setDeletingProduct(false)
    setImageSlots(emptySlots())
  }

  async function openEditor(productId: number) {
    if (!vendedor) return
    setEditLoading(true)
    setEditError('')
    setEditSuccess('')

    try {
      const { data, error: fetchError } = await supabase
        .from('productos')
        .select('id, sku, producto, marca_pieza, numero_parte_oem, precio, stock, activo, liquidacion, vendedor_id')
        .eq('id', productId)
        .eq('vendedor_id', vendedor.id)
        .single()

      if (fetchError || !data) {
        throw new Error(fetchError?.message || 'No se pudo abrir el producto para editar.')
      }

      const product = data as ProductoEditable
      setEditingProduct(product)
      setEditNombre(product.producto || '')
      setEditMarca(product.marca_pieza || '')
      setEditNumeroParte(product.numero_parte_oem || '')
      setEditPrecio(Number(product.precio ?? 0))
      setEditStock(Number(product.stock ?? 0))
      setEditActivo(product.activo !== false)
      setEditLiquidacion(Boolean(product.liquidacion))

      const imageRows = await getProductImages(supabase, productId)
      const sortedImages = imageRows.sort((a, b) => a.orden - b.orden).slice(0, 3)
      const nextSlots = emptySlots()
      sortedImages.forEach((image, index) => {
        nextSlots[index] = {
          recordId: image.id,
          url: image.url,
          preview: image.url,
          file: null,
        }
      })
      setImageSlots(nextSlots)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo abrir el editor.')
    } finally {
      setEditLoading(false)
    }
  }

  function onEditImageChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const preview = (ev.target?.result as string) || null
      setImageSlots((prev) => {
        const next = [...prev]
        next[index] = {
          ...next[index],
          preview,
          file,
        }
        return next
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removeEditImage(index: number) {
    setImageSlots((prev) => {
      const next = [...prev]
      next[index] = { recordId: null, url: null, preview: null, file: null }
      return next
    })
  }

  async function handleSaveEdit() {
    if (!editingProduct || !vendedor) return
    if (savingEdit) return

    const precioNum = Number(editPrecio)
    const stockNum = Number(editStock)

    if (!editNombre.trim()) {
      setEditError('El nombre del producto es requerido.')
      return
    }
    if (!editMarca.trim()) {
      setEditError('La marca es requerida.')
      return
    }
    if (!precioNum || precioNum <= 0) {
      setEditError('El precio es invalido.')
      return
    }
    if (stockNum < 0) {
      setEditError('El stock no puede ser negativo.')
      return
    }

    setSavingEdit(true)
    setEditError('')
    setEditSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('productos')
        .update({
          producto: editNombre.trim(),
          marca_pieza: editMarca.trim(),
          numero_parte_oem: editNumeroParte.trim() || null,
          precio: precioNum,
          stock: stockNum,
          activo: editActivo,
          liquidacion: editLiquidacion,
        })
        .eq('id', editingProduct.id)
        .eq('vendedor_id', vendedor.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      for (let i = 0; i < imageSlots.length; i++) {
        const slot = imageSlots[i]
        const orden = i + 1

        if (!slot.preview && slot.recordId) {
          const { error: deleteRowError } = await supabase
            .from('fotos_producto')
            .delete()
            .eq('id', slot.recordId)
            .eq('producto_id', editingProduct.id)

          if (deleteRowError) {
            throw new Error(deleteRowError.message)
          }
        }

        if (slot.file) {
          if (slot.recordId) {
            const { error: deleteOldError } = await supabase
              .from('fotos_producto')
              .delete()
              .eq('id', slot.recordId)
              .eq('producto_id', editingProduct.id)

            if (deleteOldError) {
              throw new Error(deleteOldError.message)
            }
          }

          await uploadProductImage({
            supabase,
            file: slot.file,
            productoId: editingProduct.id,
            vendedorId: vendedor.id,
            orden,
          })
        }
      }

      const refreshedImages = await getProductImages(supabase, editingProduct.id)
      const firstImage = refreshedImages.sort((a, b) => a.orden - b.orden)[0]

      const { error: imageUpdateError } = await supabase
        .from('productos')
        .update({ imagen_url: firstImage?.url || null })
        .eq('id', editingProduct.id)
        .eq('vendedor_id', vendedor.id)

      if (imageUpdateError) {
        throw new Error(imageUpdateError.message)
      }

      setEditSuccess('Producto actualizado correctamente.')
      await reloadProducts()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo actualizar el producto.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDeleteProduct() {
    if (!editingProduct || !vendedor) return
    if (deletingProduct) return

    const confirmed = window.confirm('Estas seguro de eliminar este producto? Esta accion no se puede deshacer.')
    if (!confirmed) return

    setDeletingProduct(true)
    setEditError('')

    try {
      const imageRows = await getProductImages(supabase, editingProduct.id)
      const pathsToDelete = imageRows
        .map((image) => getStoragePathFromPublicUrl(image.url))
        .filter((value): value is string => Boolean(value))

      await supabase.from('fotos_producto').delete().eq('producto_id', editingProduct.id)
      await supabase.from('compatibilidades').delete().eq('producto_id', editingProduct.id)

      const { error: deleteError } = await supabase
        .from('productos')
        .delete()
        .eq('id', editingProduct.id)
        .eq('vendedor_id', vendedor.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      await deleteProductImages(supabase, pathsToDelete)
      await reloadProducts()
      closeEditor()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo eliminar el producto.')
    } finally {
      setDeletingProduct(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div style={{ color: 'var(--gray2)' }}>Cargando tus productos...</div>
      </main>
    )
  }

  if (!vendedor) {
    return (
      <main className="min-h-screen px-4 py-10" style={{ background: 'var(--dark)' }}>
        <div className="max-w-3xl mx-auto rounded-xl border p-6" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
          <h1 className="font-condensed font-black italic uppercase mb-3" style={{ fontSize: '2rem', color: 'var(--yellow)' }}>
            Tus productos
          </h1>
          <p style={{ color: '#fecaca' }}>{error || 'No se pudo validar tu cuenta de vendedor.'}</p>
          <p className="mt-3 text-sm" style={{ color: 'var(--gray)' }}>Usuario: {userEmail || 'sin email'}</p>
          <button
            type="button"
            onClick={() => router.push('/panel')}
            className="mt-5 rounded-md px-4 py-2 font-condensed font-bold uppercase"
            style={{ background: 'var(--slate)', color: 'var(--white)' }}
          >
            Volver al panel
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'var(--dark)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="font-condensed font-black italic uppercase" style={{ fontSize: '2.2rem', color: 'var(--yellow)' }}>
              Tus productos
            </h1>
            <p style={{ color: 'var(--gray2)' }}>
              Lista completa para revisar y editar rapido.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/panel')}
              className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
              style={{ background: 'var(--slate)', color: 'var(--white)' }}
            >
              Volver al panel
            </button>
            <button
              type="button"
              onClick={() => router.push('/panel/vender')}
              className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
              style={{ background: 'var(--yellow)', color: 'var(--text-dark)' }}
            >
              Cargar nuevo
            </button>
          </div>
        </div>

        {error && (
          <div
            className="rounded-md px-4 py-3 mb-5"
            style={{ background: 'rgba(220,38,38,0.18)', color: '#fecaca' }}
          >
            {error}
          </div>
        )}

        <section className="rounded-xl border p-4 md:p-5" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
          <div className="mb-4 font-condensed font-bold uppercase" style={{ color: 'var(--yellow)' }}>
            {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </div>

          {productos.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>Todavia no cargaste productos.</p>
          ) : (
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
              <div className="flex flex-col gap-3">
                {productos.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border p-3 md:p-4"
                    style={{ background: 'var(--dark3)', borderColor: 'var(--dark4)' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-condensed font-extrabold uppercase" style={{ color: 'var(--white)', fontSize: '1.1rem' }}>
                          {item.nombre}
                        </div>
                        <div className="text-sm mt-1" style={{ color: 'var(--gray2)' }}>
                          {(item.marca_pieza || 'Sin marca')} · SKU: {item.sku}
                        </div>
                        <div className="text-sm mt-2" style={{ color: 'var(--gray)' }}>
                          Stock: {item.stock ?? 0} · Estado: {item.activo === false ? 'Pausado' : 'Activo'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:justify-end">
                        <div className="font-condensed font-black" style={{ color: 'var(--yellow)', fontSize: '1.35rem', minWidth: 95, textAlign: 'right' }}>
                          ${Number(item.precio ?? 0).toLocaleString('es-AR')}
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditor(item.id)}
                          className="rounded-md px-3 py-2 font-condensed font-bold uppercase"
                          style={{ background: 'var(--slate)', color: 'var(--white)' }}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {editLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="rounded-xl border px-6 py-5" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)', color: 'var(--gray2)' }}>
            Cargando editor...
          </div>
        </div>
      )}

      {editingProduct && !editLoading && (
        <div
          className="fixed inset-0 z-40 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={closeEditor}
        >
          <div className="min-h-screen flex items-start justify-center px-4 py-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-2xl rounded-xl border" style={{ background: 'var(--dark2)', borderColor: 'var(--dark4)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--dark4)' }}>
                <div>
                  <h2 className="font-condensed font-black uppercase" style={{ color: 'var(--yellow)', fontSize: '1.45rem' }}>
                    Editar producto
                  </h2>
                  <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>SKU: {editingProduct.sku}</p>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-md px-3 py-2 font-condensed font-bold uppercase"
                  style={{ background: 'var(--slate)', color: 'var(--white)' }}
                >
                  Cerrar
                </button>
              </div>

              <div className="p-5">
                {editError && (
                  <div className="rounded-md px-4 py-3 mb-4" style={{ background: 'rgba(220,38,38,0.18)', color: '#fecaca' }}>
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="rounded-md px-4 py-3 mb-4" style={{ background: 'rgba(34,197,94,0.16)', color: '#bbf7d0' }}>
                    {editSuccess}
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block mb-1" style={{ color: 'var(--gray2)', fontWeight: 600 }}>Nombre</label>
                    <input
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full rounded-md px-3 py-2"
                      style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: 'var(--gray2)', fontWeight: 600 }}>Marca</label>
                    <input
                      value={editMarca}
                      onChange={(e) => setEditMarca(e.target.value)}
                      className="w-full rounded-md px-3 py-2"
                      style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: 'var(--gray2)', fontWeight: 600 }}>OEM</label>
                    <input
                      value={editNumeroParte}
                      onChange={(e) => setEditNumeroParte(e.target.value)}
                      className="w-full rounded-md px-3 py-2"
                      style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: 'var(--gray2)', fontWeight: 600 }}>Precio</label>
                    <input
                      type="number"
                      min={0}
                      value={editPrecio}
                      onChange={(e) => setEditPrecio(e.target.value ? Number(e.target.value) : '')}
                      className="w-full rounded-md px-3 py-2"
                      style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: 'var(--gray2)', fontWeight: 600 }}>Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value ? Number(e.target.value) : '')}
                      className="w-full rounded-md px-3 py-2"
                      style={{ background: '#fff', color: '#111827', border: '1px solid #d1d5db' }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2" style={{ color: 'var(--gray2)' }}>
                    <input type="checkbox" checked={editActivo} onChange={(e) => setEditActivo(e.target.checked)} />
                    Activo
                  </label>
                  <label className="flex items-center gap-2" style={{ color: 'var(--gray2)' }}>
                    <input type="checkbox" checked={editLiquidacion} onChange={(e) => setEditLiquidacion(e.target.checked)} />
                    En liquidacion
                  </label>
                </div>

                <div className="mt-5">
                  <div className="mb-2" style={{ color: 'var(--gray2)', fontWeight: 700 }}>Fotos del producto (hasta 3)</div>
                  <div className="flex gap-3">
                    {imageSlots.map((slot, index) => (
                      <div key={index} style={{ flex: 1, position: 'relative' }}>
                        <label
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1',
                            border: slot.preview ? '2px solid #2563eb' : '2px dashed #bbb',
                            borderRadius: 10,
                            background: slot.preview ? 'transparent' : '#f8fafc',
                            cursor: 'pointer',
                            overflow: 'hidden',
                          }}
                        >
                          {slot.preview ? (
                            <img src={slot.preview} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ textAlign: 'center', color: '#bbb', userSelect: 'none' }}>
                              <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 4 }}>+</div>
                              <div style={{ fontSize: 12 }}>Foto {index + 1}</div>
                            </div>
                          )}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onEditImageChange(e, index)} />
                        </label>
                        {slot.preview && (
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            style={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              border: 'none',
                              fontSize: 16,
                              lineHeight: 1,
                              cursor: 'pointer',
                            }}
                            title="Quitar foto"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    disabled={deletingProduct || savingEdit}
                    className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
                    style={{
                      background: 'rgba(220,38,38,0.18)',
                      color: '#fecaca',
                      border: '1px solid rgba(220,38,38,0.35)',
                      cursor: deletingProduct || savingEdit ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deletingProduct ? 'Eliminando...' : 'Eliminar'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
                      style={{ background: 'var(--slate)', color: 'var(--white)' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={savingEdit || deletingProduct}
                      className="rounded-md px-4 py-2 font-condensed font-bold uppercase"
                      style={{
                        background: 'var(--yellow)',
                        color: 'var(--text-dark)',
                        cursor: savingEdit || deletingProduct ? 'not-allowed' : 'pointer',
                        opacity: savingEdit || deletingProduct ? 0.7 : 1,
                      }}
                    >
                      {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
