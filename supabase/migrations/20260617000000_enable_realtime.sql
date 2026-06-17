-- Enable Supabase Realtime for the log tables.
--
-- The app subscribes to postgres_changes on these tables in
-- src/hooks/useRealtimeLogs.js so that new logs appear live (same device and
-- across both parents' phones). Without the tables being members of the
-- `supabase_realtime` publication, Postgres never broadcasts their changes:
-- logs still save and persist correctly, but the UI does not update until the
-- screen is re-navigated or reloaded. This migration closes that gap.

-- REPLICA IDENTITY FULL makes the complete row (including baby_id, which the
-- client uses both in its channel filter and which RLS needs) available on
-- UPDATE/DELETE change events. Safe to run repeatedly.
alter table public.feeding_logs replica identity full;
alter table public.diaper_logs  replica identity full;
alter table public.sleep_logs   replica identity full;
alter table public.growth_logs  replica identity full;
alter table public.pump_logs    replica identity full;

-- Add each log table to the realtime publication, idempotently.
do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach t in array array[
    'feeding_logs', 'diaper_logs', 'sleep_logs', 'growth_logs', 'pump_logs'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
