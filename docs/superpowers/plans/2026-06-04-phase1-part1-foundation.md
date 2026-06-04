# Baby Tracker Phase 1 — Part 1: Foundation & Log Forms

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the React + Vite PWA, wire up Supabase (auth, schema, RLS), and build all 8 log entry forms (Feeding, Diaper, Sleep, Growth, Pump, Milestone, Symptom, Journal via LogSheet bottom sheet).

**Architecture:** Mobile-first React SPA with Vite. CSS custom properties for design tokens. Supabase JS SDK for auth + database. Vitest + @testing-library/react for unit/integration tests. No Tailwind — vanilla CSS modules.

**Tech Stack:** React 18, Vite 5, @supabase/supabase-js, react-router-dom v6, date-fns, Vitest, @testing-library/react, @testing-library/user-event, jsdom

---

### Task 1: Project Scaffold

**Files:**

- Create: `baby-tracker/` (project root via Vite scaffold)
- Modify: `package.json` (add deps)
- Modify: `vite.config.js` (add PWA plugin + test config)

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /Users/darrencheoh
npm create vite@latest baby-tracker -- --template react
cd baby-tracker
```

Expected: `baby-tracker/` folder created with `src/App.jsx`, `index.html`, `package.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js react-router-dom date-fns
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom vite-plugin-pwa
```

Expected: `node_modules/` populated, no errors.

- [ ] **Step 3: Configure Vite for tests and PWA**

Replace `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Sophie's Tracker",
        short_name: "Tracker",
        theme_color: "#E8855A",
        background_color: "#FAFAF8",
        display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
});
```

- [ ] **Step 4: Create test setup file**

Create `src/test/setup.js`:

```js
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Create .env.local**

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 6: Run dev server to verify scaffold**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`. Open browser — default Vite+React page loads.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React PWA with Supabase deps"
```

---

### Task 2: Design Tokens

**Files:**

- Modify: `src/index.css` (CSS custom properties + resets)

- [ ] **Step 1: Replace index.css with design tokens and resets**

```css
:root {
  --color-bg: #fafaf8;
  --color-surface: #ffffff;
  --color-border: #e0dad3;
  --color-text-primary: #1a1814;
  --color-text-secondary: #a89f97;
  --color-accent: #e8855a;
  --color-accent-light: #fff7f3;
  --color-success: #7dbf7d;
  --color-warning: #f5a623;
  --color-danger: #e84040;

  --radius-card: 12px;
  --radius-button: 14px;
  --radius-sheet: 20px;

  --tap-min-height: 56px;

  --font-system: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-system);
  background: var(--color-bg);
  color: var(--color-text-primary);
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input,
textarea {
  font-family: inherit;
}
```

- [ ] **Step 2: Verify tokens load**

```bash
npm run dev
```

Open browser, inspect `body` — should see `--color-accent: #E8855A` in computed styles.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add design tokens and CSS reset"
```

---

### Task 3: Utility Functions

**Files:**

- Create: `src/lib/utils.js`
- Create: `src/lib/utils.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  timeSince,
  formatDuration,
  dayOfLife,
  pumpExpiry,
  computePumpTotal,
} from "./utils";

describe("timeSince", () => {
  it("returns minutes when under an hour", () => {
    const past = new Date("2026-06-04T09:00:00");
    const now = new Date("2026-06-04T09:42:00");
    expect(timeSince(past, now)).toBe("42m");
  });

  it("returns hours and minutes when over an hour", () => {
    const past = new Date("2026-06-04T07:00:00");
    const now = new Date("2026-06-04T09:25:00");
    expect(timeSince(past, now)).toBe("2h 25m");
  });

  it("returns only hours when exactly on the hour", () => {
    const past = new Date("2026-06-04T07:00:00");
    const now = new Date("2026-06-04T09:00:00");
    expect(timeSince(past, now)).toBe("2h");
  });
});

describe("formatDuration", () => {
  it('formats 45 minutes as "45m"', () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it('formats 105 minutes as "1h 45m"', () => {
    expect(formatDuration(105)).toBe("1h 45m");
  });

  it('formats 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe("1h");
  });
});

describe("dayOfLife", () => {
  it("returns 1 on the birth date", () => {
    const dob = new Date("2026-08-13");
    expect(dayOfLife(dob, new Date("2026-08-13"))).toBe(1);
  });

  it("returns 14 after 13 days", () => {
    const dob = new Date("2026-08-13");
    expect(dayOfLife(dob, new Date("2026-08-26"))).toBe(14);
  });
});

describe("pumpExpiry", () => {
  it("returns 4 days later for fridge", () => {
    const label = new Date("2026-09-01");
    const expiry = pumpExpiry("fridge", label);
    expect(expiry).toEqual(new Date("2026-09-05"));
  });

  it("returns 6 months later for freezer", () => {
    const label = new Date("2026-09-01");
    const expiry = pumpExpiry("freezer", label);
    expect(expiry).toEqual(new Date("2027-03-01"));
  });

  it("returns null for feed_now", () => {
    expect(pumpExpiry("feed_now", new Date())).toBeNull();
  });
});

