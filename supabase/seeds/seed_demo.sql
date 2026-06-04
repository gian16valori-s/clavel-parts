-- ClavelParts · seed de datos demo
-- Ejecutar en Supabase SQL Editor para poblar la base con datos de ejemplo.

insert into public.productos (producto, sku, tipo_pieza, precio, stock, activo)
values
  ('Filtro de aire', 'FA-123', 'filtro', 1500, 10, true),
  ('Pastilla de freno', 'PF-456', 'freno', 2500, 20, true),
  ('Amortiguador', 'AM-789', 'suspension', 5000, 5, true);

insert into public.marcas (nombre) values ('Toyota'), ('Ford'), ('Chevrolet');

insert into public.modelos (nombre, marca_id) values ('Corolla', 1), ('Focus', 2), ('Onix', 3);

insert into public.versiones (modelo_id, anio, version, motor_codigo) values
  (1, 2020, 'XEI', '2ZR-FE'),
  (2, 2019, 'Titanium', 'PNDA'),
  (3, 2021, 'LT', 'L8B');