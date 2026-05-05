# Integración Supabase - ClavelParts

## Estado actual

El front ya consulta Supabase desde:

- `src/lib/supabase.ts`
- `src/lib/supabaseVehicles.ts`
- `src/lib/supabaseCatalog.ts`

La versión actual **ya no usa una sola tabla `vehicles`**. Ahora espera un catálogo normalizado de marcas, modelos, versiones y repuestos compatibles.

---

## Paso 1: Variables de entorno

En `.env.local` necesitás:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ozagyujaueckamivaycr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
```

Las conseguís en **Supabase → Settings → API**.

> No subas `.env.local` a GitHub.

---

## Paso 2: Crear el esquema real del catálogo

En el SQL Editor de Supabase ejecutá:

1. `supabase/migrations/schema.sql`
2. `supabase/seed_demo.sql`

Eso te crea estas entidades:

- `marcas`
- `modelos`
- `versiones`
- `grupos`
- `subgrupos`
- `productos`
- `compatibilidades`
- `vista_catalogo`

---

## Paso 3: Qué resuelve cada tabla

| Tabla / vista | Uso |
|---|---|
| `marcas` | marcas de autos |
| `modelos` | modelos por marca |
| `versiones` | año, versión y motor |
| `grupos` | categorías principales |
| `subgrupos` | subcategorías |
| `productos` | repuestos publicados |
| `compatibilidades` | qué repuesto aplica a qué versión |
| `vista_catalogo` | vista lista para consultar desde el front |

---

## Paso 4: Datos demo incluidos

El seed deja cargado un ejemplo funcional para:

- `BMW`
- `SERIE 1`
- `2009`
- `130i M Sport Package 3.0L`

Y repuestos demo como:

- Pastillas de freno delanteras
- Filtro de aceite
- Amortiguador delantero
- Disco de freno delantero
- Filtro de aire
- Kit de embrague completo

---

## Paso 5: Flujo actual del front

### Selector de vehículo
`VehicleSelector`:
1. carga marcas
2. trae modelos por marca
3. trae años por modelo
4. trae versiones por año
5. abre resultados compatibles

### Catálogo de repuestos
`ResultsGrid` consulta `vista_catalogo` filtrando por:

- `marca`
- `modelo`
- `anio`
- `motor_codigo`
- y opcionalmente por nombre/código de repuesto

---

## Troubleshooting

### `Missing Supabase environment variables`
Verificá `.env.local` y reiniciá `npm run dev`.

### `Error fetching brands`
Normalmente significa una de estas dos cosas:
- faltan tablas en Supabase
- la base todavía no tiene datos

### No aparecen repuestos
Ejecutá primero `schema.sql` y después `seed_demo.sql`.

---

## Próximo paso recomendado

El siguiente paso de backend es conectar también:

- `garage_vehicles`
- `garage_entries` / bitácora
- `orders`
- `profiles`

Así dejamos de usar datos demo en el garage y pasamos todo a Supabase.