describe("computePumpTotal", () => {
  it("sums left and right", () => {
    expect(computePumpTotal(60, 40)).toBe(100);
  });

  it("treats null as 0", () => {
    expect(computePumpTotal(null, 75)).toBe(75);
    expect(computePumpTotal(50, null)).toBe(50);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/lib/utils.test.js
```

Expected: FAIL — `Cannot find module './utils'`

- [ ] **Step 3: Implement utils**

Create `src/lib/utils.js`:

```js
import {
  differenceInMinutes,
  differenceInDays,
  addDays,
  addMonths,
} from "date-fns";

export function timeSince(past, now = new Date()) {
  const totalMinutes = differenceInMinutes(now, past);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function dayOfLife(dob, today = new Date()) {
  return differenceInDays(today, dob) + 1;
}

export function pumpExpiry(storage, labelDate) {
  if (storage === "fridge") return addDays(labelDate, 4);
  if (storage === "freezer") return addMonths(labelDate, 6);
  return null;
}

export function computePumpTotal(left, right) {
  return (left ?? 0) + (right ?? 0);
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/lib/utils.test.js
```

Expected: PASS — 12 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/utils.test.js
git commit -m "feat: add utility functions with tests (timeSince, formatDuration, dayOfLife, pumpExpiry, computePumpTotal)"
```

---

### Task 4: Supabase Client + Database Schema

**Files:**

- Create: `src/lib/supabase.js`
- Create: `supabase/migrations/20260604000000_initial_schema.sql`

- [ ] **Step 1: Create Supabase client**

Create `src/lib/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create Supabase project**

1. Go to supabase.com → New Project
2. Name: `sophie-tracker`, region: Southeast Asia (Singapore)
3. Copy Project URL and anon key → paste into `.env.local`
4. In Supabase dashboard → SQL Editor

- [ ] **Step 3: Write and run migration SQL**

Create `supabase/migrations/20260604000000_initial_schema.sql` and paste into Supabase SQL Editor:

```sql
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

-- Log table policies (feeding, diaper, sleep, growth, pump)
-- Pattern: family can read, parent/owner can write

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
```

Run in Supabase SQL Editor. Expected: "Success. No rows returned."

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.js supabase/
git commit -m "feat: Supabase client + full Phase 1 schema with RLS policies"
```

---

### Task 5: Auth + Baby Context + Onboarding

**Files:**

- Create: `src/context/BabyContext.jsx`
- Create: `src/pages/Onboarding.jsx`
- Create: `src/context/BabyContext.test.jsx`

- [ ] **Step 1: Write failing test for auth helpers**

Create `src/context/BabyContext.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock supabase before imports
vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
  },
}));

import { BabyProvider, useBaby } from "./BabyContext";

function TestConsumer() {
  const { session, loading } = useBaby();
  if (loading) return <div>Loading...</div>;
  return <div>{session ? "logged-in" : "logged-out"}</div>;
}

describe("BabyContext", () => {
  it("shows loading initially then logged-out when no session", async () => {
    render(
      <BabyProvider>
        <TestConsumer />
      </BabyProvider>,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("logged-out")).toBeInTheDocument(),
    );
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/context/BabyContext.test.jsx
```

Expected: FAIL — `Cannot find module './BabyContext'`

- [ ] **Step 3: Implement BabyContext**

Create `src/context/BabyContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const BabyContext = createContext(null);

export function BabyProvider({ children }) {
  const [session, setSession] = useState(null);
  const [baby, setBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadBaby(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) loadBaby(session.user.id);
      else {
        setBaby(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadBaby(userId) {
    const { data } = await supabase
      .from("family_members")
      .select("babies(*)")
      .eq("user_id", userId)
      .not("accepted_at", "is", null)
      .order("invited_at", { ascending: true })
      .limit(1)
      .single();

    setBaby(data?.babies ?? null);
    setLoading(false);
  }

  async function sendMagicLink(email) {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <BabyContext.Provider
      value={{ session, baby, loading, setBaby, sendMagicLink, signOut }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const ctx = useContext(BabyContext);
  if (!ctx) throw new Error("useBaby must be used inside BabyProvider");
  return ctx;
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/context/BabyContext.test.jsx
```

Expected: PASS

- [ ] **Step 5: Create Onboarding page**

Create `src/pages/Onboarding.jsx`:

```jsx
import { useState } from "react";
import { useBaby } from "../context/BabyContext";
import { supabase } from "../lib/supabase";

export default function Onboarding() {
  const { sendMagicLink, baby, setBaby } = useBaby();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState("auth"); // 'auth' | 'profile'
  const [babyName, setBabyName] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSendLink(e) {
    e.preventDefault();
    const { error } = await sendMagicLink(email);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  async function handleCreateBaby(e) {
    e.preventDefault();
    if (!babyName.trim() || !dob) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: newBaby, error: babyErr } = await supabase
      .from("babies")
      .insert({
        name: babyName.trim(),
        date_of_birth: dob,
        created_by: user.id,
      })
      .select()
      .single();

    if (babyErr) {
      setError(babyErr.message);
      setSaving(false);
      return;
    }

    await supabase.from("family_members").insert({
      baby_id: newBaby.id,
      user_id: user.id,
      role: "owner",
      accepted_at: new Date().toISOString(),
    });

    setBaby(newBaby);
    setSaving(false);
  }

  if (step === "auth" && !sent) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: 400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Welcome
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Enter your email to get started.
        </p>
        <form onSubmit={handleSendLink}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: "100%",
              padding: "14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 16,
              marginBottom: 12,
            }}
          />
          {error && (
            <p style={{ color: "var(--color-danger)", marginBottom: 8 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "15px",
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-button)",
              fontSize: 16,
              fontWeight: 700,
              minHeight: "var(--tap-min-height)",
            }}
          >
            Send magic link
          </button>
        </form>
      </div>
    );
  }

  if (sent && !baby) {
    return (
      <div
        style={{
          padding: "32px 24px",
          maxWidth: 400,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Check your email ✉️
        </p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          We sent a magic link to <strong>{email}</strong>. Tap it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Create baby profile
      </h1>
      <form onSubmit={handleCreateBaby}>
        <label style={{ display: "block", marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Baby's name
          </span>
          <input
            type="text"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="Sophie"
            required
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              padding: "14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 16,
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 20 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Date of birth
          </span>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              padding: "14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 16,
            }}
          />
        </label>
        {error && (
          <p style={{ color: "var(--color-danger)", marginBottom: 8 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "15px",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-button)",
            fontSize: 16,
            fontWeight: 700,
            minHeight: "var(--tap-min-height)",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Create profile"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/context/ src/pages/Onboarding.jsx
git commit -m "feat: BabyContext with magic link auth + Onboarding flow"
```

---

### Task 6: BottomSheet Component

**Files:**

- Create: `src/components/BottomSheet.jsx`
- Create: `src/components/BottomSheet.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/BottomSheet.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BottomSheet from "./BottomSheet";

describe("BottomSheet", () => {
  it("renders children when open", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>,
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <p>Hidden content</p>
      </BottomSheet>,
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    );
    await userEvent.click(screen.getByTestId("sheet-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/BottomSheet.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement BottomSheet**

Create `src/components/BottomSheet.jsx`:

```jsx
import { useEffect } from "react";

export default function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div
        data-testid="sheet-backdrop"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(26,24,20,0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--color-bg)",
          borderRadius: "var(--radius-sheet) var(--radius-sheet) 0 0",
          animation: "slideUp 200ms ease-out",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <div
            style={{
              width: 36,
              height: 4,
              background: "var(--color-border)",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </div>
        {children}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/BottomSheet.test.jsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomSheet.jsx src/components/BottomSheet.test.jsx
git commit -m "feat: BottomSheet component with slide-up animation and backdrop"
```

---

### Task 7: Diaper Form

**Files:**

- Create: `src/lib/diaperConstants.js`
- Create: `src/components/forms/DiaperForm.jsx`
- Create: `src/components/forms/DiaperForm.test.jsx`

- [ ] **Step 1: Create constants**

Create `src/lib/diaperConstants.js`:

```js
export const DIAPER_COLORS = [
  {
    value: "yellow",
    label: "Yellow",
    hex: "#F5C842",
    note: "Normal",
    warning: null,
  },
  {
    value: "green",
    label: "Green",
    hex: "#6DB56D",
    note: "Transitional",
    warning: null,
  },
  {
    value: "brown",
    label: "Brown",
    hex: "#8B5E3C",
    note: "Formula",
    warning: null,
  },
  {
    value: "black",
    label: "Black",
    hex: "#2C2C2C",
    note: "Meconium",
    warning: null,
  },
  {
    value: "white",
    label: "White",
    hex: "#D4D0CC",
    note: "See PD",
    warning:
      "White or grey poo may indicate a liver or bile issue. If this persists, contact your PD.",
  },
  {
    value: "red",
    label: "Red",
    hex: "#E84040",
    note: "See PD",
    warning: "Red poo may contain blood. Contact your PD promptly.",
  },
];

export const CONSISTENCIES = ["seedy", "pasty", "liquid", "solid"];
```

- [ ] **Step 2: Write failing tests**

Create `src/components/forms/DiaperForm.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiaperForm from "./DiaperForm";

describe("DiaperForm", () => {
  it("renders type selector with Wet, Dirty, Both", () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Wet")).toBeInTheDocument();
    expect(screen.getByText("Dirty")).toBeInTheDocument();
    expect(screen.getByText("Both")).toBeInTheDocument();
  });

  it("shows colour picker and consistency when Dirty is selected", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Dirty"));
    expect(screen.getByText("Yellow")).toBeInTheDocument();
    expect(screen.getByText("Seedy")).toBeInTheDocument();
  });

  it("does not show colour picker when Wet is selected", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Wet"));
    expect(screen.queryByText("Yellow")).not.toBeInTheDocument();
  });

  it("shows PD warning when White is selected", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Dirty"));
    await userEvent.click(screen.getByText("White"));
    expect(screen.getByText(/liver or bile/)).toBeInTheDocument();
  });

  it("does not show PD warning for Yellow", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Dirty"));
    await userEvent.click(screen.getByText("Yellow"));
    expect(screen.queryByText(/liver or bile/)).not.toBeInTheDocument();
  });

  it("calls onSave with correct payload", async () => {
    const onSave = vi.fn();
    render(<DiaperForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Wet"));
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: "wet" }),
    );
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
npx vitest run src/components/forms/DiaperForm.test.jsx
```

Expected: FAIL

- [ ] **Step 4: Implement DiaperForm**

Create `src/components/forms/DiaperForm.jsx`:

```jsx
import { useState } from "react";
import { DIAPER_COLORS, CONSISTENCIES } from "../../lib/diaperConstants";
import { format } from "date-fns";

const TYPES = [
  { value: "wet", label: "Wet", emoji: "💧" },
  { value: "dirty", label: "Dirty", emoji: "💩" },
  { value: "both", label: "Both", emoji: "💧💩" },
];

export default function DiaperForm({ onSave, onCancel }) {
  const [type, setType] = useState("wet");
  const [color, setColor] = useState("yellow");
  const [consistency, setConsistency] = useState("seedy");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );

  const showExtras = type === "dirty" || type === "both";
  const selectedColor = DIAPER_COLORS.find((c) => c.value === color);

  function handleSave() {
    onSave({
      type,
      color: showExtras ? color : null,
      consistency: showExtras ? consistency : null,
      notes: notes.trim() || null,
      timestamp: new Date(timestamp).toISOString(),
    });
  }

  const btnBase = {
    padding: "12px 6px",
    borderRadius: "var(--radius-card)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "1.5px solid var(--color-border)",
    minHeight: "var(--tap-min-height)",
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 0 14px",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700 }}>💩 Diaper Log</span>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        />
      </div>

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        Type
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            style={{
              ...btnBase,
              background:
                type === t.value
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color: type === t.value ? "#fff" : "var(--color-text-primary)",
              borderColor:
                type === t.value
                  ? "var(--color-accent)"
                  : "var(--color-border)",
              textAlign: "center",
            }}
          >
            <div>{t.emoji}</div>
            <div style={{ fontSize: 10, marginTop: 3 }}>{t.label}</div>
          </button>
        ))}
      </div>

      {showExtras && (
        <>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #F0EBE6",
              margin: "0 0 14px",
            }}
          />

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Colour
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            {DIAPER_COLORS.map((c) => (
              <div
                key={c.value}
                style={{ textAlign: "center" }}
                onClick={() => setColor(c.value)}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: c.hex,
                    margin: "0 auto 4px",
                    cursor: "pointer",
                    border:
                      color === c.value
                        ? `3px solid var(--color-accent)`
                        : "2px solid transparent",
                    boxShadow:
                      color === c.value
                        ? "0 0 0 2px var(--color-accent-light)"
                        : "none",
                    position: "relative",
                  }}
                >
                  {c.warning && (
                    <div
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        width: 14,
                        height: 14,
                        background:
                          c.value === "red"
                            ? "var(--color-danger)"
                            : "var(--color-warning)",
                        borderRadius: "50%",
                        fontSize: 8,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      !
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: color === c.value ? "var(--color-accent)" : "#888",
                    fontWeight: color === c.value ? 600 : 400,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: c.warning
                      ? c.value === "red"
                        ? "var(--color-danger)"
                        : "var(--color-warning)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {c.note}
                </div>
              </div>
            ))}
          </div>

          {selectedColor?.warning && (
            <div
              style={{
                marginBottom: 14,
                background: "#FFF7EC",
                border: `1px solid var(--color-warning)`,
                borderRadius: 10,
                padding: "9px 11px",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span>⚠️</span>
              <p style={{ fontSize: 11, color: "#8B5E00", lineHeight: 1.45 }}>
                {selectedColor.warning}
              </p>
            </div>
          )}

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Consistency
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 6,
              marginBottom: 16,
            }}
          >
            {CONSISTENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setConsistency(c)}
                style={{
                  ...btnBase,
                  padding: "10px 2px",
                  fontSize: 11,
                  background:
                    consistency === c
                      ? "var(--color-accent)"
                      : "var(--color-surface)",
                  color: consistency === c ? "#fff" : "#888",
                  borderColor:
                    consistency === c
                      ? "var(--color-accent)"
                      : "var(--color-border)",
                }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 7,
        }}
      >
        Notes{" "}
        <span style={{ textTransform: "none", fontSize: 10, fontWeight: 400 }}>
          (optional)
        </span>
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a note..."
        rows={2}
        style={{
          width: "100%",
          padding: 11,
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          fontSize: 13,
          resize: "none",
          color: "var(--color-text-primary)",
          marginBottom: 16,
        }}
      />

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: 15,
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-button)",
          fontSize: 15,
          fontWeight: 700,
          minHeight: "var(--tap-min-height)",
        }}
      >
        Save Diaper Log
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx vitest run src/components/forms/DiaperForm.test.jsx
```

Expected: PASS — 6 tests passing

- [ ] **Step 6: Commit**

```bash
git add src/lib/diaperConstants.js src/components/forms/DiaperForm.jsx src/components/forms/DiaperForm.test.jsx
git commit -m "feat: DiaperForm with colour swatch picker and inline PD warnings"
```

---

### Task 8: Sleep Form

**Files:**

- Create: `src/components/forms/SleepForm.jsx`
- Create: `src/components/forms/SleepForm.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/forms/SleepForm.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SleepForm from "./SleepForm";

