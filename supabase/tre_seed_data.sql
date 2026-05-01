-- ============================================================
-- The Racer's Edge · Performance Products — SEED DATA
-- Ejecutar después de tre_migration.sql
-- ============================================================

-- Este script inserta datos de prueba para TRE Performance
-- Requiere que ya existan marcas, modelos, versiones, grupos, subgrupos

-- ─────────────────────────────────────────────────────────────
-- 1. Asegurarse que existan los GRUPOS para TRE
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.grupos (nombre, descripcion) VALUES
  ('Motor', 'Componentes del motor'),
  ('Turbo', 'Sistemas de turboalimentación'),
  ('Frenos', 'Sistemas de frenado'),
  ('Suspensión', 'Suspensión y amortiguación'),
  ('Escape', 'Sistemas de escape'),
  ('Llantas', 'Ruedas y llantas'),
  ('Body', 'Aerodinámica y carrocería'),
  ('Interior', 'Interiores y componentes'),
  ('Electrónica', 'Sistemas electrónicos')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. Insertar SUBGRUPOS (ejemplos representativos)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.subgrupos (grupo_id, nombre, descripcion) VALUES
  ((SELECT id FROM public.grupos WHERE nombre = 'Motor'), 'Cabezas de cilindro', 'Cabezas y componentes'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Motor'), 'Pistones y bielas', 'Pistones de performance'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Turbo'), 'Turbos', 'Unidades de turbo'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Turbo'), 'Intercoolers', 'Intercoolers de aire'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Turbo'), 'Tuberías', 'Tuberías turbo'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Frenos'), 'Pastillas', 'Pastillas de freno'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Frenos'), 'Discos', 'Discos de freno'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Frenos'), 'Cilindros', 'Cilindros maestros'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Suspensión'), 'Amortiguadores', 'Kits coilover'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Suspensión'), 'Muelles', 'Muelles de suspensión'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Suspension'), 'Barras', 'Barras estabilizadoras'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Escape'), 'Catalizadores', 'Catalizadores deportivos'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Escape'), 'Silenciadores', 'Tubos de escape'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Llantas'), 'Ruedas forjadas', 'Llantas de aleación'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Llantas'), 'Neumáticos', 'Neumáticos deportivos'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Body'), 'Spoilers', 'Aerodinámicos'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Body'), 'Difusores', 'Difusores traseros'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Interior'), 'Asientos', 'Asientos deportivos'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Interior'), 'Volantes', 'Volantes de performance'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Electrónica'), 'ECUs', 'Chips de potencia'),
  ((SELECT id FROM public.grupos WHERE nombre = 'Electrónica'), 'Sensores', 'Sensores avanzados')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. Insertar PRODUCTOS TRE Performance
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.productos (
  tipo_pieza, sku, producto, marca_pieza, numero_parte_oem,
  precio, precio_oferta, stock, liquidacion, activo,
  especificaciones, vendedor, imagen_url, grupo_id, subgrupo_id, familia
) VALUES
  -- TURBO PRODUCTS
  ('Turbo Compresor', 'TRE-TURBO-001', 'IHI VF52 Turbocharger', 'IHI', 'VF52',
   2500.00, 2200.00, 8, false, true,
   'Compatible con motores EJ20/EJ25. Incremento de 0.8-1.0 bar',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Turbo'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Turbos' LIMIT 1),
   'tre_performance'),

  ('Turbo Compresor', 'TRE-TURBO-002', 'Garrett GTX3076R Turbo', 'Garrett', 'GTX3076R',
   3800.00, 3500.00, 5, false, true,
   'Incremento máximo 1.2 bar. Rápida respuesta, spool rápido',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Turbo'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Turbos' LIMIT 1),
   'tre_performance'),

  ('Intercooler', 'TRE-INTERCOOLER-001', 'Treadstone Intercooler Pro', 'Treadstone', 'TSP-IC-001',
   1800.00, 1650.00, 12, false, true,
   'Intercooler frontal aluminio. Caudal optimizado',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Turbo'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Intercoolers' LIMIT 1),
   'tre_performance'),

  -- FRENOS
  ('Pastilla de Freno', 'TRE-FRENO-001', 'Brembo Racing Pad Set', 'Brembo', 'P06051',
   450.00, 400.00, 20, false, true,
   'Juego de pastillas traseras/delanteras. Máximo agarre',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Frenos'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Pastillas' LIMIT 1),
   'tre_performance'),

  ('Disco de Freno', 'TRE-FRENO-002', 'Brembo Disc Rotor 320mm', 'Brembo', 'BREM-320-SPORT',
   550.00, 480.00, 16, false, true,
   'Disco ventilado de precisión. Resistencia al fade',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Frenos'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Discos' LIMIT 1),
   'tre_performance'),

  -- SUSPENSIÓN
  ('Amortiguador', 'TRE-SUSP-001', 'Bilstein B16 PSS Coilover', 'Bilstein', 'BIL-B16-PSS',
   2200.00, 2000.00, 6, false, true,
   'Kit coilover ajustable. Altura variable y rigidez',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Suspensión'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Amortiguadores' LIMIT 1),
   'tre_performance'),

  ('Muelle de Suspensión', 'TRE-SUSP-002', 'Eibach ProKit Springs', 'Eibach', 'E10-35-014-01-22',
   380.00, 340.00, 10, false, true,
   'Muelles reducción de altura 35mm. Mejor manejo',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Suspensión'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Muelles' LIMIT 1),
   'tre_performance'),

  -- ESCAPE
  ('Catalizador', 'TRE-ESCAPE-001', 'High Flow Catalytic Converter', 'Universal', 'HFC-100',
   650.00, 580.00, 7, false, true,
   'Catalizador de flujo alto. +5-7 HP',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Escape'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Catalizadores' LIMIT 1),
   'tre_performance'),

  ('Tubo de Escape', 'TRE-ESCAPE-002', 'Tomei Expreme Muffler', 'Tomei', 'TOMEI-EXM-002',
   890.00, 800.00, 5, false, true,
   'Silenciador titanio. Sonido deportivo y bajo peso',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Escape'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Silenciadores' LIMIT 1),
   'tre_performance'),

  -- LLANTAS
  ('Rueda Forjada', 'TRE-WHEEL-001', 'Work Emotion CR Kiwami', 'Work', 'WORK-CR-18',
   2800.00, 2500.00, 4, false, true,
   'Juego x4 ruedas 18". Peso ultra ligero, rotación suave',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Llantas'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Ruedas forjadas' LIMIT 1),
   'tre_performance'),

  ('Neumático Deportivo', 'TRE-TIRE-001', 'Bridgestone Potenza RE71R', 'Bridgestone', 'BST-RE71R-205-55-16',
   520.00, 480.00, 12, false, true,
   'Juego x4 neumáticos 205/55R16. Agarre máximo',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Llantas'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Neumáticos' LIMIT 1),
   'tre_performance'),

  -- BODY KIT
  ('Spoiler', 'TRE-BODY-001', 'Carbon Fiber Front Splitter', 'ACS Performance', 'ACSFSP-CF-001',
   1200.00, 1100.00, 3, false, true,
   'Splitter frontal carbono. Downforce +45kg',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Body'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Spoilers' LIMIT 1),
   'tre_performance'),

  ('Difusor', 'TRE-BODY-002', 'Rear Diffuser Carbon Kit', 'TRA Kyoto', 'TKY-DIFF-CF',
   1400.00, 1250.00, 2, false, true,
   'Difusor trasero full carbono. Estabilidad a alta velocidad',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Body'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Difusores' LIMIT 1),
   'tre_performance'),

  -- INTERIOR
  ('Asiento', 'TRE-INT-001', 'Sparco Racing Seat Pro', 'Sparco', 'SPARCO-PRO-7',
   1100.00, 1000.00, 4, false, true,
   'Asiento de carreras, homologación FIA, soporte lateral máximo',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Interior'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Asientos' LIMIT 1),
   'tre_performance'),

  ('Volante', 'TRE-INT-002', 'OMP Corsica 330 Steering Wheel', 'OMP', 'OMP-CORS-330',
   320.00, 290.00, 6, false, true,
   'Volante deportivo, diámetro 330mm, gamuza',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Interior'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Volantes' LIMIT 1),
   'tre_performance'),

  -- ELECTRÓNICA
  ('Chip de Potencia', 'TRE-ECU-001', 'HKS F-Con V Pro ECU', 'HKS', 'HKS-FCON-VPRO',
   1800.00, 1600.00, 5, false, true,
   'Chip de potencia programable. +50-80 HP',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Electrónica'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'ECUs' LIMIT 1),
   'tre_performance'),

  ('Sensor Avanzado', 'TRE-ECU-002', 'AEM Wideband O2 Sensor', 'AEM', 'AEM-WB-O2',
   250.00, 220.00, 10, false, true,
   'Sensor de oxígeno banda ancha. Lectura precisa AFR',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Electrónica'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Sensores' LIMIT 1),
   'tre_performance'),

  -- MOTOR
  ('Pistón de Aluminio', 'TRE-MOTOR-001', 'Cosworth Forged Piston', 'Cosworth', 'COS-PST-EJ20',
   580.00, 520.00, 4, false, true,
   'Pistones forjados, compresión 9.5:1',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Motor'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Pistones y bielas' LIMIT 1),
   'tre_performance'),

  ('Cabeza de Cilindro', 'TRE-MOTOR-002', 'ORC Full Ball Bearing Turbo', 'ORC', 'ORC-BB-TURBO',
   2100.00, 1900.00, 2, false, true,
   'Cabeza con rodamientos de bolas, máxima rpm',
   'TRE Verified', NULL,
   (SELECT id FROM public.grupos WHERE nombre = 'Motor'),
   (SELECT id FROM public.subgrupos WHERE nombre = 'Cabezas de cilindro' LIMIT 1),
   'tre_performance')
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 4. Crear COMPATIBILIDADES con vehículos de prueba
--    (Esto requiere que existan marcas, modelos y versiones)
--    Ejemplo: Subaru, Nissan, Mitsubishi
-- ─────────────────────────────────────────────────────────────

