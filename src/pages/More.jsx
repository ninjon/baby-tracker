import { Routes, Route, Link } from "react-router-dom";
import PumpLog from "./PumpLog";
import Family from "./Family";
import BabyProfile from "./BabyProfile";
import {
  UserIcon,
  DropletIcon,
  UsersIcon,
  ChevronRightIcon,
  SignOutIcon,
} from "../components/Icons";
import { useBaby } from "../context/BabyContext";

export default function More() {
  return (
    <Routes>
      <Route index element={<MoreMenu />} />
      <Route path="profile" element={<BabyProfile />} />
      <Route path="pump" element={<PumpLog />} />
      <Route path="family" element={<Family />} />
    </Routes>
  );
}

const MENU_ITEMS = [
  {
    to: "profile",
    Icon: UserIcon,
    label: "Baby Profile",
    sub: "Edit name & due date",
  },
  { to: "pump", Icon: DropletIcon, label: "Pump Log & Milk Stash", sub: null },
  { to: "family", Icon: UsersIcon, label: "Family & Sharing", sub: null },
];

function MoreMenu() {
  const { signOut } = useBaby();

  return (
    <div style={{ padding: "20px 16px" }}>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 22,
          fontWeight: 400,
          marginBottom: 20,
        }}
      >
        More
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              textDecoration: "none",
              color: "var(--color-text-primary)",
              minHeight: "var(--tap-min-height)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--color-accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
                flexShrink: 0,
              }}
            >
              <item.Icon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</div>
              {item.sub && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    marginTop: 1,
                  }}
                >
                  {item.sub}
                </div>
              )}
            </div>
            <ChevronRightIcon size={16} color="var(--color-text-secondary)" />
          </Link>
        ))}
      </div>

      <button
        onClick={signOut}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          marginTop: 24,
          padding: "14px 16px",
          background: "none",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          color: "var(--color-danger)",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <SignOutIcon size={18} />
        Sign out
      </button>
    </div>
  );
}