describe("SleepForm", () => {
  it("renders start and end time fields", () => {
    render(<SleepForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
  });

  it('renders "Still sleeping" button', () => {
    render(<SleepForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /still sleeping/i }),
    ).toBeInTheDocument();
  });

  it("calls onSave with null end_time when Still Sleeping tapped", async () => {
    const onSave = vi.fn();
    render(<SleepForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(
      screen.getByRole("button", { name: /still sleeping/i }),
    );
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ end_time: null }),
    );
  });

  it("calls onSave with both times when Save is tapped", async () => {
    const onSave = vi.fn();
    render(<SleepForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /^save sleep/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        start_time: expect.any(String),
        end_time: expect.any(String),
      }),
    );
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/forms/SleepForm.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement SleepForm**

Create `src/components/forms/SleepForm.jsx`:

```jsx
import { useState } from "react";
import { format, subMinutes } from "date-fns";

export default function SleepForm({ onSave, onCancel }) {
  const now = new Date();
  const [startTime, setStartTime] = useState(
    format(subMinutes(now, 30), "yyyy-MM-dd'T'HH:mm"),
  );
  const [endTime, setEndTime] = useState(format(now, "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState("");

  function buildPayload(endTimeIso) {
    const start = new Date(startTime);
    const end = endTimeIso ? new Date(endTimeIso) : null;
    const duration = end ? Math.round((end - start) / 60000) : null;
    return {
      start_time: start.toISOString(),
      end_time: end ? end.toISOString() : null,
      duration_minutes: duration,
      notes: notes.trim() || null,
    };
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "14px",
    border: "1.5px solid var(--color-border)",
    borderRadius: "var(--radius-card)",
    fontSize: 15,
    marginTop: 6,
    color: "var(--color-text-primary)",
  };
  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
  const btnBase = {
    width: "100%",
    padding: 15,
    border: "none",
    borderRadius: "var(--radius-button)",
    fontSize: 15,
    fontWeight: 700,
    minHeight: "var(--tap-min-height)",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "6px 0 14px", fontSize: 17, fontWeight: 700 }}>
        😴 Sleep Log
      </div>

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={labelStyle}>Start time</span>
        <input
          aria-label="Start time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={labelStyle}>End time</span>
        <input
          aria-label="End time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={labelStyle}>
          Notes{" "}
          <span
            style={{ textTransform: "none", fontSize: 10, fontWeight: 400 }}
          >
            (optional)
          </span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />
      </label>

      <button
        onClick={() => onSave(buildPayload(null))}
        style={{
          ...btnBase,
          background: "var(--color-surface)",
          color: "var(--color-accent)",
          border: "1.5px solid var(--color-accent)",
          marginBottom: 10,
        }}
      >
        Still sleeping (start timer)
      </button>

      <button
        onClick={() => onSave(buildPayload(endTime))}
        style={{ ...btnBase, background: "var(--color-accent)", color: "#fff" }}
      >
        Save sleep log
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/forms/SleepForm.test.jsx
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/SleepForm.jsx src/components/forms/SleepForm.test.jsx
git commit -m "feat: SleepForm with Still Sleeping timer handoff"
```

