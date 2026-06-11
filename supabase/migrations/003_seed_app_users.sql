-- Run after creating app_users so login can use Supabase instead of data/db.json.

create table if not exists app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'teknisi', 'supervisor')),
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

insert into app_users (id, name, email, password, role)
values
  (
    'user-admin',
    'Budi Santoso',
    'admin@arlogic.test',
    'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'admin'
  ),
  (
    'user-teknisi',
    'Agus Prasetyo',
    'teknisi@arlogic.test',
    'sha256$3ac40463b419a7de590185c7121f0bfbe411d6168699e8014f521b050b1d6653',
    'teknisi'
  ),
  (
    'user-supervisor',
    'Dewi Rahayu',
    'supervisor@arlogic.test',
    'sha256$1c8b3a939e438b44507d10fe725bc34c206a0a9d0189be00e47300b4e8e6d6d9',
    'supervisor'
  ),
  (
    'user-mq0zsr0a',
    'Binta',
    'teknisi2@arlogic.id',
    'sha256$98fe185e96c7040b30fa5b6231906f14e0e5debb1dc44ee9d0b1fae15483f36d',
    'teknisi'
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  password = excluded.password,
  role = excluded.role,
  updated_at = timezone('utc', now());

notify pgrst, 'reload schema';
