-- ============================================================
--  MIGRASI: tambah kolom "instrument" (bentuk investasi)
--
--  Jalankan ini kalau database-mu SUDAH dibuat sebelumnya
--  dan ingin fitur "Bentuk Investasi" (Gold, Stock, dst) aktif.
--
--  Cara pakai: Supabase -> SQL Editor -> New query ->
--  paste file ini -> RUN.
--
--  Aman dijalankan berulang kali (idempotent).
-- ============================================================

alter table public.transactions
  add column if not exists instrument text;

-- Tidak perlu ubah policy: RLS sudah berlaku untuk seluruh kolom.

-- Cek hasilnya:
--   select column_name, data_type
--   from information_schema.columns
--   where table_name = 'transactions'
--   order by ordinal_position;
