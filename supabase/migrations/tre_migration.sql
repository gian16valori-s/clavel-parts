-- ClavelParts · migración específica para TRE
-- Ejecutar en Supabase SQL Editor sobre una base ya existente.

alter table public.productos
  add column if not exists familia text default null;

-- Indices y vistas para TRE
create index if not exists idx_productos_familia on public.productos(familia) where familia is not null;

create or replace view public.vista_tre_catalogo as
select
  p.id     as product_id,
  ma.id    as marca_id,
  ma.nombre as marca,
  mo.id    as modelo_id,
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
join public.productos p on p.id = c.producto_id
join public.versiones ve on ve.id = c.version_id
join public.modelos mo on mo.id = ve.modelo_id
join public.marcas ma on ma.id = mo.marca_id
left join public.grupos gr on gr.id = p.grupo_id
left join public.subgrupos sg on sg.id = p.subgrupo_id
where p.familia = 'tre_performance'
  and p.activo = true;