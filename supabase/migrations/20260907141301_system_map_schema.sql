-- System Map – Datenmodell nach PRD-Brief v0.2/v0.3, Abschnitt 5
-- Erstellt: 07.09.2026-15:58
-- Alle Tabellen gehören genau einer Nutzerin (owner_id = auth.uid()). Row Level Security auf allen Tabellen.

-- ---------- Typen ----------
create type public.card_status as enum ('in_planung', 'begonnen', 'abgeschlossen', 'blockiert');
create type public.card_priority as enum ('hoch', 'mittel', 'niedrig');
create type public.dependency_source as enum ('goal', 'initiative');
create type public.view_mode as enum ('map', 'linear');
create type public.layout_mode as enum ('flexible', 'sorted', 'net');
create type public.timeline_scale as enum ('week', 'month');
create type public.theme_mode as enum ('dark', 'light', 'system');

-- ---------- Hilfsfunktion: updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- vision ----------
create table public.vision (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  status_override public.card_status,
  priority public.card_priority,
  start_date date not null default current_date,
  end_date date check (end_date is null or end_date >= start_date),
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vision_owner_idx on public.vision (owner_id);
create trigger vision_set_updated_at before update on public.vision
  for each row execute function public.set_updated_at();

-- ---------- goal (Ziel) ----------
create table public.goal (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vision_id uuid not null references public.vision (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  color text not null check (color in ('line-1','line-2','line-3','line-4','line-5','line-6','line-7','line-8')),
  status_override public.card_status,
  priority public.card_priority,
  start_date date not null default current_date,
  end_date date check (end_date is null or end_date >= start_date),
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goal_owner_idx on public.goal (owner_id);
create index goal_vision_idx on public.goal (vision_id);
create trigger goal_set_updated_at before update on public.goal
  for each row execute function public.set_updated_at();

-- ---------- initiative ----------
create table public.initiative (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  goal_id uuid not null references public.goal (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  status public.card_status not null default 'in_planung',
  priority public.card_priority,
  start_date date not null default current_date,
  end_date date check (end_date is null or end_date >= start_date),
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index initiative_owner_idx on public.initiative (owner_id);
create index initiative_goal_idx on public.initiative (goal_id);
create trigger initiative_set_updated_at before update on public.initiative
  for each row execute function public.set_updated_at();

-- ---------- metric (Metrik) ----------
create table public.metric (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  initiative_id uuid not null references public.initiative (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  done boolean not null default false,
  target_value numeric,
  current_value numeric,
  unit text check (unit is null or char_length(unit) <= 20),
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint metric_values_pair check ((target_value is null) = (current_value is null))
);
create index metric_owner_idx on public.metric (owner_id);
create index metric_initiative_idx on public.metric (initiative_id);
create trigger metric_set_updated_at before update on public.metric
  for each row execute function public.set_updated_at();

-- ---------- dependency (Abhängigkeit: Quelle blockiert Ziel) ----------
create table public.dependency (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_type public.dependency_source not null,
  source_id uuid not null,
  target_goal_id uuid not null references public.goal (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint dependency_unique unique (source_type, source_id, target_goal_id),
  constraint dependency_no_self check (not (source_type = 'goal' and source_id = target_goal_id))
);
create index dependency_owner_idx on public.dependency (owner_id);
create index dependency_target_idx on public.dependency (target_goal_id);
create index dependency_source_idx on public.dependency (source_type, source_id);

-- Quelle muss existieren und derselben Nutzerin gehören
create or replace function public.check_dependency_source()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.source_type = 'goal' then
    if not exists (select 1 from public.goal g where g.id = new.source_id and g.owner_id = new.owner_id) then
      raise exception 'dependency source goal not found';
    end if;
  else
    if not exists (select 1 from public.initiative i where i.id = new.source_id and i.owner_id = new.owner_id) then
      raise exception 'dependency source initiative not found';
    end if;
  end if;
  return new;
end;
$$;
create trigger dependency_check_source before insert or update on public.dependency
  for each row execute function public.check_dependency_source();

-- Abhängigkeiten mitlöschen, wenn ihre Quelle gelöscht wird (polymorph, daher kein FK)
create or replace function public.delete_dependencies_of_source()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.dependency d
   where d.source_id = old.id
     and d.source_type = (case tg_table_name when 'goal' then 'goal' else 'initiative' end)::public.dependency_source;
  return old;
end;
$$;
create trigger goal_delete_dependencies after delete on public.goal
  for each row execute function public.delete_dependencies_of_source();
create trigger initiative_delete_dependencies after delete on public.initiative
  for each row execute function public.delete_dependencies_of_source();

-- ---------- settings (eine Zeile je Nutzerin) ----------
create table public.settings (
  owner_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  active_vision_id uuid references public.vision (id) on delete set null,
  view public.view_mode not null default 'map',
  layout public.layout_mode not null default 'flexible',
  timeline_scale public.timeline_scale not null default 'week',
  theme public.theme_mode not null default 'dark',
  filter_status public.card_status[] not null default '{}',
  filter_goal_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);
create index settings_active_vision_idx on public.settings (active_vision_id);
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.vision enable row level security;
alter table public.goal enable row level security;
alter table public.initiative enable row level security;
alter table public.metric enable row level security;
alter table public.dependency enable row level security;
alter table public.settings enable row level security;

create policy "owner_all" on public.vision
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner_all" on public.goal
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner_all" on public.initiative
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner_all" on public.metric
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner_all" on public.dependency
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner_all" on public.settings
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- ---------- Nur eine freigegebene E-Mail-Adresse (Brief A-29) ----------
create table public.allowed_email (
  email text primary key
);
alter table public.allowed_email enable row level security;
-- keine Policies: nur über Dashboard/Service-Rolle änderbar
insert into public.allowed_email (email) values ('connynaumann@gmail.com');

create or replace function public.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.allowed_email a where lower(a.email) = lower(new.email)) then
    raise exception 'E-Mail-Adresse ist nicht freigegeben';
  end if;
  return new;
end;
$$;
create trigger enforce_allowed_email before insert on auth.users
  for each row execute function public.enforce_allowed_email();
