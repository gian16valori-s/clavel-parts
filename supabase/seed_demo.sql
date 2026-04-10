-- ClavelParts · datos demo mínimos para probar el catálogo de repuestos
-- Ejecutar después de schema.sql

insert into public.marcas (nombre)
values ('BMW'), ('ALFA ROMEO')
on conflict (nombre) do nothing;

insert into public.modelos (marca_id, nombre)
select m.id, x.nombre
from public.marcas m
join (values
  ('BMW', 'SERIE 1'),
  ('ALFA ROMEO', 'GIULIA')
) as x(marca_nombre, nombre)
  on x.marca_nombre = m.nombre
on conflict (marca_id, nombre) do nothing;

insert into public.versiones (modelo_id, anio, version, motor_codigo)
select mo.id, x.anio, x.version, x.motor_codigo
from public.modelos mo
join public.marcas ma on ma.id = mo.marca_id
join (values
  ('BMW', 'SERIE 1', 2009, '130i M Sport Package 3.0L', 'N52B30'),
  ('BMW', 'SERIE 1', 2010, '130i M Sport Package 3.0L', 'N52B30'),
  ('ALFA ROMEO', 'GIULIA', 2024, '2.0 TB 200 CV', 'AR2.0TB')
) as x(marca_nombre, modelo_nombre, anio, version, motor_codigo)
  on x.marca_nombre = ma.nombre and x.modelo_nombre = mo.nombre
on conflict (modelo_id, anio, version, motor_codigo) do nothing;

insert into public.grupos (nombre, orden)
values
  ('Motor', 5),
  ('Frenos', 10),
  ('Lubricación', 20),
  ('Suspensión', 30),
  ('Transmisión', 35),
  ('Embrague', 40),
  ('Interior', 50)
on conflict (nombre) do nothing;

insert into public.subgrupos (grupo_id, nombre, orden)
select g.id, x.nombre, x.orden
from public.grupos g
join (values
  ('Motor', 'Sensores', 10),
  ('Motor', 'Juntas', 20),
  ('Motor', 'Bombas', 30),
  ('Motor', 'Accesorios', 40),
  ('Frenos', 'Pastillas', 10),
  ('Frenos', 'Discos', 20),
  ('Lubricación', 'Filtros', 10),
  ('Suspensión', 'Amortiguadores', 10),
  ('Transmisión', 'Homocinéticas', 10),
  ('Transmisión', 'Retenes', 20),
  ('Transmisión', 'Soportes', 30),
  ('Transmisión', 'Mandos', 40),
  ('Embrague', 'Kits', 10),
  ('Interior', 'Paneles', 10),
  ('Interior', 'Tapizados', 20),
  ('Interior', 'Comandos', 30),
  ('Interior', 'Accesorios interiores', 40)
) as x(grupo_nombre, nombre, orden)
  on x.grupo_nombre = g.nombre
on conflict (grupo_id, nombre) do nothing;

insert into public.productos (
  grupo_id,
  subgrupo_id,
  tipo_pieza,
  sku,
  producto,
  marca_pieza,
  numero_parte_oem,
  precio,
  precio_oferta,
  stock,
  liquidacion,
  activo,
  especificaciones,
  vendedor,
  imagen_url
)
select
  g.id,
  sg.id,
  x.tipo_pieza,
  x.sku,
  x.producto,
  x.marca_pieza,
  x.numero_parte_oem,
  x.precio,
  x.precio_oferta,
  x.stock,
  x.liquidacion,
  true,
  x.especificaciones::jsonb,
  x.vendedor,
  null
