# Phase 2: Health Dashboard — Sophie's Tracker

**Objective:** Add growth charts (recharts), Singapore MOH vaccine tracker, health/symptom log,
and sleep/feed insights dashboard to the existing React + Vite + Supabase baby-tracker app.

**Project root:** `/Users/darrencheoh/baby-tracker/`
**baby_id:** `9e2e96bb`
**Existing tables:** `growth_logs`, `feeding_logs`, `sleep_logs`, `diaper_logs`, `pump_logs`
**Design tokens:** warm cream palette — `--color-bg: #faf8f5`, `--color-accent: #e8855a`, `--font-heading: "Calistoga"`

---

## Dependency Graph

```
Step 1 (Health Shell + recharts)
    ├── Step 2 (Growth Charts)         ← parallel after Step 1
    ├── Step 3 (Vaccine Tracker)       ← parallel after Step 1
    └── Step 4 (Health Log)            ← parallel after Step 1
            ↓ (all merged)
        Step 5 (Insights Dashboard)    ← serial after Steps 1–4
```

Steps 2, 3, and 4 have **no shared files** after the Health shell is in place — they can be
developed in parallel branches and merged in any order.

---

## Step 1 — Health Page Shell + recharts Install

**Branch:** `feat/health-shell`
**Model tier:** default
**Depends on:** nothing (Step 1 is the root)
**Rollback:** revert `Health.jsx` to stub, remove recharts from `package.json`

### Context brief (read cold)

The `/health` route currently renders a stub in `src/pages/Health.jsx`. This step installs
recharts and replaces the stub with a tabbed shell that exposes four tabs:
`Growth | Vaccines | Health Log | Insights`. Each tab renders a placeholder component.
Steps 2–4 will fill in the placeholders without touching each other.

### Task list

- [ ] `npm install recharts` — add to dependencies
- [ ] Create `src/pages/health/GrowthTab.jsx` — placeholder: `<p>Coming soon</p>`
- [ ] Create `src/pages/health/VaccinesTab.jsx` — placeholder
- [ ] Create `src/pages/health/HealthLogTab.jsx` — placeholder
- [ ] Create `src/pages/health/InsightsTab.jsx` — placeholder
- [ ] Rewrite `src/pages/Health.jsx` — render tab bar + `activeTab` state + switcher
- [ ] Tab bar style: pill tabs using `--color-accent` for active, `--color-bg` for inactive;
      min-height 44px touch targets; horizontal scroll on overflow
- [ ] Write `src/pages/Health.test.jsx` — renders each tab label, switches on click

### Verification

```bash
npm test -- --run src/pages/Health.test.jsx
npm run build
```

### Exit criteria

- `npm run build` exits 0
- All four tab labels render; clicking each switches content
- No recharts import errors

---

## Step 2 — Growth Charts

**Branch:** `feat/growth-charts`
**Model tier:** default
**Depends on:** Step 1 merged
**Rollback:** delete `src/pages/health/GrowthTab.jsx`, revert `src/components/charts/`

### Context brief (read cold)

`growth_logs` table columns: `id, baby_id, measured_at, weight_kg, height_cm, head_cm, notes`.
Step 1 created `src/pages/health/GrowthTab.jsx` as a placeholder. This step replaces it with
recharts line charts. Use the existing `src/lib/supabase.js` client. baby_id comes from
`useBaby()` context (never hardcode it).

Design system: `--color-accent: #e8855a` for data lines; `--color-surface` for chart background;
`--radius-card: 14px`; `--shadow-card` for chart wrapper. Font: Inter for axis labels.

### Task list

- [ ] Create `src/hooks/useGrowthLogs.js` — fetch `growth_logs` for `baby_id`, order by `measured_at asc`
- [ ] Create `src/components/charts/GrowthChart.jsx`
  - Props: `data` (array), `dataKey` (string), `unit` (string), `label` (string), `color` (string)
  - Use `<ResponsiveContainer width="100%" height={220}>`
  - Use `<LineChart>` with `<XAxis dataKey="measured_at">` formatted as `dd MMM` (date-fns)
  - Use `<YAxis>` with unit suffix
  - Use `<Tooltip>` styled with `--color-surface` background
  - Use `<Line type="monotone" dot={{ r: 4 }}>`
