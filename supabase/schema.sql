-- The Meal Box — Supabase schema
-- Run this whole file once in the Supabase SQL editor for your project
-- (Project → SQL Editor → New query → paste → Run).
--
-- This file is safe to re-run: every statement is idempotent, so if you
-- already ran an earlier version of it, re-running the latest copy just
-- picks up whatever's new (e.g. cycle-sync) without touching existing data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- recipes: one row per recipe, owned by the signed-in user
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null default 'Dinner',
  type text not null default 'single',
  prep_notes text not null default '',
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional cycle-sync phase tags (e.g. "luteal", "follicular") a recipe is
-- good for. Added after the initial release; IF NOT EXISTS keeps re-runs safe.
alter table public.recipes add column if not exists phase_tags jsonb not null default '[]'::jsonb;

create index if not exists recipes_user_id_idx on public.recipes (user_id);

-- ---------------------------------------------------------------------------
-- weeks: one row per (user, week_start). Holds the day-by-day meal plan,
-- day ordering (for drag-reorder), and that week's shopping list state.
-- ---------------------------------------------------------------------------
create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  day_order jsonb not null default '[]'::jsonb,
  days jsonb not null default '{}'::jsonb,
  shopping jsonb not null default '{"manual": [], "checked": {}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weeks_user_id_idx on public.weeks (user_id);
create index if not exists weeks_user_week_idx on public.weeks (user_id, week_start);

-- ---------------------------------------------------------------------------
-- cycle_settings: one row per user. Powers the optional cycle-sync feature —
-- entirely private to the account, same RLS pattern as everything else.
-- ---------------------------------------------------------------------------
create table if not exists public.cycle_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  start_date date,
  avg_cycle_length int not null default 28,
  macro_targets jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cycle_settings_user_id_idx on public.cycle_settings (user_id);

-- ---------------------------------------------------------------------------
-- keep updated_at fresh on every update
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

drop trigger if exists weeks_set_updated_at on public.weeks;
create trigger weeks_set_updated_at
  before update on public.weeks
  for each row execute function public.set_updated_at();

drop trigger if exists cycle_settings_set_updated_at on public.cycle_settings;
create trigger cycle_settings_set_updated_at
  before update on public.cycle_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: every user can only ever see/touch their own rows
-- ---------------------------------------------------------------------------
alter table public.recipes enable row level security;
alter table public.weeks enable row level security;
alter table public.cycle_settings enable row level security;

drop policy if exists "recipes_select_own" on public.recipes;
create policy "recipes_select_own" on public.recipes
  for select using (auth.uid() = user_id);

drop policy if exists "recipes_insert_own" on public.recipes;
create policy "recipes_insert_own" on public.recipes
  for insert with check (auth.uid() = user_id);

drop policy if exists "recipes_update_own" on public.recipes;
create policy "recipes_update_own" on public.recipes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recipes_delete_own" on public.recipes;
create policy "recipes_delete_own" on public.recipes
  for delete using (auth.uid() = user_id);

drop policy if exists "weeks_select_own" on public.weeks;
create policy "weeks_select_own" on public.weeks
  for select using (auth.uid() = user_id);

drop policy if exists "weeks_insert_own" on public.weeks;
create policy "weeks_insert_own" on public.weeks
  for insert with check (auth.uid() = user_id);

drop policy if exists "weeks_update_own" on public.weeks;
create policy "weeks_update_own" on public.weeks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "weeks_delete_own" on public.weeks;
create policy "weeks_delete_own" on public.weeks
  for delete using (auth.uid() = user_id);

drop policy if exists "cycle_settings_select_own" on public.cycle_settings;
create policy "cycle_settings_select_own" on public.cycle_settings
  for select using (auth.uid() = user_id);

drop policy if exists "cycle_settings_insert_own" on public.cycle_settings;
create policy "cycle_settings_insert_own" on public.cycle_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "cycle_settings_update_own" on public.cycle_settings;
create policy "cycle_settings_update_own" on public.cycle_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cycle_settings_delete_own" on public.cycle_settings;
create policy "cycle_settings_delete_own" on public.cycle_settings
  for delete using (auth.uid() = user_id);
