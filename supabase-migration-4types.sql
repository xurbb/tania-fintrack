-- ============================================================
--  MIGRASI: 4 tipe transaksi (income/expense/saving/investment)
--  + kolom "goal_id" (tautan saving -> goal Planner)
--
--  Jalankan ini kalau database-mu SUDAH dibuat sebelumnya.
--
--  Cara pakai: Supabase -> SQL Editor -> New query ->
--  paste file ini -> RUN.
--
--  Aman dijalankan berulang kali (idempotent).
--  Data lama TIDAK diubah: aplikasi memetakan kategori lama
--  secara otomatis saat dibaca.
-- ============================================================

-- 1. Longgarkan check tipe agar saving & investment bisa disimpan
do $$
begin
  alter table public.transactions drop constraint if exists transactions_type_check;
  alter table public.transactions
    add constraint transactions_type_check
    check (type in ('income', 'expense', 'saving', 'investment'));
exception when others then
  -- constraint mungkin bernama lain di project lama; abaikan
  null;
end $$;

-- 2. Kolom tautan ke goal (boleh kosong)
alter table public.transactions
  add column if not exists goal_id uuid references public.goals (id) on delete set null;

-- Tidak perlu ubah policy: RLS sudah berlaku untuk seluruh kolom.

-- Cek hasilnya:
--   select column_name, data_type
--   from information_schema.columns
--   where table_name = 'transactions'
--   order by ordinal_position;
