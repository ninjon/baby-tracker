-- =============================================
-- Phase 1 Schema: Sophie's Baby Tracker
-- =============================================

-- babies
create table babies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_of_birth date not null,
  photo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- family_members
create table family_members (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text not null check (role in ('owner','parent','viewer')),
  invite_token uuid unique default gen_random_uuid(),
  invited_at timestamptz default now(),
  accepted_at timestamptz
);

-- feeding_logs
create table feeding_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  timestamp timestamptz not null default now(),
  type text not null check (type in ('breast','bottle')),
  side text check (side in ('left','right','both')),
  duration_minutes int,
  amount_ml int,
  notes text,
  created_at timestamptz default now()
);

-- diaper_logs
create table diaper_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  timestamp timestamptz not null default now(),
  type text not null check (type in ('wet','dirty','both')),
  color text check (color in ('yellow','green','brown','black','white','red')),
  consistency text check (consistency in ('seedy','pasty','liquid','solid')),
  notes text,
  created_at timestamptz default now()
);

-- sleep_logs
create table sleep_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration_minutes int,
  notes text,
  created_at timestamptz default now()
);

-- growth_logs
create table growth_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  measured_at timestamptz not null default now(),
  weight_kg numeric(4,3),
  height_cm numeric(5,1),
  head_cm numeric(5,1),
  notes text,
  created_at timestamptz default now()
);

-- pump_logs
create table pump_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  logged_by uuid references auth.users(id),
  timestamp timestamptz not null default now(),
  duration_minutes int,
  volume_left_ml int,
  volume_right_ml int,
  volume_total_ml int,
  storage text not null check (storage in ('feed_now','fridge','freezer')),
  label_date date,
  notes text,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table babies enable row level security;
alter table family_members enable row level security;
alter table feeding_logs enable row level security;
alter table diaper_logs enable row level security;
alter table sleep_logs enable row level security;
alter table growth_logs enable row level security;
alter table pump_logs enable row level security;

-- Helper: is current user a family member for this baby?
create or replace function is_family_member(p_baby_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from family_members
    where baby_id = p_baby_id
      and user_id = auth.uid()
      and accepted_at is not null
  );
$$;

-- Helper: can current user write (owner or parent)?
create or replace function can_write(p_baby_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from family_members
    where baby_id = p_baby_id
      and user_id = auth.uid()
      and role in ('owner','parent')
      and accepted_at is not null
  );
$$;

-- babies policies
create policy "family can read baby" on babies
  for select using (is_family_member(id));

create policy "owner can update baby" on babies
  for update using (
    exists (
      select 1 from family_members
      where baby_id = babies.id
        and user_id = auth.uid()
        and role = 'owner'
        and accepted_at is not null
    )
  );

create policy "anyone can create baby" on babies
  for insert with check (auth.uid() is not null);

-- family_members policies
create policy "family can read members" on family_members
  for select using (is_family_member(baby_id));

create policy "owner can manage members" on family_members
  for all using (
    exists (
      select 1 from family_members fm2
      where fm2.baby_id = family_members.baby_id
        and fm2.user_id = auth.uid()
        and fm2.role = 'owner'
        and fm2.accepted_at is not null
    )
  );

create policy "accept own invite" on family_members
  for update using (user_id = auth.uid());

create policy "insert own membership" on family_members
  for insert with check (auth.uid() is not null);

-- Log table policies
create policy "family reads feeding" on feeding_logs for select using (is_family_member(baby_id));
create policy "writer inserts feeding" on feeding_logs for insert with check (can_write(baby_id));
create policy "writer updates feeding" on feeding_logs for update using (can_write(baby_id));
create policy "writer deletes feeding" on feeding_logs for delete using (can_write(baby_id));

create policy "family reads diaper" on diaper_logs for select using (is_family_member(baby_id));
create policy "writer inserts diaper" on diaper_logs for insert with check (can_write(baby_id));
create policy "writer updates diaper" on diaper_logs for update using (can_write(baby_id));
create policy "writer deletes diaper" on diaper_logs for delete using (can_write(baby_id));

create policy "family reads sleep" on sleep_logs for select using (is_family_member(baby_id));
create policy "writer inserts sleep" on sleep_logs for insert with check (can_write(baby_id));
create policy "writer updates sleep" on sleep_logs for update using (can_write(baby_id));
create policy "writer deletes sleep" on sleep_logs for delete using (can_write(baby_id));

create policy "family reads growth" on growth_logs for select using (is_family_member(baby_id));
create policy "writer inserts growth" on growth_logs for insert with check (can_write(baby_id));
create policy "writer updates growth" on growth_logs for update using (can_write(baby_id));
create policy "writer deletes growth" on growth_logs for delete using (can_write(baby_id));

create policy "family reads pump" on pump_logs for select using (is_family_member(baby_id));
create policy "writer inserts pump" on pump_logs for insert with check (can_write(baby_id));
create policy "writer updates pump" on pump_logs for update using (can_write(baby_id));
create policy "writer deletes pump" on pump_logs for delete using (can_write(baby_id));
