-- ClavelParts · seed para tipos de pieza
-- Ejecutar en Supabase SQL Editor para poblar la tabla tipos_pieza

insert into public.tipos_pieza (nombre) values
  ('filtro'),
  ('freno'),
  ('suspension'),
  ('motor'),
  ('transmision'),
  ('carroceria');