---

### Task 9: Feeding Form + Growth Form

**Files:**

- Create: `src/components/forms/FeedingForm.jsx`
- Create: `src/components/forms/GrowthForm.jsx`
- Create: `src/components/forms/FeedingForm.test.jsx`
- Create: `src/components/forms/GrowthForm.test.jsx`

- [ ] **Step 1: Write failing tests for FeedingForm**

Create `src/components/forms/FeedingForm.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedingForm from "./FeedingForm";

describe("FeedingForm", () => {
  it("renders Breast and Bottle type selectors", () => {
    render(<FeedingForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Breast")).toBeInTheDocument();
    expect(screen.getByText("Bottle")).toBeInTheDocument();
  });

  it("shows side selector when Breast is selected", async () => {
    render(<FeedingForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Breast"));
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(screen.getByText("Both")).toBeInTheDocument();
  });

  it("shows ml input when Bottle is selected", async () => {
    render(<FeedingForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Bottle"));
    expect(screen.getByPlaceholderText(/ml/i)).toBeInTheDocument();
  });

  it("calls onSave with bottle payload", async () => {
    const onSave = vi.fn();
    render(<FeedingForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Bottle"));
    await userEvent.type(screen.getByPlaceholderText(/ml/i), "90");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: "bottle", amount_ml: 90 }),
    );
  });
});
```

