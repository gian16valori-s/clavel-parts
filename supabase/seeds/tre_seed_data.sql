-- ClavelParts · seed de datos para TRE
-- Ejecutar en Supabase SQL Editor para poblar la base con datos de ejemplo TRE

insert into public.productos (producto, sku, tipo_pieza, precio, stock, activo, familia)
values
  ('Filtro TRE', 'TRE-001', 'filtro', 2000, 15, true, 'tre_performance'),
  ('Pastilla TRE', 'TRE-002', 'freno', 3000, 25, true, 'tre_performance');

insert into public.marcas (nombre) values ('TRE');

insert into public.modelos (nombre, marca_id) values ('TRE Model', 4);

insert into public.versiones (modelo_id, anio, version, motor_codigo) values
  (4, 2022, 'TRE Spec', 'TRE-ENG');