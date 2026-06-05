import { useState } from "react";
import { format } from "date-fns";

export default function GrowthForm({ onSave, onCancel }) {
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  const [notes, setNotes] = useState("");
  const [measuredAt, setMeasuredAt] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );

  function handleSave() {
    onSave({
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      head_cm: headCm ? parseFloat(headCm) : null,
      notes: notes.trim() || null,
      measured_at: new Date(measuredAt).toISOString(),
    });
  }

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

  const fields = [
    {
      label: "Weight (kg)",
      placeholder: "Weight e.g. 3.8",
      value: weightKg,
      onChange: setWeightKg,
      step: "0.001",
    },
    {
      label: "Height (cm)",
      placeholder: "Height e.g. 52",
      value: heightCm,
      onChange: setHeightCm,
      step: "0.1",
    },
    {
      label: "Head circumference (cm)",
      placeholder: "Head e.g. 35",
      value: headCm,
      onChange: setHeadCm,
      step: "0.1",
    },
  ];

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
        <span style={{ fontSize: 17, fontWeight: 700 }}>📏 Growth Log</span>
        <input
          type="datetime-local"
          value={measuredAt}
          onChange={(e) => setMeasuredAt(e.target.value)}
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
          fontSize: 12,
          color: "var(--color-text-secondary)",
          marginBottom: 16,
        }}
      >
        All fields optional — log what you have.
      </p>
      {fields.map((f) => (
        <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
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
            {f.label}
          </p>
          <input
            type="number"
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            step={f.step}
            style={inputStyle}
          />
        </label>
      ))}
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
        Save Growth Log
      </button>
    </div>
  );
}
