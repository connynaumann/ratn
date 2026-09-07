-- System Map – Ein Ziel kann zu mehreren Visionen gehören (Entscheidung D-09, 07.09.2026-18:10)
-- Ersetzt goal.vision_id durch die Verknüpfungstabelle goal_vision.

-- ---------- Verknüpfungstabelle ----------
create table public.goal_vision (
  goal_id uuid not null references public.goal (id) on delete cascade,
  vision_id uuid not null references public.vision (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (goal_id, vision_id)
);
create index goal_vision_vision_idx on public.goal_vision (vision_id);
create index goal_vision_owner_idx on public.goal_vision (owner_id);

-- Bestandsdaten übernehmen (Tabelle ist zum Zeitpunkt der Migration leer, aber idempotent gehalten)
insert into public.goal_vision (goal_id, vision_id, owner_id, sort_index)
select g.id, g.vision_id, g.owner_id, g.sort_index from public.goal g
on conflict do nothing;

-- sort_index wandert in die Verknüpfung: Reihenfolge gilt je Vision
alter table public.goal drop column vision_id;
alter table public.goal drop column sort_index;

-- ---------- Verwaiste Ziele entfernen ----------
-- Ein Ziel ohne Vision ist in der Oberfläche nicht erreichbar. Wird die letzte
-- Verknüpfung gelöscht (z. B. beim Löschen einer Vision), wird das Ziel mitgelöscht.
create or replace function public.delete_orphan_goals()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.goal g
   where g.id = old.goal_id
     and not exists (select 1 from public.goal_vision gv where gv.goal_id = g.id);
  return old;
end;
$$;
create trigger goal_vision_delete_orphans after delete on public.goal_vision
  for each row execute function public.delete_orphan_goals();
revoke execute on function public.delete_orphan_goals() from public, anon, authenticated;

-- ---------- Row Level Security ----------
alter table public.goal_vision enable row level security;
create policy "owner_all" on public.goal_vision
  for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
