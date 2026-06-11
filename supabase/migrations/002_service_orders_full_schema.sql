-- Run this in Supabase SQL Editor if production was created with the older schema.

create table if not exists app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'teknisi', 'supervisor')),
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

alter table service_orders add column if not exists phone text;
alter table service_orders add column if not exists brand text;
alter table service_orders add column if not exists model text;
alter table service_orders add column if not exists serial text;
alter table service_orders add column if not exists issue text;
alter table service_orders add column if not exists notes text;
alter table service_orders add column if not exists technician_id text;
alter table service_orders alter column technician_id type text using technician_id::text;
alter table service_orders add column if not exists work_start_at timestamp with time zone;
alter table service_orders add column if not exists work_end_at timestamp with time zone;
alter table service_orders add column if not exists photos jsonb not null default '[]'::jsonb;
alter table service_orders add column if not exists doc_photos jsonb not null default '[]'::jsonb;
alter table service_orders add column if not exists notes_tech text;
alter table service_orders add column if not exists services jsonb not null default '[]'::jsonb;
alter table service_orders add column if not exists parts jsonb not null default '[]'::jsonb;
alter table service_orders add column if not exists qc_approved boolean not null default false;
alter table service_orders add column if not exists qc_note text;
alter table service_orders add column if not exists discount numeric not null default 0;
alter table service_orders add column if not exists extra_cost numeric not null default 0;
alter table service_orders add column if not exists qc_by text;
alter table service_orders add column if not exists qc_at timestamp with time zone;
alter table service_orders add column if not exists pickup_at timestamp with time zone;

notify pgrst, 'reload schema';
