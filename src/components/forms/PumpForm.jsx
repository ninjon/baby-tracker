import { useState } from "react";
import { format } from "date-fns";
import { pumpExpiry, computePumpTotal } from "../../lib/utils";

const STORAGE_OPTIONS = [
  { value: "feed_now", label: "Feed Now" },
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
        <span style={{ fontSize: 17, fontWeight: 700 }}>Pump Log</span>
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
