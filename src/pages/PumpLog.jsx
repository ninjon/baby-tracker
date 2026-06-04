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
  if (pumpLogs.length === 0)
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

  if (stored.length === 0)
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
          {emoji} <span>{title}</span>
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
