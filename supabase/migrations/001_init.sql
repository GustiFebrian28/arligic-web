-- Supabase migration skeleton for Arlogic service app

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  role text not null default 'pelanggan',
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

create table if not exists service_orders (
  id text primary key,
  customer_name text not null,
  status text not null default 'Dalam Antrian',
  description text,
  technician_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

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
