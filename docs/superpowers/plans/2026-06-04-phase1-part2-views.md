# Baby Tracker Phase 1 — Part 2: Views, Navigation, Family & PWA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the 5-tab navigation shell, build the Home, History, and PumpLog screens with real-time data, implement the Family invite flow, and ship the app as an installable PWA.

**Architecture:** React Router v6 for navigation. Supabase Realtime subscriptions for live data. CSS custom properties throughout — no additional styling libraries. Shell component wraps all tabs with the FAB and bottom nav bar.

**Tech Stack:** React 18, React Router v6, @supabase/supabase-js Realtime, Vite PWA plugin (already configured in Part 1)

**Prerequisite:** All tasks in Part 1 must be complete before starting Part 2.

---

### Task 12: Navigation Shell

**Files:**

- Create: `src/components/Shell.jsx`
- Create: `src/components/Shell.test.jsx`
- Modify: `src/main.jsx` (wrap app in providers + router)
- Modify: `src/App.jsx` (route definitions)

- [ ] **Step 1: Write failing tests for Shell**

Create `src/components/Shell.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Shell from "./Shell";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      select: vi.fn().mockReturnThis(),
    }),
  },
}));

describe("Shell", () => {
  function renderShell(path = "/") {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Shell babyId="baby-1" />
      </MemoryRouter>,
    );
  }

  it("renders bottom nav with 5 items", () => {
    renderShell();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders FAB + button", () => {
    renderShell();
    expect(screen.getByRole("button", { name: /log/i })).toBeInTheDocument();
  });

  it("opens LogSheet when FAB is tapped", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: /log/i }));
    expect(screen.getByText("Feeding")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/components/Shell.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement Shell**

Create `src/components/Shell.jsx`:

```jsx
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import LogSheet from "./LogSheet";

const NAV_ITEMS = [
  { to: "/", label: "Home", emoji: "🏠" },
  { to: "/history", label: "History", emoji: "📋" },
  { to: "/health", label: "Health", emoji: "❤️" },
  { to: "/more", label: "More", emoji: "⋯" },
];

export default function Shell({ babyId }) {
  const [logOpen, setLogOpen] = useState(false);
  const [logCategory, setLogCategory] = useState(null);

  function openLog(category = null) {
    setLogCategory(category);
    setLogOpen(true);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "var(--color-bg)",
      }}
    >
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        <Outlet context={{ babyId, openLog }} />
      </main>

      {/* Bottom navigation */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "flex-end",
          padding: "8px 0 12px",
          zIndex: 50,
        }}
      >
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.to} item={item} />
        ))}

        {/* FAB */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <button
            aria-label="Log"
            onClick={() => openLog(null)}
            style={{
              width: 52,
              height: 52,
              background: "var(--color-accent)",
              border: "none",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 300,
              margin: "0 auto",
              marginTop: -16,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(232,133,90,0.35)",
            }}
          >
            +
          </button>
          <div
            style={{
              fontSize: 10,
              color: "var(--color-text-secondary)",
              marginTop: 4,
            }}
          >
            Log
          </div>
        </div>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      <LogSheet
        open={logOpen}
        babyId={babyId}
        category={logCategory}
        onClose={() => setLogOpen(false)}
        onSaved={() => setLogOpen(false)}
      />
    </div>
  );
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      style={({ isActive }) => ({
        flex: 1,
        textAlign: "center",
        textDecoration: "none",
        color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
      })}
    >
      <div style={{ fontSize: 18 }}>{item.emoji}</div>
      <div style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</div>
    </NavLink>
  );
}
```

- [ ] **Step 4: Wire up App.jsx and main.jsx**

Replace `src/App.jsx`:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useBaby } from "./context/BabyContext";
import Shell from "./components/Shell";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import History from "./pages/History";
import Health from "./pages/Health";
import More from "./pages/More";

export default function App() {
  const { session, baby, loading } = useBaby();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          color: "var(--color-text-secondary)",
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session || !baby) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route path="/" element={<Shell babyId={baby.id} />}>
        <Route index element={<Home />} />
        <Route path="history" element={<History />} />
        <Route path="health" element={<Health />} />
        <Route path="more/*" element={<More />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
```

Replace `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { BabyProvider } from "./context/BabyContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BabyProvider>
        <App />
      </BabyProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Create placeholder pages to avoid import errors**

Create `src/pages/Health.jsx`:

```jsx
export default function Health() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Health</h2>
      <p style={{ color: "var(--color-text-secondary)" }}>Coming in Phase 2.</p>
    </div>
  );
}
```

Create `src/pages/More.jsx`:

```jsx
import { Routes, Route } from "react-router-dom";
import PumpLog from "./PumpLog";