- [ ] **Step 2: Write failing tests for GrowthForm**

Create `src/components/forms/GrowthForm.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GrowthForm from "./GrowthForm";

describe("GrowthForm", () => {
  it("renders weight, height, and head fields", () => {
    render(<GrowthForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText(/weight/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/height/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/head/i)).toBeInTheDocument();
  });

  it("calls onSave with numeric values", async () => {
    const onSave = vi.fn();
    render(<GrowthForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/weight/i), "3.8");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ weight_kg: 3.8 }),
    );
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
npx vitest run src/components/forms/FeedingForm.test.jsx src/components/forms/GrowthForm.test.jsx
```

Expected: FAIL

- [ ] **Step 4: Implement FeedingForm**

Create `src/components/forms/FeedingForm.jsx`:

```jsx
import { useState } from "react";
import { format } from "date-fns";

const SIDES = ["left", "right", "both"];

export default function FeedingForm({ onSave, onCancel }) {
  const [type, setType] = useState("breast");
  const [side, setSide] = useState("left");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [amountMl, setAmountMl] = useState("");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );

  function handleSave() {
    onSave({
      type,
      side: type === "breast" ? side : null,
      duration_minutes:
        type === "breast" && durationMinutes ? parseInt(durationMinutes) : null,
      amount_ml: type === "bottle" && amountMl ? parseInt(amountMl) : null,
      notes: notes.trim() || null,
      timestamp: new Date(timestamp).toISOString(),
    });
  }

  const btnBase = {
    padding: "13px 16px",
    borderRadius: "var(--radius-card)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "var(--tap-min-height)",
  };
  const inputStyle = {
    width: "100%",
    padding: "14px",
    border: "1.5px solid var(--color-border)",
    borderRadius: "var(--radius-card)",
    fontSize: 15,
    color: "var(--color-text-primary)",
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 0 14px",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700 }}>🍼 Feeding Log</span>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        />
      </div>

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        Type
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {["breast", "bottle"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              ...btnBase,
              background:
                type === t ? "var(--color-accent)" : "var(--color-surface)",
              color: type === t ? "#fff" : "var(--color-text-primary)",
              border: `1.5px solid ${type === t ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            {t === "breast" ? "🤱 Breast" : "🍼 Bottle"}
          </button>
        ))}
      </div>

      {type === "breast" && (
        <>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Side
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {SIDES.map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                style={{
                  ...btnBase,
                  padding: "13px 4px",
                  background:
                    side === s ? "var(--color-accent)" : "var(--color-surface)",
                  color: side === s ? "#fff" : "var(--color-text-primary)",
                  border: `1.5px solid ${side === s ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <label style={{ display: "block", marginBottom: 16 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 7,
              }}
            >
              Duration (minutes, optional)
            </p>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="e.g. 15"
              style={inputStyle}
            />
          </label>
        </>
      )}

      {type === "bottle" && (
        <label style={{ display: "block", marginBottom: 16 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 7,
            }}
          >
            Amount (ml)
          </p>
          <input
            type="number"
            value={amountMl}
            onChange={(e) => setAmountMl(e.target.value)}
            placeholder="e.g. 90 ml"
            style={inputStyle}
          />
        </label>
      )}

      <label style={{ display: "block", marginBottom: 16 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 7,
          }}
        >
          Notes (optional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />
      </label>

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: 15,
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-button)",
          fontSize: 15,
          fontWeight: 700,
          minHeight: "var(--tap-min-height)",
          cursor: "pointer",
        }}
      >
        Save Feeding Log
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Implement GrowthForm**

Create `src/components/forms/GrowthForm.jsx`:

```jsx
import { useState } from "react";
import { format } from "date-fns";

export default function GrowthForm({ onSave, onCancel }) {
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  const [notes, setNotes] = useState("");
  const [measuredAt, setMeasuredAt] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );

  function handleSave() {
    onSave({
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      head_cm: headCm ? parseFloat(headCm) : null,
      notes: notes.trim() || null,
      measured_at: new Date(measuredAt).toISOString(),
    });
  }

  const inputStyle = {
    width: "100%",
    padding: "14px",
    border: "1.5px solid var(--color-border)",
    borderRadius: "var(--radius-card)",
    fontSize: 15,
    color: "var(--color-text-primary)",
  };

  const fields = [
    {
      label: "Weight (kg)",
      placeholder: "Weight e.g. 3.8",
      value: weightKg,
      onChange: setWeightKg,
      step: "0.001",
    },
    {
      label: "Height (cm)",
      placeholder: "Height e.g. 52",
      value: heightCm,
      onChange: setHeightCm,
      step: "0.1",
    },
    {
      label: "Head circumference (cm)",
      placeholder: "Head e.g. 35",
      value: headCm,
      onChange: setHeadCm,
      step: "0.1",
    },
  ];

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 0 14px",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700 }}>📏 Growth Log</span>
        <input
          type="datetime-local"
          value={measuredAt}
          onChange={(e) => setMeasuredAt(e.target.value)}
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        />
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          marginBottom: 16,
        }}
      >
        All fields optional — log what you have.
      </p>
      {fields.map((f) => (
        <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 7,
            }}
          >
            {f.label}
          </p>
          <input
            type="number"
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            step={f.step}
            style={inputStyle}
          />
        </label>
      ))}
      <label style={{ display: "block", marginBottom: 16 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 7,
          }}
        >
          Notes (optional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />
      </label>
      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: 15,
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-button)",
          fontSize: 15,
          fontWeight: 700,
          minHeight: "var(--tap-min-height)",
          cursor: "pointer",
        }}
      >
        Save Growth Log
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Run all tests — verify they pass**

