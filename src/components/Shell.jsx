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
