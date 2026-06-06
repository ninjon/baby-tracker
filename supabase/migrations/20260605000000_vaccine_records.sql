-- =============================================
-- Phase 2 Step 3: Vaccine Records
-- =============================================

create table vaccine_records (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  vaccine_id text not null,
  administered_at date not null,
  batch_number text,
  clinic text,
  notes text,
  created_at timestamptz default now()
);

alter table vaccine_records enable row level security;

create policy "family read"
  on vaccine_records for select
  using (is_family_member(baby_id));

create policy "family insert"
  on vaccine_records for insert
  with check (is_family_member(baby_id));

create policy "family update"
  on vaccine_records for update
  using (is_family_member(baby_id));
