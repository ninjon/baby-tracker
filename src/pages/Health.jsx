import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import GrowthTab from "./health/GrowthTab";
import VaccinesTab from "./health/VaccinesTab";
import HealthLogTab from "./health/HealthLogTab";
import InsightsTab from "./health/InsightsTab";

const TABS = [
  { id: "growth", label: "Growth", Component: GrowthTab },
  { id: "vaccines", label: "Vaccines", Component: VaccinesTab },
  { id: "health-log", label: "Health Log", Component: HealthLogTab },
  { id: "insights", label: "Insights", Component: InsightsTab },
];

export default function Health() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = TABS.some((t) => t.id === requestedTab)
    ? requestedTab
    : "growth";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { Component: ActivePanel } = TABS.find((t) => t.id === activeTab);

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: "20px 16px 0" }}>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 22,
            fontWeight: 400,
            marginBottom: 16,
          }}
        >
          Health
        </h2>

        <div
          role="tablist"
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
            scrollbarWidth: "none",
          }}
        >
          {TABS.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                style={{
                  flexShrink: 0,
                  minHeight: 44,
                  padding: "0 16px",
                  borderRadius: 22,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                  color: isActive ? "#fff" : "var(--color-text-secondary)",
                  transition:
                    "background var(--transition-fast), color var(--transition-fast)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <ActivePanel />
      </div>
    </div>
  );
}
