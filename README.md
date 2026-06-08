# Arlogic Service Web App

Proyek ini adalah scaffold Next.js + Supabase untuk dashboard layanan order, QC, dan antrian.

## Fitur

- Next.js 14 + TypeScript
- Tailwind CSS
- Struktur multi halaman dengan App Router
- Halaman login, dashboard, orders, QC, users, reports, dan publik antrian
- Supabase client siap pakai

## Menjalankan proyek

1. `cd arlogic`
2. `npm install`
3. Salin `.env.example` ke `.env`
4. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. `npm run dev`

## Struktur folder

- `app/` — halaman Next.js
- `components/` — komponen UI
- `lib/` — utilitas Supabase
- `supabase/migrations/` — schema dasar tabel
