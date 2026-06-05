import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import LogSheet from "./LogSheet";
import { HomeIcon, HistoryIcon, HeartIcon, MoreIcon } from "./Icons";

const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/history", label: "History", Icon: HistoryIcon },
  { to: "/health", label: "Health", Icon: HeartIcon },
  { to: "/more", label: "More", Icon: MoreIcon },
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
          padding: "8px 0 env(safe-area-inset-bottom, 12px)",
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
              boxShadow: "var(--shadow-fab)",
              transition: "background var(--transition-fast)",
            }}
          >
            +
          </button>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              marginTop: 4,
              letterSpacing: "0.02em",
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
  const { Icon } = item;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      style={({ isActive }) => ({
        flex: 1,
        textAlign: "center",
        textDecoration: "none",
        color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
        transition: "color var(--transition-fast)",
        paddingTop: 4,
      })}
    >
      {({ isActive }) => (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              marginTop: 3,
              letterSpacing: "0.02em",
            }}
          >
            {item.label}
          </div>
        </>
      )}
    </NavLink>
  );
}
