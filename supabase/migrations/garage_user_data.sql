-- ClavelParts · Datos de garage por usuario
-- Ejecutar en Supabase SQL Editor después de schema.sql

-- ─── garage_vehicles ─────────────────────────────────────────────────────────
-- Autos guardados por usuario
create table if not exists public.garage_vehicles (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  brand       text        not null,
  model       text        not null,
  version     text        not null default '',
  year        text        not null,
  vin         text        not null default '',
  plate       text        not null default '',
  km          integer     not null default 0,
  color       text        not null default '',
  photo       text,
  created_at  timestamptz not null default now()
);

alter table public.garage_vehicles
  add column if not exists vin text not null default '';

create index if not exists idx_garage_vehicles_user on public.garage_vehicles(user_id);

alter table public.garage_vehicles enable row level security;
create policy "Owners can manage their vehicles"
  on public.garage_vehicles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── garage_bitacora ─────────────────────────────────────────────────────────
-- Historial de mantenimiento y compras por auto
create table if not exists public.garage_bitacora (
  id          uuid          primary key default gen_random_uuid(),
  vehicle_id  uuid          not null references public.garage_vehicles(id) on delete cascade,
  user_id     uuid          not null references auth.users(id) on delete cascade,
  date        date          not null,
  type        text          not null check (type in ('compra','service','reparacion','revision')),
  description text          not null,
  parts       text[],
  cost        numeric(12,2) not null default 0,
  km          integer       not null default 0,
  seller      text,
  created_at  timestamptz   not null default now()
);

create index if not exists idx_garage_bitacora_vehicle on public.garage_bitacora(vehicle_id);
create index if not exists idx_garage_bitacora_user    on public.garage_bitacora(user_id);

alter table public.garage_bitacora enable row level security;
create policy "Owners can manage their bitacora"
  on public.garage_bitacora for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── user_favorites ──────────────────────────────────────────────────────────
-- Productos marcados como favoritos por el usuario
create table if not exists public.user_favorites (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    not null references auth.users(id) on delete cascade,
  producto_id bigint  not null references public.productos(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, producto_id)
);

create index if not exists idx_user_favorites_user on public.user_favorites(user_id);

alter table public.user_favorites enable row level security;
create policy "Owners can manage their favorites"
  on public.user_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── user_alerts ─────────────────────────────────────────────────────────────
-- Alertas y notificaciones por usuario
create table if not exists public.user_alerts (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users(id) on delete cascade,
  title      text    not null,
  body       text    not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_alerts_user_unread
  on public.user_alerts(user_id, read) where read = false;

alter table public.user_alerts enable row level security;
create policy "Owners can manage their alerts"
  on public.user_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
