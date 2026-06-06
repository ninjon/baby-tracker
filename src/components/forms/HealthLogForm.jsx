import { useState } from "react";
import { format } from "date-fns";

const ENTRY_TYPES = [
  { id: "fever", label: "Fever" },
  { id: "medication", label: "Medication" },
  { id: "doctor_visit", label: "Doctor Visit" },
];

const VISIT_TYPES = ["GP", "PD", "A&E", "specialist", "other"];

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  fontSize: 14,
  color: "var(--color-text-primary)",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/**
 * @param {{ babyId: string, onSave: Function, onClose: Function }} props
 */
export default function HealthLogForm({ babyId, onSave, onClose }) {
  const [activeType, setActiveType] = useState("fever");
  const [saving, setSaving] = useState(false);

  // shared
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  const [notes, setNotes] = useState("");

  // fever
  const [temperature, setTemperature] = useState("");

  // medication
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");

  // doctor visit
  const [visitType, setVisitType] = useState("GP");
  const [doctorName, setDoctorName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const base = {
      baby_id: babyId,
      entry_type: activeType,
      timestamp: new Date(timestamp).toISOString(),
      notes: notes || null,
    };

    const payload =
      activeType === "fever"
        ? {
            ...base,
            temperature_celsius: temperature ? parseFloat(temperature) : null,
          }
        : activeType === "medication"
          ? {
              ...base,
              medication_name: medName || null,
              medication_dose: medDose || null,
            }
          : {
              ...base,
              visit_type: visitType,
              doctor_name: doctorName || null,
              diagnosis: diagnosis || null,
            };

    await onSave(payload);
    setSaving(false);
    onClose();
  }

  return (
    <div style={{ padding: "0 16px 32px" }}>
      {/* Type tab bar */}
      <div
        role="tablist"
        style={{ display: "flex", gap: 6, marginBottom: 20, marginTop: 4 }}
      >
        {ENTRY_TYPES.map(({ id, label }) => {
          const isActive = activeType === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveType(id)}
              style={{
                flex: 1,
                minHeight: 36,
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                background: isActive
                  ? "var(--color-accent)"
                  : "var(--color-border)",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Fever fields */}
        {activeType === "fever" && (
          <Field label="Temperature (°C)">
            <input
              id="temperature"
              type="number"
              step="0.1"
              min="35"
              max="42"
              placeholder="38.5"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              style={fieldStyle}
              aria-label="Temperature (°C)"
            />
          </Field>
        )}

        {/* Medication fields */}
        {activeType === "medication" && (
          <>
            <Field label="Medication name">
              <input
                type="text"
                placeholder="e.g. Paracetamol"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                style={fieldStyle}
                aria-label="Medication name"
              />
            </Field>
            <Field label="Dose">
              <input
                type="text"
                placeholder="e.g. 2.5 ml"
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                style={fieldStyle}
                aria-label="Dose"
              />
            </Field>
          </>
        )}

        {/* Doctor visit fields */}
        {activeType === "doctor_visit" && (
          <>
            <Field label="Visit type">
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                style={fieldStyle}
                aria-label="Visit type"
              >
                {VISIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Doctor name">
              <input
                type="text"
                placeholder="Optional"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                style={fieldStyle}
                aria-label="Doctor name"
              />
            </Field>
            <Field label="Diagnosis">
              <input
                type="text"
                placeholder="Optional"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                style={fieldStyle}
                aria-label="Diagnosis"
              />
            </Field>
          </>
        )}

        {/* Shared fields */}
        <Field label="Date & time">
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            style={fieldStyle}
            aria-label="Date and time"
          />
        </Field>

        <Field label="Notes">
          <textarea
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ ...fieldStyle, resize: "vertical" }}
            aria-label="Notes"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            minHeight: "var(--tap-min-height)",
            borderRadius: "var(--radius-button)",
            border: "none",
            background: "var(--color-accent)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
