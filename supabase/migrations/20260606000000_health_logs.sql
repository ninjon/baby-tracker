-- =============================================
-- Phase 2 Step 4: Health / Symptom Logs
-- =============================================

create table health_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  timestamp timestamptz not null default now(),
  entry_type text not null check (entry_type in ('fever', 'medication', 'doctor_visit')),
  -- fever
  temperature_celsius numeric(4, 1),
  -- medication
  medication_name text,
  medication_dose text,
  -- doctor visit
  visit_type text check (visit_type in ('GP', 'PD', 'A&E', 'specialist', 'other')),
  doctor_name text,
  diagnosis text,
  -- shared
  notes text,
  created_at timestamptz default now()
);

alter table health_logs enable row level security;

create policy "family read"
  on health_logs for select
  using (is_family_member(baby_id));

create policy "family insert"
  on health_logs for insert
  with check (is_family_member(baby_id));

create policy "family update"
  on health_logs for update
  using (is_family_member(baby_id));
