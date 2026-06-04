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