- [ ] Replace `src/pages/health/GrowthTab.jsx` — three `<GrowthChart>` instances
  - Sections: "Weight (kg)", "Height (cm)", "Head Circumference (cm)"
  - Empty state card when no data: "No measurements yet — add one from the log"
- [ ] Create `src/components/charts/GrowthChart.test.jsx` — renders with mock data, renders empty state
- [ ] Create `src/hooks/useGrowthLogs.test.js` — mocks supabase, returns formatted data

### Verification

```bash
npm test -- --run src/components/charts/GrowthChart.test.jsx
npm test -- --run src/hooks/useGrowthLogs.test.js
npm run build
```

### Exit criteria

- Three charts render with real data from Supabase
- X-axis shows formatted dates; Y-axis shows correct units
- Empty state shows when no measurements exist
- Tests pass

---

## Step 3 — Vaccine Tracker

**Branch:** `feat/vaccine-tracker`
**Model tier:** default
**Depends on:** Step 1 merged
**Rollback:** drop `vaccine_records` migration, delete `src/pages/health/VaccinesTab.jsx` and `src/lib/vaccineSchedule.js`

### Context brief (read cold)

Singapore's National Childhood Immunisation Schedule (NCIS). Store the schedule as a JS constant
(no DB needed for the schedule — only administered records hit DB). The `babies` table has
`date_of_birth date` — use it to compute each vaccine's due date.

Step 1 created `src/pages/health/VaccinesTab.jsx` as a placeholder — replace it.

### Singapore MOH NCIS schedule constant

```js
// src/lib/vaccineSchedule.js
export const VACCINE_SCHEDULE = [
  { id: 'bcg',           name: 'BCG',                    dueAge: { days: 0 },    mandatory: true },
  { id: 'hepb_1',        name: 'Hepatitis B (1)',         dueAge: { days: 0 },    mandatory: true },
  { id: 'hepb_2',        name: 'Hepatitis B (2)',         dueAge: { months: 1 },  mandatory: true },
  { id: 'dtap_1',        name: 'DTaP-IPV-Hib (1)',        dueAge: { months: 2 },  mandatory: true },
  { id: 'pcv_1',         name: 'PCV13 (1)',               dueAge: { months: 2 },  mandatory: true },
  { id: 'rota_1',        name: 'Rotavirus (1)',            dueAge: { months: 2 },  mandatory: false },
  { id: 'dtap_2',        name: 'DTaP-IPV-Hib (2)',        dueAge: { months: 4 },  mandatory: true },
  { id: 'pcv_2',         name: 'PCV13 (2)',               dueAge: { months: 4 },  mandatory: true },
  { id: 'rota_2',        name: 'Rotavirus (2)',            dueAge: { months: 4 },  mandatory: false },
  { id: 'dtap_3',        name: 'DTaP-IPV-Hib (3)',        dueAge: { months: 6 },  mandatory: true },
  { id: 'rota_3',        name: 'Rotavirus (3)',            dueAge: { months: 6 },  mandatory: false },
  { id: 'pcv_3',         name: 'PCV13 (3)',               dueAge: { months: 12 }, mandatory: true },
  { id: 'mmr_1',         name: 'MMR (1)',                  dueAge: { months: 12 }, mandatory: true },
  { id: 'varicella_1',   name: 'Varicella (1)',            dueAge: { months: 15 }, mandatory: false },
  { id: 'dtap_booster',  name: 'DTaP-IPV-Hib (booster)',  dueAge: { months: 18 }, mandatory: true },
  { id: 'mmr_2',         name: 'MMR (2)',                  dueAge: { months: 18 }, mandatory: true },
  { id: 'varicella_2',   name: 'Varicella (2)',            dueAge: { months: 18 }, mandatory: false },
];

// Returns the calendar date when this vaccine is due based on baby's DOB
export function getDueDate(vaccine, dateOfBirth) { ... }
```

### Task list

- [ ] Write migration `supabase/migrations/002_vaccine_records.sql`:
  ```sql
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
  create policy "family read" on vaccine_records for select using (is_family_member(baby_id));
  create policy "family write" on vaccine_records for insert with check (is_family_member(baby_id));
  create policy "family update" on vaccine_records for update using (is_family_member(baby_id));
  ```