```bash
npx vitest run src/components/forms/FeedingForm.test.jsx src/components/forms/GrowthForm.test.jsx
```

Expected: PASS — 6 tests passing

- [ ] **Step 7: Commit**

```bash
git add src/components/forms/FeedingForm.jsx src/components/forms/GrowthForm.jsx src/components/forms/FeedingForm.test.jsx src/components/forms/GrowthForm.test.jsx
git commit -m "feat: FeedingForm (breast/bottle) and GrowthForm with tests"
```

---

### Task 10: Pump Form

**Files:**

- Create: `src/components/forms/PumpForm.jsx`
- Create: `src/components/forms/PumpForm.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/forms/PumpForm.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PumpForm from "./PumpForm";

describe("PumpForm", () => {
  it("renders left and right volume fields", () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/left/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/right/i)).toBeInTheDocument();
  });

  it("auto-computes total from left and right", async () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/left/i), "60");
    await userEvent.type(screen.getByLabelText(/right/i), "40");
    expect(screen.getByText("100 ml total")).toBeInTheDocument();
  });

  it("shows expiry for fridge storage", async () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Fridge"));
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });

  it("shows no expiry for Feed Now", async () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Feed Now"));
    expect(screen.queryByText(/expires/i)).not.toBeInTheDocument();
  });

  it("calls onSave with computed total", async () => {
    const onSave = vi.fn();
    render(<PumpForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/left/i), "60");
    await userEvent.type(screen.getByLabelText(/right/i), "40");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        volume_left_ml: 60,
        volume_right_ml: 40,
        volume_total_ml: 100,
      }),
    );
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/forms/PumpForm.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement PumpForm**

Create `src/components/forms/PumpForm.jsx`:

```jsx
import { useState } from "react";
import { format } from "date-fns";
import { pumpExpiry, computePumpTotal } from "../../lib/utils";