-- SUBARU IMPREZA (Ejemplo)
INSERT INTO public.compatibilidades (producto_id, version_id)
SELECT p.id, v.id
FROM public.productos p
CROSS JOIN public.versiones v
WHERE p.familia = 'tre_performance'
  AND v.modelo_id IN (
    SELECT mo.id FROM public.modelos mo
    JOIN public.marcas ma ON ma.id = mo.marca_id
    WHERE ma.nombre ILIKE '%subaru%' AND mo.nombre ILIKE '%impreza%'
  )
  AND v.anio >= 2010
ON CONFLICT DO NOTHING;

-- NISSAN 350Z (Ejemplo)
INSERT INTO public.compatibilidades (producto_id, version_id)
SELECT p.id, v.id
FROM public.productos p
CROSS JOIN public.versiones v
WHERE p.familia = 'tre_performance'
  AND v.modelo_id IN (
    SELECT mo.id FROM public.modelos mo
    JOIN public.marcas ma ON ma.id = mo.marca_id
    WHERE ma.nombre ILIKE '%nissan%' AND mo.nombre ILIKE '%350z%'
  )
  AND v.anio >= 2003
ON CONFLICT DO NOTHING;

-- MITSUBISHI EVO (Ejemplo)
INSERT INTO public.compatibilidades (producto_id, version_id)
SELECT p.id, v.id
FROM public.productos p
CROSS JOIN public.versiones v
WHERE p.familia = 'tre_performance'
  AND v.modelo_id IN (
    SELECT mo.id FROM public.modelos mo
    JOIN public.marcas ma ON ma.id = mo.marca_id
    WHERE ma.nombre ILIKE '%mitsubishi%' AND (mo.nombre ILIKE '%evo%' OR mo.nombre ILIKE '%evolution%')
  )
  AND v.anio >= 2003
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────

-- Contar productos TRE insertados
SELECT COUNT(*) as "Productos TRE" FROM public.productos WHERE familia = 'tre_performance';

-- Contar compatibilidades creadas
SELECT COUNT(*) as "Compatibilidades TRE" FROM public.compatibilidades c
JOIN public.productos p ON p.id = c.producto_id
WHERE p.familia = 'tre_performance';

-- Ver estructura de marcas/modelos en TRE
SELECT DISTINCT ma.nombre as marca, mo.nombre as modelo, COUNT(DISTINCT v.id) as versiones
FROM public.compatibilidades c
JOIN public.versiones v ON v.id = c.version_id
JOIN public.modelos mo ON mo.id = v.modelo_id
JOIN public.marcas ma ON ma.id = mo.marca_id
JOIN public.productos p ON p.id = c.producto_id
WHERE p.familia = 'tre_performance'
GROUP BY ma.nombre, mo.nombre
ORDER BY ma.nombre, mo.nombre;
