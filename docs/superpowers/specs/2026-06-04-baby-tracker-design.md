# Sophie's Baby Tracker — Design Spec

**Date:** 2026-06-04  
**EDD:** 2026-08-13  
**Stack:** React + Vite + Supabase + Claude API  
**Platform:** Mobile-first PWA (web browser, installable via Add to Home Screen)

---

## 1. Context

First-time parents tracking a newborn daughter, Sophie. The app must be operable one-handed at 3am with minimal cognitive load. Both parents log events; grandparents have view-only access. All data syncs in real time across the family.

---

## 2. Architecture

```
React (Vite PWA)
  └── Supabase JS SDK
        ├── Postgres (all logs, health, milestones)
        ├── Auth (email + magic link; family invite flow)
        ├── Realtime (live sync across family devices)
        ├── Storage (milestone photos, doctor visit attachments)
        └── Edge Functions
              └── Claude API (Sonnet) — AI insights only
```

**Hosting:**

- Frontend: Vercel (free tier)
- Backend: Supabase (free tier — 500MB DB, 1GB storage, sufficient for years of data)
- AI: Claude API billed per use (~$0.01–0.05/month at this scale)

**Family roles:**

| Role     | Permissions                                               |
| -------- | --------------------------------------------------------- |
| `owner`  | Full access — create, read, update, delete, manage family |
| `parent` | Full access — create, read, update, delete                |
| `viewer` | Read only — grandparents, extended family                 |

Row Level Security in Supabase enforces role boundaries without a custom backend.

---

## 3. Design Direction

**Theme: Warm Utility**

The interface does one job — help exhausted parents capture and understand data — and it must do it without friction at any hour. No marketing copy inside the app. No cards inside cards.

| Token          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Background     | `#FAFAF8` (warm off-white)                               |
| Surface        | `#FFFFFF`                                                |
| Border         | `#E0DAD3`                                                |
| Text primary   | `#1A1814`                                                |
| Text secondary | `#A89F97`                                                |
| Accent (coral) | `#E8855A`                                                |
| Accent light   | `#FFF7F3`                                                |
| Success        | `#7DBF7D`                                                |
| Warning        | `#F5A623`                                                |
| Danger         | `#E84040`                                                |
| Border radius  | `12px` (cards), `14px` (buttons), `20px` (bottom sheets) |
| Min tap target | `56px` height                                            |

**Typography:** System UI stack (`-apple-system, BlinkMacSystemFont, system-ui`). No external font dependency.

**Motion:** Minimal. Bottom sheet slides up (200ms ease-out). Tab transitions are instant. No decorative animation.

**Dark mode:** Not in scope for v1. Warm palette is readable in low light without a full dark theme.

---

## 4. App Structure — 5-Tab Navigation

```
┌─────────────────────────────────────┐
│  Home  History  [+]  Health  More   │
└─────────────────────────────────────┘
```

The `[+]` centre button is a floating action button (FAB) accessible from every tab. Tapping it opens the log bottom sheet.

---

## 5. Screens

### 5.1 Home

First viewport shows:

1. **Header** — Sophie's name + day of life counter ("Sophie · Day 14")
2. **Status cards row** — three cards: last fed (time since), last diaper (time since), current awake/sleep state (duration)
3. **Quick log buttons** — 2×2 grid: Feeding, Diaper, Sleep, Growth. Tapping any opens the relevant log sheet.
4. **AI nudge card** — single most relevant insight from the AI layer (warm coral tint). Tapping navigates to full Insights screen.

### 5.2 History

A reverse-chronological timeline of all logged events.

**Filter chips** (scrollable row): All · Feed · Diaper · Sleep · Health · Milestone

**Event card** contains:

- Category icon in a tinted rounded square
- Event title + key detail (e.g. "Bottle · 90ml", "Wet diaper", "Nap · 1h 45m")
- Timestamp + who logged it
- Chevron (tap to view full detail, edit, or delete)

Events grouped under sticky date headers. Milestones appear inline in the timeline with a star badge.

### 5.3 Log — Bottom Sheet

Opened via the centre FAB or any quick log button. A bottom sheet slides up with a draggable handle.

**Category selector** (if opened via FAB): Feed · Diaper · Sleep · Growth · Pump · Milestone · Journal · Symptom

**Time field** — pre-filled to current time, tappable to open a time wheel (allows back-filling missed logs).

**Per-category fields:**

**Feeding:**

- Type: Breast / Bottle
- If breast: Side (Left / Right / Both) + Duration (timer or manual minutes)
- If bottle: Amount in ml (number pad)
- Notes (optional)

**Diaper:**

