import { useState } from "react";
import { format, subMinutes } from "date-fns";

export default function SleepForm({ onSave, onCancel }) {
  const now = new Date();
  const [startTime, setStartTime] = useState(
    format(subMinutes(now, 30), "yyyy-MM-dd'T'HH:mm"),
  );
  const [endTime, setEndTime] = useState(format(now, "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState("");

  function buildPayload(endTimeIso) {
    const start = new Date(startTime);
    const end = endTimeIso ? new Date(endTimeIso) : null;
    const duration = end ? Math.round((end - start) / 60000) : null;
    return {
      start_time: start.toISOString(),
      end_time: end ? end.toISOString() : null,
      duration_minutes: duration,
      notes: notes.trim() || null,
    };
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    padding: "14px",
    border: "1.5px solid var(--color-border)",
    borderRadius: "var(--radius-card)",
    fontSize: 15,
    marginTop: 6,
    color: "var(--color-text-primary)",
    background: "var(--color-surface)",
    textAlign: "center",
    boxSizing: "border-box",
    minWidth: 0,
  };
  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
  const btnBase = {
    width: "100%",
    padding: 15,
    border: "none",
    borderRadius: "var(--radius-button)",
    fontSize: 15,
    fontWeight: 700,
    minHeight: "var(--tap-min-height)",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "6px 0 14px", fontSize: 17, fontWeight: 700 }}>
        Sleep Log
      </div>

      <label style={{ display: "block", marginBottom: 14, overflow: "hidden" }}>
        <span style={labelStyle}>Start time</span>
        <input
          aria-label="Start time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16, overflow: "hidden" }}>
        <span style={labelStyle}>End time</span>
        <input
          aria-label="End time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={labelStyle}>
          Notes{" "}
          <span
            style={{ textTransform: "none", fontSize: 10, fontWeight: 400 }}
          >
            (optional)
          </span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />
      </label>

      <button
        onClick={() => onSave(buildPayload(null))}
        style={{
          ...btnBase,
          background: "var(--color-surface)",
          color: "var(--color-accent)",
          border: "1.5px solid var(--color-accent)",
          marginBottom: 10,
        }}
      >
        Still sleeping (start timer)
      </button>

      <button
        onClick={() => onSave(buildPayload(endTime))}
        style={{ ...btnBase, background: "var(--color-accent)", color: "#fff" }}
      >
        Save sleep log
      </button>
    </div>
  );
}