from (
  values
    ('Motor', 'Sensores', 'Sensor motor', 'BM-MOT-0261', 'Sensor de temperatura de motor', 'Bosch', '0261230456', 28900, null, 6, false, '{"medicion":"temperatura"}', 'Performance Bavara'),
    ('Motor', 'Juntas', 'Junta motor', 'BM-MOT-4762', 'Juego de junta tapa de válvulas', 'Elring', '476.221', 41900, null, 5, false, '{"material":"elastómero"}', 'Performance Bavara'),
    ('Motor', 'Bombas', 'Bomba de aceite', 'BM-MOT-7079', 'Bomba de aceite alta presión', 'Pierburg', '7.07919.02', 118900, 109900, 2, false, '{"caudal":"alta presión"}', 'Performance Bavara'),
    ('Motor', 'Accesorios', 'Soporte motor', 'BM-MOT-3475', 'Soporte lateral de motor reforzado', 'Lemförder', '34756', 38400, null, 8, false, '{"lado":"derecho"}', 'Performance Bavara'),
    ('Frenos', 'Pastillas', 'Pastillas de freno', 'P06098', 'Pastillas de freno delanteras', 'Brembo', 'P06098', 28500, 25900, 12, false, '{"eje":"delantero"}', 'Frenos del Sur'),
    ('Frenos', 'Pastillas', 'Pastillas de freno', 'P06099N', 'Pastillas de freno cerámicas traseras', 'Brembo', 'P06099N', 33800, null, 9, false, '{"eje":"trasero"}', 'Frenos del Sur'),
    ('Frenos', 'Líquido', 'Líquido de frenos', 'ATE-706202', 'Líquido de frenos DOT 4 LV', 'ATE', '706202', 12900, 10900, 20, true, '{"norma":"DOT4 LV"}', 'Frenos del Sur'),
    ('Frenos', 'Sensores', 'Sensor desgaste', 'TXT-980443', 'Sensor de desgaste de pastillas', 'Textar', '98044300', 8900, null, 14, false, '{"eje":"delantero"}', 'Frenos del Sur'),
    ('Lubricación', 'Filtros', 'Filtro de aceite', 'F026407006', 'Filtro de aceite', 'Bosch', 'F026407006', 8200, null, 18, false, '{"tipo":"aceite"}', 'Auto Repuestos GBA'),
    ('Suspensión', 'Amortiguadores', 'Amortiguador', '312-584', 'Amortiguador delantero (x1)', 'Sachs', '312 584', 54000, null, 6, false, '{"lado":"delantero"}', 'Suspensiones Cañon'),
    ('Suspensión', 'Bujes', 'Buje de parrilla', 'LMF-35394', 'Buje de parrilla delantero', 'Lemförder', '35394', 19200, null, 10, false, '{"ubicacion":"delantero"}', 'Suspensiones Cañon'),
    ('Suspensión', 'Cazoletas', 'Cazoleta amortiguador', 'SKF-35623', 'Cazoleta superior de amortiguador', 'SKF', 'VKDA 35623', 27400, null, 7, false, '{"eje":"delantero"}', 'Suspensiones Cañon'),
    ('Suspensión', 'Resortes', 'Resorte delantero', 'LSJ-4095031', 'Resorte delantero progresivo', 'Lesjöfors', '4095031', 48700, null, 5, false, '{"tipo":"progresivo"}', 'Suspensiones Cañon'),
    ('Transmisión', 'Homocinéticas', 'Homocinética', 'BM-TRA-3054', 'Homocinética rueda delantera', 'GKN', '305481', 73100, null, 4, false, '{"lado":"delantero"}', 'DriveLine Garage'),
    ('Transmisión', 'Retenes', 'Retén semieje', 'BM-TRA-1201', 'Retén semieje caja', 'Corteco', '12015264', 13800, null, 10, false, '{"ubicacion":"salida caja"}', 'DriveLine Garage'),
    ('Transmisión', 'Soportes', 'Soporte caja', 'BM-TRA-3224', 'Soporte de caja de cambios hidráulico', 'Febi', '32240', 51900, null, 3, false, '{"tipo":"hidráulico"}', 'DriveLine Garage'),
    ('Transmisión', 'Mandos', 'Cable selector', 'BM-TRA-CMB1', 'Cable selector de cambios', 'ATEC', 'CMB-130I', 44700, null, 6, false, '{"comando":"selector"}', 'DriveLine Garage'),
    ('Frenos', 'Discos', 'Disco de freno', '09.C328.11', 'Disco de freno delantero', 'Brembo', '09.C328.11', 42800, null, 10, false, '{"diametro_mm":330}', 'Frenos del Sur'),
    ('Lubricación', 'Filtros', 'Filtro de aire', 'LX-1804', 'Filtro de aire', 'Mahle', 'LX 1804', 11400, 9900, 15, false, '{"tipo":"aire"}', 'Auto Repuestos GBA'),
    ('Embrague', 'Kits', 'Kit de embrague', '835067', 'Kit de embrague completo', 'Valeo', '835067', 118000, 109000, 4, true, '{"incluye":"disco+placa+ruleman"}', 'Importadora BSport'),
    ('Electricidad', 'Alternador', 'Alternador', 'BM-ELE-0121', 'Alternador 120A remanufacturado', 'Bosch', '0121715001', 149000, null, 3, false, '{"amperaje":"120A"}', 'Volt Garage'),
    ('Electricidad', 'Arranque', 'Motor de arranque', 'BM-ELE-4383', 'Motor de arranque 1.4kW', 'Valeo', '438329', 127000, null, 2, false, '{"potencia":"1.4kW"}', 'Volt Garage'),
    ('Electricidad', 'Sensores', 'Sensor ABS', 'ATE-240711', 'Sensor ABS delantero', 'ATE', '24.0711', 33800, null, 6, false, '{"eje":"delantero"}', 'Volt Garage'),
    ('Electricidad', 'Módulos', 'Módulo confort', 'HLA-5DK8214', 'Módulo confort levantavidrios', 'Hella', '5DK 008 214-00', 69200, null, 4, false, '{"funcion":"levantavidrios"}', 'Volt Garage'),
    ('Carrocería', 'Rejillas', 'Rejilla frontal', 'BM-CAR-5113', 'Rejilla frontal riñón negra', 'BMW', '51137201967', 46800, null, 6, false, '{"acabado":"negro brillo"}', 'BodyParts GBA'),
    ('Carrocería', 'Molduras', 'Tapa espejo', 'TYC-3370123', 'Tapa espejo exterior imprimada', 'TYC', '337-0123', 25900, null, 8, false, '{"lado":"izquierdo"}', 'BodyParts GBA'),
    ('Carrocería', 'Paragolpes', 'Paragolpe delantero', 'TYG-BM130F', 'Paragolpe delantero imprimado', 'Tong Yang', 'TYG-BM-130F', 186000, 172000, 2, false, '{"acabado":"imprimado"}', 'BodyParts GBA'),
    ('Carrocería', 'Tapas', 'Tapa gancho', 'BM-CAR-5111', 'Tapa gancho paragolpe delantera', 'BMW', '51117134090', 14900, null, 12, false, '{"ubicacion":"frontal"}', 'BodyParts GBA'),
    ('Interior', 'Paneles', 'Panel interior', 'BM-INT-5141', 'Panel interior de puerta delantera', 'BMW', '51419123456', 98000, null, 2, false, '{"lado":"delantero","color":"negro"}', 'Cabina Premium'),
    ('Interior', 'Comandos', 'Botonera levantavidrios', 'BM-INT-6131', 'Botonera levantavidrios conductor', 'BMW', '61319217332', 46500, 42900, 5, false, '{"funcion":"4 vidrios"}', 'Cabina Premium'),
    ('Interior', 'Tapizados', 'Fuelle y perilla', 'BM-INT-2511', 'Fuelle y perilla de cambios', 'BMW', '25117527252', 38900, null, 4, false, '{"terminacion":"cuero"}', 'Cabina Premium'),
    ('Interior', 'Accesorios interiores', 'Alfombras', 'BM-INT-8211', 'Juego de alfombras premium habitáculo', '3D Mats', '82112410888', 36200, 32900, 7, false, '{"piezas":4}', 'Cabina Premium')
) as x(grupo_nombre, subgrupo_nombre, tipo_pieza, sku, producto, marca_pieza, numero_parte_oem, precio, precio_oferta, stock, liquidacion, especificaciones, vendedor)
join public.grupos g on g.nombre = x.grupo_nombre
join public.subgrupos sg on sg.grupo_id = g.id and sg.nombre = x.subgrupo_nombre
on conflict (sku) do update set
  precio = excluded.precio,
  precio_oferta = excluded.precio_oferta,
  stock = excluded.stock,
  liquidacion = excluded.liquidacion,
  activo = true;

insert into public.compatibilidades (producto_id, version_id)
select p.id, v.id
from public.productos p
cross join public.versiones v
join public.modelos mo on mo.id = v.modelo_id
join public.marcas ma on ma.id = mo.marca_id
where ma.nombre = 'BMW'
  and mo.nombre = 'SERIE 1'
  and v.anio = 2009
  and v.version = '130i M Sport Package 3.0L'
on conflict (producto_id, version_id) do nothing;
