-- Supabase schema for Arlogic service app

create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  role text not null default 'pelanggan',
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

create table if not exists app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'teknisi', 'supervisor')),
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

create table if not exists service_orders (
  id text primary key,
  customer_name text not null,
  phone text,
  brand text,
  model text,
  serial text,
  issue text,
  status text not null default 'Dalam Antrian',
  description text,
  notes text,
  technician_id text,
  work_start_at timestamp with time zone,
  work_end_at timestamp with time zone,
  photos jsonb not null default '[]'::jsonb,
  doc_photos jsonb not null default '[]'::jsonb,
  notes_tech text,
  services jsonb not null default '[]'::jsonb,
  parts jsonb not null default '[]'::jsonb,
  qc_approved boolean not null default false,
  qc_note text,
  discount numeric not null default 0,
  extra_cost numeric not null default 0,
  qc_by text,
  qc_at timestamp with time zone,
  pickup_at timestamp with time zone,
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

create table if not exists order_photos (
  id uuid primary key default uuid_generate_v4(),
  order_id text references service_orders(id),
  url text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  order_id text references service_orders(id),
  action text not null,
  actor_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc', now())
);