- Type: Wet / Dirty / Both
- If dirty or both:
  - Colour: visual swatch picker — Yellow (Normal) · Green (Transitional) · Brown (Formula) · Black (Meconium) · White/Grey (See PD) · Red (See PD)
  - White and Red show a contextual advisory warning inline
  - Consistency: Seedy (default for breastfed) · Pasty · Liquid · Solid
- Notes (optional)

**Sleep:**

- Start time + End time (or tap "Still sleeping" — closes sheet, starts a live sleep timer visible on home)
- Notes (optional)

**Growth:**

- Weight (kg) · Height (cm) · Head circumference (cm) — all optional individually
- Notes (optional)

**Milestone:**

- Title (text)
- Description (optional)
- Photo (optional, stored in Supabase Storage)

**Pump:**

- Duration (timer or manual minutes)
- Volume: Left (ml) · Right (ml) — total auto-computed; or enter total directly
- Storage: Feed now · Fridge · Freezer
- If Fridge or Freezer: auto-stamps today's date as the label; expiry shown inline (fridge = 4 days, freezer = 6 months)
- Notes (optional)

**Symptom:**

- Type: Fever · Congestion · Rash · Jaundice · Vomiting · Other
- Severity: Mild · Moderate · Severe
- Temperature field appears when Fever is selected
- Notes (optional)

### 5.4 Health

Four sub-sections selectable via a segmented control:

**Growth:**

- Line chart (weight over time) with WHO percentile bands (3rd, 15th, 50th, 85th, 97th)
- Stats row: current weight / height / head with percentile badge
- Chart supports weight, height, and head tab switching

**Vaccines:**

- Singapore EPI schedule pre-loaded
- Two lists: Upcoming (sorted by date, next highlighted in coral) · Completed (greyed, checkmark)
- Tap to mark as administered; records date and clinic

**Visits:**

- Reverse-chronological list of doctor visits
- Each entry: date, clinic/doctor, notes, attachments (photo or PDF)
- Add visit button opens a log sheet

**Symptoms:**

- List of logged symptoms with severity dot (green / amber / red)
- Useful to review before a PD appointment
- Auto-clears symptoms older than 30 days unless flagged

### 5.5 More

A simple menu screen linking to:

**Pump Log & Milk Stash** — Two views in one screen:

- _Session log_: reverse-chronological list of pump sessions (time, duration, volume, storage destination)
- _Milk stash_: running inventory split by Fridge and Freezer. Each stored batch shows volume, label date, and expiry. Batches are depleted automatically when a bottle feed is logged and marked "from stash". Expired batches are highlighted in amber.

**Milestones** — Photo + caption timeline. Filterable by month. Each card shows photo (if attached), milestone name, date, and who logged it.

**Journal** — Daily notes. One entry per day, free-text. Photo attachments supported. Readable by all family members.

**Insights** — Full AI insights screen (see Section 6).

**Family** — Manage family members. Shows current members with their role. Invite via link or email. Role can be changed by owner. Remove member.

**Settings** — Baby profile (name, DOB, photo), notification preferences, export data as CSV.

---

## 6. AI Insights

### Two surfaces

**Home nudge** — single card on the home screen showing the most relevant current insight. Tapping navigates to the full Insights screen.

**Full Insights screen** — all insight categories, period selector (7 / 14 / 30 days), refresh button.

### Insight categories

| Category     | What Claude analyses                                                        |
| ------------ | --------------------------------------------------------------------------- |
| Feeding      | Average interval, volume trends, consistency of hunger cues                 |
| Sleep        | Total daily sleep, longest stretch, awake window trends, regression signals |
| Diapers      | Wet + dirty count per day (adequate output = adequate intake signal)        |
| Growth       | Weekly weight gain rate vs expected range                                   |
| Correlations | e.g. "Longer sleep after feeds >90ml" when detectable                       |

### Severity levels

- **Normal** (green) — within expected range for age
- **Watch this** (amber) — worth monitoring, not urgent
- **Contact PD** (red) — pattern that warrants professional review

Every insights screen includes a persistent disclaimer: _"These are pattern observations, not medical advice. Always consult your PD for health concerns."_

### Technical implementation

1. Supabase Edge Function (`/functions/generate-insights`) runs on schedule (daily at 6am SGT) or on-demand via user tap
2. Function queries aggregated statistics from Postgres — never raw log entries
3. Stats passed to Claude API (Sonnet): averages, counts, durations, growth delta
4. Claude returns structured JSON: `[{ category, severity, headline, body }]`
5. Insights stored in `ai_insights` table and served to client; not re-fetched on every load
6. Estimated cost: <$0.05/month

---

## 7. Data Model

### Tables