const STORAGE_OPTIONS = [
  { value: "feed_now", label: "Feed Now", emoji: "🍼" },
  { value: "fridge", label: "Fridge", emoji: "❄️" },
  { value: "freezer", label: "Freezer", emoji: "🧊" },
];

export default function PumpForm({ onSave, onCancel }) {
  const [leftMl, setLeftMl] = useState("");
  const [rightMl, setRightMl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [storage, setStorage] = useState("feed_now");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );

  const total = computePumpTotal(
    leftMl ? parseInt(leftMl) : null,
    rightMl ? parseInt(rightMl) : null,
  );
  const labelDate = new Date();
  const expiry = pumpExpiry(storage, labelDate);

  function handleSave() {
    onSave({
      volume_left_ml: leftMl ? parseInt(leftMl) : null,
      volume_right_ml: rightMl ? parseInt(rightMl) : null,
      volume_total_ml: total,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      storage,
      label_date:
        storage !== "feed_now" ? format(labelDate, "yyyy-MM-dd") : null,
      notes: notes.trim() || null,
      timestamp: new Date(timestamp).toISOString(),
    });
  }

  const inputStyle = {
    width: "100%",
    padding: "14px",
    border: "1.5px solid var(--color-border)",
    borderRadius: "var(--radius-card)",
    fontSize: 15,
    color: "var(--color-text-primary)",
  };
  const btnBase = {
    flex: 1,
    padding: "13px 6px",
    borderRadius: "var(--radius-card)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "var(--tap-min-height)",
    textAlign: "center",
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 0 14px",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700 }}>🥛 Pump Log</span>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 7,
            }}
          >
            Left (ml)
          </p>
          <input
            aria-label="Left ml"
            type="number"
            value={leftMl}
            onChange={(e) => setLeftMl(e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
        </label>
        <label>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 7,
            }}
          >
            Right (ml)
          </p>
          <input
            aria-label="Right ml"
            type="number"
            value={rightMl}
            onChange={(e) => setRightMl(e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
        </label>
      </div>

      {total > 0 && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-accent)",
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          {total} ml total
        </p>
      )}

      <label style={{ display: "block", marginBottom: 16 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 7,
          }}
        >
          Duration (minutes, optional)
        </p>
        <input
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g. 20"
          style={inputStyle}
        />
      </label>

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        Storage
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {STORAGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStorage(opt.value)}
            style={{
              ...btnBase,
              background:
                storage === opt.value
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color:
                storage === opt.value ? "#fff" : "var(--color-text-primary)",
              border: `1.5px solid ${storage === opt.value ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            <div>{opt.emoji}</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>{opt.label}</div>
          </button>
        ))}
      </div>

      {expiry && (
        <div
          style={{
            marginBottom: 16,
            padding: "9px 12px",
            background: "var(--color-accent-light)",
            border: "1px solid #F5D5C5",
            borderRadius: 10,
            fontSize: 12,
            color: "#7A4030",
          }}
        >
          Expires {format(expiry, "dd MMM yyyy")} · Labelled{" "}
          {format(labelDate, "dd MMM")}
        </div>
      )}

      <label style={{ display: "block", marginBottom: 16 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 7,
          }}
        >
          Notes (optional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />
      </label>

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: 15,
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-button)",
          fontSize: 15,
          fontWeight: 700,
          minHeight: "var(--tap-min-height)",
          cursor: "pointer",
        }}
      >
        Save Pump Log
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/forms/PumpForm.test.jsx
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/PumpForm.jsx src/components/forms/PumpForm.test.jsx
git commit -m "feat: PumpForm with auto-total, expiry labels, and fridge/freezer storage"
```

---

### Task 11: LogSheet — Category Picker + Dispatcher

**Files:**

- Create: `src/components/LogSheet.jsx`
- Create: `src/components/LogSheet.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/LogSheet.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogSheet from "./LogSheet";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
      select: vi.fn().mockReturnThis(),
    }),
  },
}));

describe("LogSheet", () => {
  it("shows category picker when open with no preselected category", () => {
    render(
      <LogSheet
        open
        babyId="baby-1"
        category={null}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText("Feeding")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Pump")).toBeInTheDocument();
  });

  it('shows FeedingForm directly when category="feeding"', () => {
    render(
      <LogSheet
        open
        babyId="baby-1"
        category="feeding"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText("Breast")).toBeInTheDocument();
    expect(screen.getByText("Bottle")).toBeInTheDocument();
  });

  it('shows DiaperForm directly when category="diaper"', () => {
    render(
      <LogSheet
        open
        babyId="baby-1"
        category="diaper"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText("Wet")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/LogSheet.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement LogSheet**

Create `src/components/LogSheet.jsx`:

```jsx
import { useState } from "react";
import BottomSheet from "./BottomSheet";
import FeedingForm from "./forms/FeedingForm";
import DiaperForm from "./forms/DiaperForm";
import SleepForm from "./forms/SleepForm";
import GrowthForm from "./forms/GrowthForm";
import PumpForm from "./forms/PumpForm";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  { value: "feeding", label: "Feeding", emoji: "🍼" },
  { value: "diaper", label: "Diaper", emoji: "💩" },
  { value: "sleep", label: "Sleep", emoji: "😴" },
  { value: "growth", label: "Growth", emoji: "📏" },
  { value: "pump", label: "Pump", emoji: "🥛" },
];

const TABLE_MAP = {
  feeding: "feeding_logs",
  diaper: "diaper_logs",
  sleep: "sleep_logs",
  growth: "growth_logs",
  pump: "pump_logs",
};

export default function LogSheet({
  open,
  babyId,
  category: initialCategory,
  onClose,
  onSaved,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(payload) {
    setSaving(true);
    setError(null);
    const table = TABLE_MAP[activeCategory];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: dbErr } = await supabase
      .from(table)
      .insert({ ...payload, baby_id: babyId, logged_by: user.id });
    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved?.({ category: activeCategory, ...payload });
    onClose();
    setActiveCategory(initialCategory);
  }

  function handleClose() {
    onClose();
    setActiveCategory(initialCategory);
  }

  const formProps = { onSave: handleSave, onCancel: handleClose };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {saving && (
        <div
          style={{
            textAlign: "center",
            padding: 16,
            color: "var(--color-text-secondary)",
          }}
        >
          Saving...
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "8px 16px",
            color: "var(--color-danger)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {!activeCategory && (
        <div style={{ padding: "0 16px 24px" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "6px 0 14px",
            }}
          >
            Log
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  padding: 16,
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  minHeight: "var(--tap-min-height)",
                  color: "var(--color-text-primary)",
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCategory === "feeding" && <FeedingForm {...formProps} />}
      {activeCategory === "diaper" && <DiaperForm {...formProps} />}
      {activeCategory === "sleep" && <SleepForm {...formProps} />}
      {activeCategory === "growth" && <GrowthForm {...formProps} />}
      {activeCategory === "pump" && <PumpForm {...formProps} />}
    </BottomSheet>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/LogSheet.test.jsx
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Run full test suite to verify no regressions**

```bash
npx vitest run
```

Expected: All tests passing (Task 3–11 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/LogSheet.jsx src/components/LogSheet.test.jsx
git commit -m "feat: LogSheet dispatcher with category picker and Supabase persistence"
```

---

**End of Part 1.** Continue with [Part 2: Views, Navigation, Family & PWA](./2026-06-04-phase1-part2-views.md) which covers Shell navigation, Home page, History page, PumpLog screen, Family invite flow, and PWA manifest.
