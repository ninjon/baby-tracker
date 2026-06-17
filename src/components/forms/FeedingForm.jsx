import { useState } from "react";
import { format } from "date-fns";
import DeleteLogButton from "./DeleteLogButton";

const SIDES = ["left", "right", "both"];

export default function FeedingForm({ onSave, onCancel, initial, onDelete }) {
  const [type, setType] = useState(initial?.type ?? "breast");
  const [side, setSide] = useState(initial?.side ?? "left");
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.duration_minutes != null ? String(initial.duration_minutes) : "",
  );
  const [amountMl, setAmountMl] = useState(
    initial?.amount_ml != null ? String(initial.amount_ml) : "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [timestamp, setTimestamp] = useState(
    format(
      initial?.timestamp ? new Date(initial.timestamp) : new Date(),
      "yyyy-MM-dd'T'HH:mm",
    ),
  );
  const maxDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const canSave =
    type === "breast" ||
    (type === "bottle" && amountMl !== "" && parseInt(amountMl) > 0);

  function handleSave() {
    if (!canSave) return;
    onSave({
      type,
      side: type === "breast" ? side : null,
      duration_minutes:
        type === "breast" && durationMinutes ? parseInt(durationMinutes) : null,
      amount_ml: type === "bottle" && amountMl ? parseInt(amountMl) : null,
      notes: notes.trim() || null,
      timestamp: new Date(timestamp).toISOString(),
    });
  }

  const btnBase = {
    padding: "13px 16px",
    borderRadius: "var(--radius-card)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "var(--tap-min-height)",
  };
  const inputStyle = {
    width: "100%",
    padding: "14px",
    border: "1.5px solid var(--color-border)",
    borderRadius: "var(--radius-card)",
    fontSize: 15,
    color: "var(--color-text-primary)",
    background: "var(--color-surface)",
    textAlign: "center",
    boxSizing: "border-box",
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
        <span style={{ fontSize: 17, fontWeight: 700 }}>Feeding Log</span>
        <input
          type="datetime-local"
          value={timestamp}
          max={maxDateTime}
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
        Type
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {["breast", "bottle"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              ...btnBase,
              background:
                type === t ? "var(--color-accent)" : "var(--color-surface)",
              color: type === t ? "#fff" : "var(--color-text-primary)",
              border: `1.5px solid ${type === t ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            {t === "breast" ? "Breast" : "Bottle"}
          </button>
        ))}
      </div>

      {type === "breast" && (
        <>
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
            Side
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {SIDES.map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                style={{
                  ...btnBase,
                  padding: "13px 4px",
                  background:
                    side === s ? "var(--color-accent)" : "var(--color-surface)",
                  color: side === s ? "#fff" : "var(--color-text-primary)",
                  border: `1.5px solid ${side === s ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
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
              placeholder="e.g. 15"
              style={inputStyle}
            />
          </label>
        </>
      )}

      {type === "bottle" && (
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
            Amount (ml)
          </p>
          <input
            type="number"
            value={amountMl}
            onChange={(e) => setAmountMl(e.target.value)}
            placeholder="e.g. 90 ml"
            style={inputStyle}
          />
        </label>
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
        disabled={!canSave}
        style={{
          width: "100%",
          padding: 15,
          background: canSave ? "var(--color-accent)" : "var(--color-border)",
          color: canSave ? "#fff" : "var(--color-text-secondary)",
          border: "none",
          borderRadius: "var(--radius-button)",
          fontSize: 15,
          fontWeight: 700,
          minHeight: "var(--tap-min-height)",
          cursor: canSave ? "pointer" : "not-allowed",
        }}
      >
        Save Feeding Log
      </button>
      <DeleteLogButton onDelete={onDelete} />
    </div>
  );
}
