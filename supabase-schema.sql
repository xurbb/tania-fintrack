-- ============================================================
--  Tania's FinTrack - Skema Database Supabase
--  Cara pakai: buka Supabase > SQL Editor > New query,
--  paste seluruh isi file ini, lalu klik RUN.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabel TRANSAKSI (income & expense)
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  type           text not null check (type in ('income', 'expense', 'saving', 'investment')),
  amount         bigint not null check (amount >= 0),
  category       text not null,
  payment_method text,
  instrument     text,
  goal_id        uuid references public.goals (id) on delete set null,
  date           date not null,
  note           text default '',
  created_at     timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- ------------------------------------------------------------
-- 2. Tabel BUDGET (limit per kategori per user)
-- ------------------------------------------------------------
create table if not exists public.budgets (
  user_id  uuid not null references auth.users (id) on delete cascade,
  category text not null,
  "limit"  bigint not null default 0 check ("limit" >= 0),
  primary key (user_id, category)
);

-- ------------------------------------------------------------
-- 3. Tabel GOALS (target saving / investasi)
-- ------------------------------------------------------------
create table if not exists public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  target     bigint not null default 0,
  saved      bigint not null default 0,
  deadline   date,
  created_at timestamptz not null default now()
);

create index if not exists goals_user_idx on public.goals (user_id);

-- ------------------------------------------------------------
-- 4. Row Level Security
--    Inti keamanannya: tiap user HANYA bisa baca/tulis datanya
--    sendiri, walaupun pakai 1 database bersama.
-- ------------------------------------------------------------
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;
alter table public.goals        enable row level security;

-- TRANSAKSI
drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- BUDGET
drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;

create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- GOALS
drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;

create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Selesai. Lanjut isi .env.local dengan URL & anon key project-mu.
-- ------------------------------------------------------------