export default function More() {
  return (
    <Routes>
      <Route index element={<MoreMenu />} />
      <Route path="pump" element={<PumpLog />} />
    </Routes>
  );
}

function MoreMenu() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>More</h2>
      <a
        href="/more/pump"
        style={{
          display: "block",
          padding: "16px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          textDecoration: "none",
          color: "var(--color-text-primary)",
          marginBottom: 10,
        }}
      >
        🥛 Pump Log &amp; Milk Stash
      </a>
    </div>
  );
}
```

Create `src/pages/PumpLog.jsx` (placeholder — full implementation in Task 16):

```jsx
export default function PumpLog() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Pump Log</h2>
    </div>
  );
}
```

- [ ] **Step 6: Run Shell tests — verify they pass**

```bash
npx vitest run src/components/Shell.test.jsx
```

Expected: PASS — 3 tests passing

- [ ] **Step 7: Run dev server and verify navigation works**

```bash
npm run dev
```

Open `http://localhost:5173` in browser. Expected: Onboarding screen (no session). After logging in, shell with bottom nav renders. Tapping FAB opens LogSheet.

- [ ] **Step 8: Commit**

```bash
git add src/components/Shell.jsx src/components/Shell.test.jsx src/App.jsx src/main.jsx src/pages/Health.jsx src/pages/More.jsx src/pages/PumpLog.jsx
git commit -m "feat: 5-tab navigation shell with FAB and React Router"
```

---

### Task 13: Real-time Logs Hook

**Files:**

- Create: `src/hooks/useRealtimeLogs.js`
- Create: `src/hooks/useRealtimeLogs.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useRealtimeLogs.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRealtimeLogs } from "./useRealtimeLogs";

const mockRows = [
  {
    id: "1",
    baby_id: "b1",
    timestamp: "2026-08-14T09:00:00Z",
    type: "wet",
    category: "diaper",
  },
  {
    id: "2",
    baby_id: "b1",
    timestamp: "2026-08-14T08:00:00Z",
    type: "bottle",
    category: "feeding",
  },
];

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
  },
}));

describe("useRealtimeLogs", () => {
  it("returns logs and loading state", async () => {
    const { result } = renderHook(() => useRealtimeLogs("b1", 50));
    expect(result.current.loading).toBe(true);
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toHaveLength(2);
  });

  it("returns empty logs when babyId is null", async () => {
    const { result } = renderHook(() => useRealtimeLogs(null, 50));
    await act(async () => {});
    expect(result.current.logs).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/hooks/useRealtimeLogs.test.js
```

Expected: FAIL

- [ ] **Step 3: Implement useRealtimeLogs**

Create `src/hooks/useRealtimeLogs.js`:

