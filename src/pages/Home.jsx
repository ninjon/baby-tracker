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

const FEED_URGENT_MS = 3 * 3600000;
const DIAPER_URGENT_MS = 4 * 3600000;

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
            lastFeed &&
            Date.now() - new Date(lastFeed.timestamp) > FEED_URGENT_MS
          }
        />
        <StatusCard
          emoji="💧"
          label="Diaper"
          value={lastDiaper ? timeSince(new Date(lastDiaper.timestamp)) : "—"}
          sub={lastDiaper ? "ago" : ""}
          urgent={
            lastDiaper &&
            Date.now() - new Date(lastDiaper.timestamp) > DIAPER_URGENT_MS
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