- [ ] Create `src/lib/vaccineSchedule.js` — export `VACCINE_SCHEDULE` and `getDueDate(vaccine, dob)`
- [ ] Create `src/hooks/useVaccineRecords.js` — fetch `vaccine_records` for baby_id
- [ ] Replace `src/pages/health/VaccinesTab.jsx`:
  - Group by status: **Overdue** (due < today, not done), **Due soon** (within 30 days), **Upcoming**, **Done**
  - Each row: vaccine name, due date, status badge, tap to mark done
  - Mark-done bottom sheet: date picker + batch number + clinic + notes
  - Status badge colors: `--color-danger` overdue, `--color-warning` due soon, `--color-success` done
  - Use existing `<BottomSheet>` component from `src/components/BottomSheet.jsx`
- [ ] Create `src/hooks/useVaccineRecords.test.js`
- [ ] Create `src/lib/vaccineSchedule.test.js` — test `getDueDate` for birth, 2m, 18m entries

### Verification

```bash
npm test -- --run src/lib/vaccineSchedule.test.js
npm test -- --run src/hooks/useVaccineRecords.test.js
npm run build
```

### Exit criteria

- Vaccines grouped by status with correct due dates from baby DOB
- Marking a vaccine done writes to `vaccine_records` and updates UI
- Tests pass for date calculation logic

---

## Step 4 — Health / Symptom Log

**Branch:** `feat/health-log`
**Model tier:** default
**Depends on:** Step 1 merged
**Rollback:** drop `health_logs` migration, delete `src/pages/health/HealthLogTab.jsx` and related files

### Context brief (read cold)

The Health Log tracks three entry types: fever (temperature °C), medications (name + dose + time),
and doctor visits (visit type, doctor name, diagnosis, notes). Step 1 created
`src/pages/health/HealthLogTab.jsx` as a placeholder — replace it.

Reuse existing form patterns from `src/components/forms/FeedingForm.jsx` for field styles.
Use `<BottomSheet>` from `src/components/BottomSheet.jsx` for the add-entry sheet.

### Task list

- [ ] Write migration `supabase/migrations/003_health_logs.sql`:
  ```sql
  create table health_logs (
    id uuid primary key default gen_random_uuid(),
    baby_id uuid not null references babies(id) on delete cascade,
    logged_by uuid references auth.users(id),
    timestamp timestamptz not null default now(),
    entry_type text not null check (entry_type in ('fever','medication','doctor_visit')),
    temperature_celsius numeric(4,1),
    medication_name text,
    medication_dose text,
    visit_type text check (visit_type in ('GP','PD','A&E','specialist','other')),
    doctor_name text,
    diagnosis text,
    notes text,
    created_at timestamptz default now()
  );
  alter table health_logs enable row level security;
  create policy "family read" on health_logs for select using (is_family_member(baby_id));
  create policy "family write" on health_logs for insert with check (is_family_member(baby_id));
  create policy "family update" on health_logs for update using (is_family_member(baby_id));
  ```
- [ ] Create `src/hooks/useHealthLogs.js` — fetch `health_logs` for baby_id, ordered desc
- [ ] Create `src/components/forms/HealthLogForm.jsx` — three-tab form (Fever / Medication / Doctor Visit)
  - Fever: temperature field (°C, numeric step 0.1), datetime, notes
  - Medication: medication name, dose text, datetime, notes
  - Doctor Visit: visit type select (GP/PD/A&E/specialist/other), doctor name, diagnosis, datetime, notes
- [ ] Replace `src/pages/health/HealthLogTab.jsx`:
  - Chronological list newest-first
  - Each card: icon + entry type label + primary value (temp / med name / doctor) + date-time
  - FAB "+" opens `<HealthLogForm>` in `<BottomSheet>`
  - Empty state: "No health events recorded yet"
- [ ] Create `src/components/forms/HealthLogForm.test.jsx`
- [ ] Create `src/hooks/useHealthLogs.test.js`

### Verification

```bash
npm test -- --run src/components/forms/HealthLogForm.test.jsx
npm test -- --run src/hooks/useHealthLogs.test.js
npm run build
```

### Exit criteria

- All three entry types can be submitted and appear in the list
- Entry cards show correct icons and primary values
- Tests pass

---

## Step 5 — Sleep / Feed Insights Dashboard

**Branch:** `feat/insights-dashboard`
**Model tier:** default
**Depends on:** Steps 1–4 merged (recharts from Step 1 required)
**Rollback:** revert `src/pages/health/InsightsTab.jsx` to placeholder, remove unused chart components

### Context brief (read cold)

