alter table public.garage_vehicles
  alter column vin drop not null;

comment on column public.garage_vehicles.vin is 'VIN opcional por vehículo';