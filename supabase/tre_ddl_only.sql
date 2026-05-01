-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- Solo DDL, no toca datos existentes

-- 1. Agregar columna familia a productos (si no existe)
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS familia text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_productos_familia
  ON public.productos(familia)
  WHERE familia IS NOT NULL;

-- 2. Vista catálogo TRE
CREATE OR REPLACE VIEW public.vista_tre_catalogo AS
SELECT
  ma.id     AS marca_id,
  ma.nombre AS marca,
  mo.id     AS modelo_id,
  mo.nombre AS modelo,
  ve.anio,
  ve.version,
  ve.motor_codigo,
  COALESCE(gr.nombre, 'Otros')   AS grupo,
  COALESCE(sg.nombre, 'General') AS subgrupo,
  p.tipo_pieza, p.sku, p.producto, p.marca_pieza,
  p.numero_parte_oem, p.precio, p.precio_oferta, p.stock,
  p.liquidacion, p.activo, p.especificaciones,
  p.vendedor, p.imagen_url, p.familia
FROM public.compatibilidades c
JOIN public.productos   p  ON p.id  = c.producto_id
JOIN public.versiones   ve ON ve.id = c.version_id
JOIN public.modelos     mo ON mo.id = ve.modelo_id
JOIN public.marcas      ma ON ma.id = mo.marca_id
LEFT JOIN public.grupos    gr ON gr.id = p.grupo_id
LEFT JOIN public.subgrupos sg ON sg.id = p.subgrupo_id
WHERE p.familia = 'tre_performance' AND p.activo = true;

-- 3. Vista marcas TRE
CREATE OR REPLACE VIEW public.vista_tre_marcas AS
SELECT DISTINCT ma.id, ma.nombre
FROM public.compatibilidades c
JOIN public.productos p  ON p.id  = c.producto_id
JOIN public.versiones ve ON ve.id = c.version_id
JOIN public.modelos   mo ON mo.id = ve.modelo_id
JOIN public.marcas    ma ON ma.id = mo.marca_id
WHERE p.familia = 'tre_performance' AND p.activo = true
ORDER BY ma.nombre;

-- 4. Vista modelos TRE
CREATE OR REPLACE VIEW public.vista_tre_modelos AS
SELECT DISTINCT mo.id, mo.nombre, ma.id AS marca_id, ma.nombre AS marca
FROM public.compatibilidades c
JOIN public.productos p  ON p.id  = c.producto_id
JOIN public.versiones ve ON ve.id = c.version_id
JOIN public.modelos   mo ON mo.id = ve.modelo_id
JOIN public.marcas    ma ON ma.id = mo.marca_id
WHERE p.familia = 'tre_performance' AND p.activo = true
ORDER BY ma.nombre, mo.nombre;

-- Verificar
SELECT 'OK: columna familia existe' AS resultado
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'productos'
    AND column_name = 'familia'
);