```sql
babies
  id uuid PK
  name text
  date_of_birth date
  photo_url text
  created_by uuid FK users
  created_at timestamptz

family_members
  id uuid PK
  baby_id uuid FK babies
  user_id uuid FK users
  role text CHECK (role IN ('owner','parent','viewer'))
  invited_at timestamptz
  accepted_at timestamptz

feeding_logs
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  timestamp timestamptz          -- user-editable, defaults to now()
  type text CHECK (type IN ('breast','bottle'))
  side text CHECK (side IN ('left','right','both'))  -- nullable
  duration_minutes int           -- nullable (breast)
  amount_ml int                  -- nullable (bottle)
  notes text
  created_at timestamptz

diaper_logs
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  timestamp timestamptz
  type text CHECK (type IN ('wet','dirty','both'))
  color text CHECK (color IN ('yellow','green','brown','black','white','red'))  -- nullable
  consistency text CHECK (consistency IN ('seedy','pasty','liquid','solid'))   -- nullable
  notes text
  created_at timestamptz

sleep_logs
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  start_time timestamptz
  end_time timestamptz           -- nullable (sleep in progress)
  duration_minutes int           -- computed when end_time is set
  notes text
  created_at timestamptz

growth_logs
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  measured_at timestamptz
  weight_kg numeric(4,3)         -- nullable
  height_cm numeric(5,1)         -- nullable
  head_cm numeric(5,1)           -- nullable
  notes text
  created_at timestamptz

vaccinations
  id uuid PK
  baby_id uuid FK babies
  name text
  scheduled_date date
  administered_date date         -- nullable until given
  clinic text
  notes text
  created_at timestamptz

doctor_visits
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  visited_at timestamptz
  clinic text
  doctor text
  notes text
  attachment_urls text[]
  created_at timestamptz

symptoms
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  logged_at timestamptz
  type text
  severity text CHECK (severity IN ('mild','moderate','severe'))
  temperature_celsius numeric(4,1)  -- nullable
  notes text
  created_at timestamptz

milestones
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  occurred_at timestamptz
  title text
  description text
  photo_url text                 -- Supabase Storage
  created_at timestamptz

journal_entries
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  entry_date date                -- one per day
  content text
  photo_urls text[]
  created_at timestamptz
  updated_at timestamptz

pump_logs
  id uuid PK
  baby_id uuid FK babies
  logged_by uuid FK users
  timestamp timestamptz
  duration_minutes int           -- nullable
  volume_left_ml int             -- nullable
  volume_right_ml int            -- nullable
  volume_total_ml int            -- computed: left + right, or manually entered
  storage text CHECK (storage IN ('feed_now','fridge','freezer'))
  label_date date                -- auto-set to today when fridge/freezer
  notes text
  created_at timestamptz

ai_insights
  id uuid PK
  baby_id uuid FK babies
  generated_at timestamptz
  period_days int
  insights jsonb                 -- [{category, severity, headline, body}]
  created_at timestamptz
```

All tables have Row Level Security policies: users can only read/write rows where `baby_id` matches a `family_members` record for their `user_id`. Viewers are blocked from INSERT/UPDATE/DELETE by policy.

---

## 8. Build Phases

### Phase 1 — Core Tracker (target: ready before Aug 13)

- Supabase project setup, auth, RLS policies
- Baby profile creation
- Feeding log
- Diaper log (colour picker + inline warnings)
- Sleep log (live timer)
- Growth log (weight / height / head entry form — no chart yet)
- Pump log + Milk Stash (session log, fridge/freezer inventory, expiry tracking)
- Home screen with status cards
- History timeline with filters
- Family sharing (invite by link, viewer/parent roles)
- PWA manifest + installable on iOS/Android home screen

### Phase 2 — Health & Growth (weeks 1–3 after birth)

- Growth chart with WHO percentile bands
- Vaccination schedule (Singapore EPI pre-loaded)
- Doctor visits log
- Symptoms log

### Phase 3 — Milestones & Journal (weeks 3–6 after birth)

- Milestones with photos
- Daily journal
- More screen

### Phase 4 — AI Insights (weeks 6–8 after birth, once sufficient data exists)

- Supabase Edge Function + Claude API integration
- Home nudge card
- Full Insights screen with period selector
- Settings: data export as CSV

---

## 9. Non-Goals (v1)

- Native iOS/Android app (PWA is sufficient)
- Push notifications (browser notifications considered for Phase 2)
- Multi-baby support (data model supports it, UI does not in v1)
- Pediatrician portal or doctor sharing
- AI chat interface (structured insights only, not a chatbot)
- Offline-first / CRDT sync (Supabase realtime covers the family use case)
