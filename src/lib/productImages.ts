import type { SupabaseClient } from '@supabase/supabase-js';

export type UploadProductImageParams = {
  supabase: SupabaseClient;
  file: File;
  productoId: number;
  vendedorId: number;
  orden: number;
};

export type ProductImageRecord = {
  id: number;
  producto_id: number;
  url: string;
  orden: number;
};

/**
 * Uploads a product image to Supabase Storage and records it in fotos_producto.
 * Returns the storage path (for rollback) and the public URL.
 */
export async function uploadProductImage({
  supabase,
  file,
  productoId,
  vendedorId,
  orden,
}: UploadProductImageParams): Promise<{ path: string; publicUrl: string }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const path = `vendedores/${vendedorId}/productos/${productoId}/${orden}/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(path);

  const { error: dbError } = await supabase
    .from('fotos_producto')
    .insert({ producto_id: productoId, url: publicUrl, orden });

  if (dbError) throw dbError;

  return { path, publicUrl };
}

/**
 * Removes storage objects for the given paths.
 * Used for rollback on failed product upload.
 */
export async function deleteProductImages(
  supabase: SupabaseClient,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  await supabase.storage.from('product-images').remove(paths);
}

/**
 * Fetches all images for a given product, ordered by orden.
 */
export async function getProductImages(
  supabase: SupabaseClient,
  productoId: number
): Promise<ProductImageRecord[]> {
  const { data, error } = await supabase
    .from('fotos_producto')
    .select('*')
    .eq('producto_id', productoId)
    .order('orden');

  if (error) throw error;
  return (data as ProductImageRecord[]) || [];
}
