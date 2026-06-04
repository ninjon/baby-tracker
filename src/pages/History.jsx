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