`sleep_logs` columns: `id, baby_id, start_time, end_time, duration_minutes`.
`feeding_logs` columns: `id, baby_id, timestamp, type (breast|bottle), side, duration_minutes, amount_ml`.

recharts is installed (Step 1). Step 1 created `src/pages/health/InsightsTab.jsx` placeholder.
baby_id comes from `useBaby()` context.

### Four insight cards

1. **Sleep duration trend** — BarChart, last 14 days, total sleep per day (sum `duration_minutes`)
2. **Sleep time-of-day** — BarChart, hour-of-day distribution (0–23) of sleep start times
3. **Feed type breakdown** — PieChart, breast vs bottle count, last 7 days
4. **Feed amount trend** — LineChart, last 14 days, total `amount_ml` per day (bottle feeds only)

### Task list

- [ ] Create `src/hooks/useInsights.js`
  - `useSleepInsights(babyId, days)` — fetch sleep_logs, bucket by date, aggregate total minutes
  - `useFeedInsights(babyId, days)` — fetch feeding_logs, bucket by date and type
  - Use `date-fns` `startOfDay`, `format`, `subDays`, `getHours` for aggregation
- [ ] Create `src/components/charts/InsightCard.jsx`
  - Props: `title`, `subtitle`, `children`
  - Card: `--radius-card`, `--shadow-card`, 16px padding, `--font-heading` for title
- [ ] Create `src/components/charts/SleepDurationChart.jsx` — BarChart, fill `--color-accent`
- [ ] Create `src/components/charts/SleepTimeChart.jsx` — BarChart, horizontal, hour-of-day
- [ ] Create `src/components/charts/FeedBreakdownChart.jsx` — PieChart, breast `--color-accent` / bottle `#6db86d`
- [ ] Create `src/components/charts/FeedAmountChart.jsx` — LineChart, `--color-accent` stroke
- [ ] Replace `src/pages/health/InsightsTab.jsx`:
  - Date range pill toggle: "7 days | 14 days | 30 days" (above cards)
  - Summary stats row: avg sleep/day (hrs), longest stretch (hrs), feeds/day, avg ml/feed
  - Four `<InsightCard>` with respective charts
  - Empty state per card when no data in range
- [ ] Create `src/hooks/useInsights.test.js` — test aggregation with mock data
- [ ] Create `src/components/charts/InsightCard.test.jsx`

### Verification

```bash
npm test -- --run src/hooks/useInsights.test.js
npm test -- --run src/components/charts/InsightCard.test.jsx
npm run build
```

### Exit criteria

- All four charts render with real data
- Date range toggle updates all charts simultaneously
- Summary stats are accurate
- Empty states shown when no data in range
- Tests pass

---

## Migration application order

Apply in Supabase SQL editor or via CLI:

```bash
# Supabase CLI (from project root):
supabase db push

# Or apply manually in this order:
# 1. supabase/migrations/002_vaccine_records.sql
# 2. supabase/migrations/003_health_logs.sql
```

Migrations 002 and 003 are independent — apply in either order.

---

## Invariants (verified after every step)

- `npm run build` exits 0
- `npm test` passes with no regressions
- Design tokens from `src/index.css` used throughout — no hardcoded hex colours in components
- `baby_id` always read from `useBaby()` context — never hardcoded
- RLS policies on every new table use the existing `is_family_member()` helper
- No `console.log` or debug statements committed

---

## Step ordering summary

| Step | Feature                 | Parallelism           | New files created                                                            |
| ---- | ----------------------- | --------------------- | ---------------------------------------------------------------------------- |
| 1    | Health Shell + recharts | serial root           | `src/pages/health/` folder, 4 placeholder tabs, rewrite `Health.jsx`         |
| 2    | Growth Charts           | parallel after Step 1 | `useGrowthLogs`, `GrowthChart`, replace `GrowthTab`                          |
| 3    | Vaccine Tracker         | parallel after Step 1 | migration 002, `vaccineSchedule`, `useVaccineRecords`, replace `VaccinesTab` |
| 4    | Health Log              | parallel after Step 1 | migration 003, `useHealthLogs`, `HealthLogForm`, replace `HealthLogTab`      |
| 5    | Insights Dashboard      | serial after 1–4      | `useInsights`, 4 chart components, `InsightCard`, replace `InsightsTab`      |

**Total PRs:** 5  
**Parallel windows:** Steps 2, 3, 4 can be open simultaneously.