```js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const TABLES = [
  { table: "feeding_logs", category: "feeding", timeField: "timestamp" },
  { table: "diaper_logs", category: "diaper", timeField: "timestamp" },
  { table: "sleep_logs", category: "sleep", timeField: "start_time" },
  { table: "growth_logs", category: "growth", timeField: "measured_at" },
  { table: "pump_logs", category: "pump", timeField: "timestamp" },
];

export function useRealtimeLogs(babyId, limit = 100) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!babyId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const results = await Promise.all(
      TABLES.map(({ table, category, timeField }) =>
        supabase
          .from(table)
          .select("*")
          .eq("baby_id", babyId)
          .order(timeField, { ascending: false })
          .limit(limit)
          .then(({ data }) =>
            (data ?? []).map((row) => ({
              ...row,
              category,
              sortTime: row[timeField],
            })),
          ),
      ),
    );

    const merged = results
      .flat()
      .sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));

    setLogs(merged);
    setLoading(false);
  }, [babyId, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!babyId) return;

    const channels = TABLES.map(({ table }) =>
      supabase
        .channel(`${table}:${babyId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter: `baby_id=eq.${babyId}`,
          },
          fetchLogs,
        )
        .subscribe(),
    );

    return () => channels.forEach((ch) => supabase.removeChannel(ch));
  }, [babyId, fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/hooks/useRealtimeLogs.test.js
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRealtimeLogs.js src/hooks/useRealtimeLogs.test.js
git commit -m "feat: useRealtimeLogs hook with multi-table Supabase Realtime subscription"
```

---

### Task 14: Home Page

**Files:**

- Create: `src/pages/Home.jsx`
- Create: `src/pages/Home.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/pages/Home.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

vi.mock("../hooks/useRealtimeLogs", () => ({
  useRealtimeLogs: vi.fn().mockReturnValue({
    logs: [
      {
        id: "1",
        category: "feeding",
        type: "bottle",
        amount_ml: 90,
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: "2",
        category: "diaper",
        type: "wet",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ],
    loading: false,
  }),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  it("shows baby name and day of life", () => {
    renderHome();
    expect(screen.getByText(/Sophie/)).toBeInTheDocument();
    expect(screen.getByText(/Day \d+/)).toBeInTheDocument();
  });

  it("shows the three status cards", () => {
    renderHome();
    expect(screen.getByText("Fed")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText(/Awake|Sleeping/)).toBeInTheDocument();
  });

  it("shows quick log buttons", () => {
    renderHome();
    expect(screen.getByText("🍼 Feeding")).toBeInTheDocument();
    expect(screen.getByText("💧 Diaper")).toBeInTheDocument();
    expect(screen.getByText("😴 Sleep")).toBeInTheDocument();
    expect(screen.getByText("📏 Growth")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/pages/Home.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement Home page**

Create `src/pages/Home.jsx`:

```jsx
import { useOutletContext } from "react-router-dom";
import { useBaby } from "../context/BabyContext";
import { useRealtimeLogs } from "../hooks/useRealtimeLogs";
import { timeSince, dayOfLife } from "../lib/utils";

const QUICK_LOG_BUTTONS = [
  { category: "feeding", label: "🍼 Feeding" },
  { category: "diaper", label: "💧 Diaper" },
  { category: "sleep", label: "😴 Sleep" },
  { category: "growth", label: "📏 Growth" },
];

export default function Home() {
  const { baby } = useBaby();
  const { openLog } = useOutletContext() ?? {};
  const { logs } = useRealtimeLogs(baby?.id, 50);

  const lastFeed = logs.find((l) => l.category === "feeding");
  const lastDiaper = logs.find((l) => l.category === "diaper");
  const activeSleep = logs.find((l) => l.category === "sleep" && !l.end_time);
  const lastSleep = logs.find((l) => l.category === "sleep" && l.end_time);

  const dob = baby ? new Date(baby.date_of_birth) : null;

  return (
    <div style={{ padding: "16px", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            Today
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {baby?.name} · Day {dob ? dayOfLife(dob) : "—"}
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#F5EDE8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          👶
        </div>
      </div>

      {/* Status cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <StatusCard
          emoji="🍼"
          label="Fed"
          value={lastFeed ? timeSince(new Date(lastFeed.timestamp)) : "—"}
          sub={lastFeed ? "ago" : ""}
          urgent={
            lastFeed && Date.now() - new Date(lastFeed.timestamp) > 3 * 3600000
          }
        />
        <StatusCard
          emoji="💧"
          label="Diaper"
          value={lastDiaper ? timeSince(new Date(lastDiaper.timestamp)) : "—"}
          sub={lastDiaper ? "ago" : ""}
          urgent={
            lastDiaper &&
            Date.now() - new Date(lastDiaper.timestamp) > 4 * 3600000
          }
        />
        {activeSleep ? (
          <StatusCard
            emoji="😴"
            label="Sleeping"
            value={timeSince(new Date(activeSleep.start_time))}
            sub="since"
          />
        ) : (
          <StatusCard
            emoji="☀️"
            label="Awake"
            value={lastSleep ? timeSince(new Date(lastSleep.end_time)) : "—"}
            sub={lastSleep ? "since" : ""}
          />
        )}
      </div>

      {/* Quick log */}
      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        Quick Log
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {QUICK_LOG_BUTTONS.map((btn) => (
          <button
            key={btn.category}
            onClick={() => openLog?.(btn.category)}
            style={{
              padding: 14,
              background:
                btn.category === "feeding"
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color:
                btn.category === "feeding"
                  ? "#fff"
                  : "var(--color-text-primary)",
              border:
                btn.category === "feeding"
                  ? "none"
                  : "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 15,
              fontWeight: 600,
              textAlign: "left",
              cursor: "pointer",
              minHeight: "var(--tap-min-height)",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* AI nudge placeholder */}
      <div
        style={{
          background: "var(--color-accent-light)",
          border: "1px solid #F5D5C5",
          borderRadius: "var(--radius-card)",
          padding: 12,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 16 }}>✨</span>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#C06030",
              marginBottom: 2,
            }}
          >
            AI Insights
          </div>
          <div style={{ fontSize: 12, color: "#7A4030", lineHeight: 1.4 }}>
            Insights will appear here once there's enough data (Phase 4).
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ emoji, label, value, sub, urgent }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${urgent ? "var(--color-warning)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-card)",
        padding: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: urgent ? "var(--color-warning)" : "var(--color-text-primary)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
        {sub}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/pages/Home.test.jsx
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Open browser and verify home renders correctly**

```bash
npm run dev
```

Open `http://localhost:5173`. After auth: home screen shows baby name, status cards, quick log buttons, and AI nudge placeholder. Tapping a quick log button opens the correct form in the bottom sheet.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.test.jsx
git commit -m "feat: Home page with status cards, quick log buttons, and real-time data"
```

---

### Task 15: History Page

**Files:**

- Create: `src/pages/History.jsx`
- Create: `src/pages/History.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/pages/History.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import History from "./History";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

const now = new Date();
const mockLogs = [
  {
    id: "1",
    category: "feeding",
    type: "bottle",
    amount_ml: 90,
    timestamp: now.toISOString(),
    sortTime: now.toISOString(),
    logged_by: "u1",
  },
  {
    id: "2",
    category: "diaper",
    type: "wet",
    timestamp: now.toISOString(),
    sortTime: now.toISOString(),
    logged_by: "u1",
  },
  {
    id: "3",
    category: "sleep",
    start_time: now.toISOString(),
    end_time: now.toISOString(),
    duration_minutes: 90,
    sortTime: now.toISOString(),
    logged_by: "u1",
  },
];

vi.mock("../hooks/useRealtimeLogs", () => ({
  useRealtimeLogs: vi.fn().mockReturnValue({ logs: mockLogs, loading: false }),
}));

function renderHistory() {
  return render(
    <MemoryRouter>
      <History />
    </MemoryRouter>,
  );
}

describe("History", () => {
  it("renders filter chips", () => {
    renderHistory();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("🍼 Feed")).toBeInTheDocument();
    expect(screen.getByText("💧 Diaper")).toBeInTheDocument();
    expect(screen.getByText("😴 Sleep")).toBeInTheDocument();
  });

  it("shows all logs by default", () => {
    renderHistory();
    expect(screen.getByText(/Bottle · 90ml/)).toBeInTheDocument();
    expect(screen.getByText(/Wet diaper/)).toBeInTheDocument();
  });

  it("filters to feeding only when Feed chip is tapped", async () => {
    renderHistory();
    await userEvent.click(screen.getByText("🍼 Feed"));
    expect(screen.getByText(/Bottle · 90ml/)).toBeInTheDocument();
    expect(screen.queryByText(/Wet diaper/)).not.toBeInTheDocument();
  });

  it("shows date group headers", () => {
    renderHistory();
    expect(screen.getByText(/Today/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/pages/History.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement History page**

Create `src/pages/History.jsx`:

```jsx
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useBaby } from "../context/BabyContext";
import { useRealtimeLogs } from "../hooks/useRealtimeLogs";
import { formatDuration } from "../lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "feeding", label: "🍼 Feed" },
  { value: "diaper", label: "💧 Diaper" },
  { value: "sleep", label: "😴 Sleep" },
  { value: "growth", label: "📏 Growth" },
  { value: "pump", label: "🥛 Pump" },
];

function groupByDate(logs) {
  const groups = {};
  logs.forEach((log) => {
    const dateKey = format(new Date(log.sortTime), "yyyy-MM-dd");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(log);
  });
  return groups;
}

function dateLabel(dateKey) {
  const date = new Date(dateKey);
  if (isToday(date)) return `Today · ${format(date, "MMM d")}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, "MMM d")}`;
  return format(date, "EEE · MMM d");
}

function logTitle(log) {
  if (log.category === "feeding") {
    if (log.type === "bottle") return `Bottle · ${log.amount_ml}ml`;
    const side = log.side
      ? ` · ${log.side.charAt(0).toUpperCase() + log.side.slice(1)}${log.duration_minutes ? " " + log.duration_minutes + "m" : ""}`
      : "";
    return `Breastfeed${side}`;
  }
  if (log.category === "diaper") {
    return log.type === "wet"
      ? "Wet diaper"
      : log.type === "dirty"
        ? "Dirty diaper"
        : "Wet + Dirty diaper";
  }
  if (log.category === "sleep") {
    if (!log.end_time) return "Sleeping now...";
    return `Nap · ${formatDuration(log.duration_minutes)}`;
  }
  if (log.category === "growth") {
    const parts = [];
    if (log.weight_kg) parts.push(`${log.weight_kg}kg`);
    if (log.height_cm) parts.push(`${log.height_cm}cm`);
    if (log.head_cm) parts.push(`HC ${log.head_cm}cm`);
    return `Growth${parts.length ? " · " + parts.join(" ") : ""}`;
  }
  if (log.category === "pump") return `Pump · ${log.volume_total_ml ?? 0}ml`;
  return log.category;
}

const CATEGORY_STYLES = {
  feeding: { bg: "#FFF0E8", emoji: "🍼" },
  diaper: { bg: "#F0F5FF", emoji: "💧" },
  sleep: { bg: "#F5F0FF", emoji: "😴" },
  growth: { bg: "#F0FFF0", emoji: "📏" },
  pump: { bg: "#FFF8F0", emoji: "🥛" },
};

export default function History() {
  const { baby } = useBaby();
  const { logs, loading } = useRealtimeLogs(baby?.id, 200);
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? logs
      : logs.filter((l) => l.category === activeFilter);
  const grouped = groupByDate(filtered);
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: 5,
          padding: "10px 10px 8px",
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              background:
                activeFilter === f.value
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color:
                activeFilter === f.value
                  ? "#fff"
                  : "var(--color-text-secondary)",
              boxShadow:
                activeFilter === f.value
                  ? "none"
                  : "0 0 0 1px var(--color-border)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: 32,
            color: "var(--color-text-secondary)",
          }}
        >
          Loading...
        </div>
      )}

      <div style={{ padding: 10 }}>
        {dateKeys.length === 0 && !loading && (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              padding: 32,
            }}
          >
            No logs yet.
          </p>
        )}

        {dateKeys.map((dateKey) => (
          <div key={dateKey}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "12px 0 7px",
                paddingLeft: 2,
              }}
            >
              {dateLabel(dateKey)}
            </div>
            {grouped[dateKey].map((log) => {
              const style = CATEGORY_STYLES[log.category] ?? {
                bg: "#F5F5F5",
                emoji: "📋",
              };
              const time = log.sortTime
                ? format(new Date(log.sortTime), "h:mm a")
                : "";
              return (
                <div
                  key={log.id}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 11,
                    padding: 10,
                    marginBottom: 6,
                    display: "flex",
                    gap: 9,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: style.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {style.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {logTitle(log)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {time}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--color-border)" }}>
                    ›
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/pages/History.test.jsx
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/pages/History.jsx src/pages/History.test.jsx
git commit -m "feat: History page with filter chips, date grouping, and real-time logs"
```

---

### Task 16: Pump Log Screen (Session Log + Milk Stash)

**Files:**

- Replace: `src/pages/PumpLog.jsx` (replace placeholder)
- Create: `src/pages/PumpLog.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/pages/PumpLog.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PumpLog from "./PumpLog";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

const mockPumpLogs = [
  {
    id: "1",
    category: "pump",
    volume_total_ml: 120,
    storage: "fridge",
    label_date: "2026-09-01",
    timestamp: new Date().toISOString(),
    sortTime: new Date().toISOString(),
  },
  {
    id: "2",
    category: "pump",
    volume_total_ml: 80,
    storage: "freezer",
    label_date: "2026-09-01",
    timestamp: new Date().toISOString(),
    sortTime: new Date().toISOString(),
  },
  {
    id: "3",
    category: "pump",
    volume_total_ml: 60,
    storage: "feed_now",
    label_date: null,
    timestamp: new Date().toISOString(),
    sortTime: new Date().toISOString(),
  },
];

vi.mock("../hooks/useRealtimeLogs", () => ({
  useRealtimeLogs: vi
    .fn()
    .mockReturnValue({ logs: mockPumpLogs, loading: false }),
}));

function renderPumpLog() {
  return render(
    <MemoryRouter>
      <PumpLog />
    </MemoryRouter>,
  );
}

describe("PumpLog", () => {
  it("shows Sessions and Stash tabs", () => {
    renderPumpLog();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Milk Stash")).toBeInTheDocument();
  });

  it("shows session log by default", () => {
    renderPumpLog();
    expect(screen.getAllByText(/120ml|80ml|60ml/).length).toBeGreaterThan(0);
  });

  it("switches to stash view and shows only fridge/freezer", async () => {
    renderPumpLog();
    await userEvent.click(screen.getByText("Milk Stash"));
    expect(screen.getByText("Fridge")).toBeInTheDocument();
    expect(screen.getByText("Freezer")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/pages/PumpLog.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement PumpLog screen**

Replace `src/pages/PumpLog.jsx`:

```jsx
import { useState } from "react";
import { format, isAfter } from "date-fns";
import { useBaby } from "../context/BabyContext";
import { useRealtimeLogs } from "../hooks/useRealtimeLogs";
import { pumpExpiry } from "../lib/utils";

export default function PumpLog() {
  const { baby } = useBaby();
  const { logs, loading } = useRealtimeLogs(baby?.id, 200);
  const [activeTab, setActiveTab] = useState("sessions");

  const pumpLogs = logs.filter((l) => l.category === "pump");

  return (
    <div style={{ minHeight: "100%" }}>
      <div
        style={{
          padding: "16px 16px 0",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        🥛 Pump Log
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px" }}>
        {["sessions", "stash"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background:
                activeTab === tab
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color: activeTab === tab ? "#fff" : "var(--color-text-secondary)",
              boxShadow:
                activeTab === tab ? "none" : "0 0 0 1px var(--color-border)",
            }}
          >
            {tab === "sessions" ? "Sessions" : "Milk Stash"}
          </button>
        ))}
      </div>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: 32,
            color: "var(--color-text-secondary)",
          }}
        >
          Loading...
        </div>
      )}

      {activeTab === "sessions" && <SessionLog pumpLogs={pumpLogs} />}
      {activeTab === "stash" && <MilkStash pumpLogs={pumpLogs} />}
    </div>
  );
}

function SessionLog({ pumpLogs }) {
  if (pumpLogs.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "var(--color-text-secondary)",
          padding: 32,
        }}
      >
        No pump sessions yet.
      </p>
    );
  }
  return (
    <div style={{ padding: "0 16px 24px" }}>
      {pumpLogs.map((log) => (
        <div
          key={log.id}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 11,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {log.volume_total_ml ?? 0}ml total
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              {format(new Date(log.timestamp), "h:mm a · dd MMM")}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              marginTop: 3,
            }}
          >
            {log.duration_minutes ? `${log.duration_minutes} min · ` : ""}
            {log.volume_left_ml ? `L: ${log.volume_left_ml}ml  ` : ""}
            {log.volume_right_ml ? `R: ${log.volume_right_ml}ml  ` : ""}
            {storageLabel(log.storage)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MilkStash({ pumpLogs }) {
  const stored = pumpLogs.filter(
    (l) => l.storage === "fridge" || l.storage === "freezer",
  );
  const fridge = stored.filter((l) => l.storage === "fridge");
  const freezer = stored.filter((l) => l.storage === "freezer");

  if (stored.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "var(--color-text-secondary)",
          padding: 32,
        }}
      >
        No stored milk.
      </p>
    );
  }
  return (
    <div style={{ padding: "0 16px 24px" }}>
      {fridge.length > 0 && (
        <StashSection title="Fridge" emoji="❄️" batches={fridge} />
      )}
      {freezer.length > 0 && (
        <StashSection title="Freezer" emoji="🧊" batches={freezer} />
      )}
    </div>
  );
}

function StashSection({ title, emoji, batches }) {
  const totalMl = batches.reduce((sum, b) => sum + (b.volume_total_ml ?? 0), 0);
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          {emoji} {title}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {totalMl}ml total
        </span>
      </div>
      {batches.map((batch) => {
        const expiry = batch.label_date
          ? pumpExpiry(batch.storage, new Date(batch.label_date))
          : null;
        const isExpired = expiry && !isAfter(expiry, new Date());
        return (
          <div
            key={batch.id}
            style={{
              background: isExpired ? "#FFF7EC" : "var(--color-surface)",
              border: `1px solid ${isExpired ? "var(--color-warning)" : "var(--color-border)"}`,
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {batch.volume_total_ml ?? 0}ml
              </div>
              <div
                style={{ fontSize: 11, color: "var(--color-text-secondary)" }}
              >
                Labelled{" "}
                {batch.label_date
                  ? format(new Date(batch.label_date), "dd MMM")
                  : "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 11,
                  color: isExpired
                    ? "var(--color-warning)"
                    : "var(--color-text-secondary)",
                }}
              >
                {isExpired
                  ? "⚠️ Expired"
                  : expiry
                    ? `Expires ${format(expiry, "dd MMM")}`
                    : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function storageLabel(storage) {
  if (storage === "fridge") return "❄️ Fridge";
  if (storage === "freezer") return "🧊 Freezer";
  return "🍼 Fed now";
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/pages/PumpLog.test.jsx
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/pages/PumpLog.jsx src/pages/PumpLog.test.jsx
git commit -m "feat: PumpLog screen with session log and milk stash inventory"
```

---

### Task 17: Family Invite Flow

**Files:**

- Create: `src/pages/Family.jsx`
- Create: `src/pages/Family.test.jsx`
- Create: `src/pages/AcceptInvite.jsx`
- Modify: `src/App.jsx` (add /invite/:token route)
- Modify: `src/pages/More.jsx` (add Family link)

- [ ] **Step 1: Write failing tests**

Create `src/pages/Family.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Family from "./Family";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
    session: { user: { id: "u1" } },
  }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "m1",
            user_id: "u1",
            role: "owner",
            accepted_at: new Date().toISOString(),
            users: { email: "owner@test.com" },
          },
        ],
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
    },
  },
}));

function renderFamily() {
  return render(
    <MemoryRouter>
      <Family />
    </MemoryRouter>,
  );
}

describe("Family", () => {
  it("renders Family heading", () => {
    renderFamily();
    expect(screen.getByText("Family")).toBeInTheDocument();
  });

  it("shows invite link section", () => {
    renderFamily();
    expect(screen.getByText(/Invite someone/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/pages/Family.test.jsx
```

Expected: FAIL

- [ ] **Step 3: Implement Family page**

Create `src/pages/Family.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useBaby } from "../context/BabyContext";
import { supabase } from "../lib/supabase";

const ROLE_LABELS = {
  owner: "Owner",
  parent: "Parent",
  viewer: "Viewer (read-only)",
};

export default function Family() {
  const { baby } = useBaby();
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteRole, setInviteRole] = useState("parent");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!baby?.id) return;
    supabase
      .from("family_members")
      .select("*, users:user_id(email)")
      .eq("baby_id", baby.id)
      .order("invited_at")
      .then(({ data }) => setMembers(data ?? []));
  }, [baby?.id]);

  async function generateInvite() {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        baby_id: baby.id,
        user_id: null,
        role: inviteRole,
        invited_at: new Date().toISOString(),
      })
      .select("invite_token")
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setInviteLink(`${window.location.origin}/invite/${data.invite_token}`);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btnBase = {
    width: "100%",
    padding: 14,
    background: "var(--color-accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-button)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    minHeight: "var(--tap-min-height)",
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Family
      </h2>

      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        Members
      </p>
      {members.map((m) => (
        <div
          key={m.id}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            padding: "12px 14px",
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {m.users?.email ?? "Pending invite"}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              {ROLE_LABELS[m.role]}
            </div>
          </div>
          {!m.accepted_at && (
            <span style={{ fontSize: 11, color: "var(--color-warning)" }}>
              Pending
            </span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          Invite someone
        </p>

        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 10,
          }}
        >
          Role for this invite:
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {["parent", "viewer"].map((role) => (
            <button
              key={role}
              onClick={() => setInviteRole(role)}
              style={{
                padding: "12px",
                borderRadius: "var(--radius-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "var(--tap-min-height)",
                background:
                  inviteRole === role
                    ? "var(--color-accent)"
                    : "var(--color-surface)",
                color:
                  inviteRole === role ? "#fff" : "var(--color-text-primary)",
                border: `1.5px solid ${inviteRole === role ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              {role === "parent" ? "✏️ Parent" : "👁 Viewer"}
            </button>
          ))}
        </div>

        <button onClick={generateInvite} style={btnBase}>
          Generate invite link
        </button>

        {inviteLink && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "var(--color-accent-light)",
              border: "1px solid #F5D5C5",
              borderRadius: "var(--radius-card)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              Share this link (single-use):
            </p>
            <div
              style={{
                fontSize: 12,
                wordBreak: "break-all",
                marginBottom: 10,
                color: "var(--color-text-primary)",
              }}
            >
              {inviteLink}
            </div>
            <button
              onClick={copyLink}
              style={{
                ...btnBase,
                background: copied
                  ? "var(--color-success)"
                  : "var(--color-accent)",
              }}
            >
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create AcceptInvite page**

Create `src/pages/AcceptInvite.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useBaby } from "../context/BabyContext";

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { session, setBaby } = useBaby();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!session) {
      setStatus("auth");
      return;
    }
    acceptInvite();
  }, [session]);

  async function acceptInvite() {
    setStatus("accepting");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: invite, error: findErr } = await supabase
      .from("family_members")
      .select("*, babies(*)")
      .eq("invite_token", token)
      .is("accepted_at", null)
      .single();

    if (findErr || !invite) {
      setStatus("error");
      setErrorMsg("Invite not found or already used.");
      return;
    }

    const { error: updateErr } = await supabase
      .from("family_members")
      .update({ user_id: user.id, accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateErr) {
      setStatus("error");
      setErrorMsg(updateErr.message);
      return;
    }

    setBaby(invite.babies);
    setStatus("done");
    setTimeout(() => navigate("/"), 1500);
  }

  if (status === "auth")
    return (
      <div
        style={{
          padding: "32px 24px",
          maxWidth: 400,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
          You're invited! 🎉
        </p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Sign in to accept your invite and join the family.
        </p>
      </div>
    );

  if (status === "done")
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "var(--color-success)",
          }}
        >
          You're in! 🎉
        </p>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
          Taking you to the app...
        </p>
      </div>
    );

  if (status === "error")
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "var(--color-danger)",
          }}
        >
          Invite error
        </p>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
          {errorMsg}
        </p>
      </div>
    );

  return (
    <div
      style={{
        padding: "32px 24px",
        textAlign: "center",
        color: "var(--color-text-secondary)",
      }}
    >
      Accepting invite...
    </div>
  );
}
```

- [ ] **Step 5: Add invite route to App.jsx and Family link to More.jsx**

Replace `src/App.jsx`:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useBaby } from "./context/BabyContext";
import Shell from "./components/Shell";
import Onboarding from "./pages/Onboarding";
import AcceptInvite from "./pages/AcceptInvite";
import Home from "./pages/Home";
import History from "./pages/History";
import Health from "./pages/Health";
import More from "./pages/More";

export default function App() {
  const { session, baby, loading } = useBaby();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          color: "var(--color-text-secondary)",
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/invite/:token" element={<AcceptInvite />} />
      {!session || !baby ? (
        <Route path="*" element={<Onboarding />} />
      ) : (
        <Route path="/" element={<Shell babyId={baby.id} />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="health" element={<Health />} />
          <Route path="more/*" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}
```

Replace `src/pages/More.jsx`:

```jsx
import { Routes, Route, Link } from "react-router-dom";
import PumpLog from "./PumpLog";
import Family from "./Family";

export default function More() {
  return (
    <Routes>
      <Route index element={<MoreMenu />} />
      <Route path="pump" element={<PumpLog />} />
      <Route path="family" element={<Family />} />
    </Routes>
  );
}

const MENU_ITEMS = [
  { to: "pump", emoji: "🥛", label: "Pump Log & Milk Stash" },
  { to: "family", emoji: "👨‍👩‍👧", label: "Family & Sharing" },
];

function MoreMenu() {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>More</h2>
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 16,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            textDecoration: "none",
            color: "var(--color-text-primary)",
            marginBottom: 10,
            minHeight: "var(--tap-min-height)",
          }}
        >
          <span style={{ fontSize: 20 }}>{item.emoji}</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</span>
          <span style={{ marginLeft: "auto", color: "var(--color-border)" }}>
            ›
          </span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Run Family tests — verify they pass**

```bash
npx vitest run src/pages/Family.test.jsx
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/pages/Family.jsx src/pages/Family.test.jsx src/pages/AcceptInvite.jsx src/pages/More.jsx src/App.jsx
git commit -m "feat: Family invite flow with shareable token links and role selection"
```

---

### Task 18: PWA Icons + Final Verification

**Files:**

- Create: `public/icon-192.png`
- Create: `public/icon-512.png`
- Modify: `index.html` (apple-touch-icon meta tags)
- Modify: `vite.config.js` (full PWA manifest)

- [ ] **Step 1: Generate PWA icons**

Create placeholder icons (replace with a proper icon before launch):

```bash
# Requires ImageMagick. If not available, copy any PNG file renamed to icon-192.png / icon-512.png.
convert -size 192x192 xc:'#E8855A' -fill white -font Arial -pointsize 72 -gravity center -annotate 0 '👶' public/icon-192.png
convert -size 512x512 xc:'#E8855A' -fill white -font Arial -pointsize 180 -gravity center -annotate 0 '👶' public/icon-512.png
```

If ImageMagick is unavailable, create a 192×192 PNG using any tool (even a screenshot of a coloured square) and name it `public/icon-192.png`. Repeat for 512×512.

- [ ] **Step 2: Update vite.config.js with full PWA manifest**

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
        description: "Baby tracking for Sophie",
        theme_color: "#E8855A",
        background_color: "#FAFAF8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
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

- [ ] **Step 3: Add apple-touch-icon meta tags to index.html**

Add inside `<head>` in `index.html`:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Tracker" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Expected: All tests passing across all tasks.

- [ ] **Step 5: Build for production**

```bash
npm run build
```

Expected: `dist/` folder created, no build errors.

- [ ] **Step 6: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4173`. Verify: home loads, history shows filters, FAB opens LogSheet, a diaper log saves successfully.

- [ ] **Step 7: Commit**

```bash
git add public/ index.html vite.config.js
git commit -m "feat: PWA manifest, icons, and apple-touch-icon meta tags"
```

---

### Task 19: Deploy to Vercel

**Files:** No code changes — deploy configuration only.

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/baby-tracker.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

1. Go to vercel.com → New Project → Import from GitHub → select `baby-tracker`
2. Framework: Vite (auto-detected)
3. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click Deploy

- [ ] **Step 3: Configure Supabase auth redirect URL**

In Supabase dashboard → Authentication → URL Configuration:

- Site URL: `https://your-app.vercel.app`
- Redirect URLs: add `https://your-app.vercel.app/**`

- [ ] **Step 4: Test on mobile**

Open deployed URL on iPhone/Android. Test:

- Magic link auth flow works end-to-end
- Home screen renders with status cards
- FAB opens LogSheet — log a diaper entry
- Tap "Add to Home Screen" — app installs as PWA with correct name

- [ ] **Step 5: Invite your partner**

Generate an invite link from More → Family. Send to your partner's phone. Confirm they can sign in and see the same data in real time.

---

**Phase 1 complete.** The app is live, installable on both phones, and ready before Sophie arrives on August 13.

**Next phases:**

- **Phase 2** (weeks 1–3 after birth): Growth chart with WHO percentile bands, vaccination schedule, doctor visits, symptoms log
- **Phase 3** (weeks 3–6): Milestones with photos, daily journal
- **Phase 4** (weeks 6–8): AI Insights via Supabase Edge Function + Claude API
