-- ============================================================
-- The Racer's Edge · Performance Products — Migración Supabase
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Columna "familia" en productos
--    Identifica a qué familia pertenece cada producto.
--    Valor para TRE: 'tre_performance'
-- ─────────────────────────────────────────────────────────────
alter table public.productos
  add column if not exists familia text default null;

comment on column public.productos.familia is
  'Familia de producto: NULL = catálogo general, ''tre_performance'' = The Racer''s Edge Performance';

create index if not exists idx_productos_familia
  on public.productos(familia)
  where familia is not null;


-- 2. Vista del catálogo TRE
--    Filtra solo productos familia = 'tre_performance' y activos.
--    Compatible con el mismo esquema que vista_catalogo.
-- ─────────────────────────────────────────────────────────────
create or replace view public.vista_tre_catalogo as
select
  p.id      as product_id,
  ma.id     as marca_id,
  ma.nombre as marca,
  mo.id     as modelo_id,
  mo.nombre as modelo,
  ve.anio,
  ve.version,
  ve.motor_codigo,
  coalesce(gr.nombre, 'Otros')   as grupo,
  coalesce(sg.nombre, 'General') as subgrupo,
  p.tipo_pieza,
  p.sku,
  p.producto,
  p.descripcion_corta,
  p.descripcion_larga,
  p.marca_pieza,
  p.numero_parte_oem,
  p.precio,
  p.precio_oferta,
  p.stock,
  p.liquidacion,
  p.activo,
  p.material,
  p.garantia_meses,
  p.peso_kg,
  p.alto_cm,
  p.ancho_cm,
  p.largo_cm,
  p.especificaciones,
  p.vendedor,
  p.imagen_url,
  p.familia
from public.compatibilidades c
join public.productos   p  on p.id  = c.producto_id
join public.versiones   ve on ve.id = c.version_id
join public.modelos     mo on mo.id = ve.modelo_id
join public.marcas      ma on ma.id = mo.marca_id
left join public.grupos    gr on gr.id = p.grupo_id
left join public.subgrupos sg on sg.id = p.subgrupo_id
where p.familia = 'tre_performance'
  and p.activo  = true;


-- 3. Vista de MARCAS con productos TRE
--    Solo marcas que realmente tienen al menos un producto TRE activo.
-- ─────────────────────────────────────────────────────────────
create or replace view public.vista_tre_marcas as
select distinct
  ma.id,
  ma.nombre
from public.compatibilidades c
join public.productos p  on p.id  = c.producto_id
join public.versiones ve on ve.id = c.version_id
join public.modelos   mo on mo.id = ve.modelo_id
join public.marcas    ma on ma.id = mo.marca_id
where p.familia = 'tre_performance'
  and p.activo  = true
order by ma.nombre;


-- 4. Vista de MODELOS con productos TRE
--    Solo modelos que realmente tienen al menos un producto TRE activo.
-- ─────────────────────────────────────────────────────────────
create or replace view public.vista_tre_modelos as
select distinct
  mo.id,
  mo.nombre,
  ma.id     as marca_id,
  ma.nombre as marca
from public.compatibilidades c
join public.productos p  on p.id  = c.producto_id
join public.versiones ve on ve.id = c.version_id
join public.modelos   mo on mo.id = ve.modelo_id
join public.marcas    ma on ma.id = mo.marca_id
where p.familia = 'tre_performance'
  and p.activo  = true
order by ma.nombre, mo.nombre;


-- ─────────────────────────────────────────────────────────────
-- EJEMPLO: marcar productos existentes como TRE Performance
--
-- UPDATE public.productos
-- SET familia = 'tre_performance'
-- WHERE tipo_pieza IN ('Pastillas de freno', 'Amortiguador', 'Kit de embrague')
--   AND activo = true;
--
-- O al cargar un producto nuevo desde el panel de vendedores,
-- simplemente insertar con familia = 'tre_performance'.
-- ─────────────────────────────────────────────────────────────
