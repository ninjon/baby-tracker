import { useState } from "react";
import { format, isBefore, addDays } from "date-fns";
import BottomSheet from "../../components/BottomSheet";
import { useBaby } from "../../context/BabyContext";
import { useVaccineRecords } from "../../hooks/useVaccineRecords";
import { VACCINE_SCHEDULE, getDueDate } from "../../lib/vaccineSchedule";

const TODAY = new Date();
const SOON_DAYS = 30;

const STATUS_ORDER = ["overdue", "due-soon", "upcoming", "done"];

const STATUS_LABELS = {
  overdue: "Overdue",
  "due-soon": "Due Soon",
  upcoming: "Upcoming",
  done: "Done",
};

const STATUS_COLORS = {
  overdue: "var(--color-danger)",
  "due-soon": "var(--color-warning)",
  upcoming: "var(--color-text-secondary)",
  done: "var(--color-success)",
};

function getStatus(dueDate, isDone) {
  if (isDone) return "done";
  if (isBefore(dueDate, TODAY)) return "overdue";
  if (isBefore(dueDate, addDays(TODAY, SOON_DAYS))) return "due-soon";
  return "upcoming";
}

function VaccineRow({ vaccine, dueDate, isDone, onMarkDone }) {
  const status = getStatus(dueDate, isDone);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 2,
          }}
        >
          {vaccine.name}
          {!vaccine.mandatory && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 10,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              optional
            </span>
          )}
        </p>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {format(dueDate, "d MMM yyyy")}
        </p>
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: STATUS_COLORS[status],
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        {STATUS_LABELS[status]}
      </span>

      {!isDone && (
        <button
          aria-label={`Mark ${vaccine.name} as done`}
          onClick={() => onMarkDone(vaccine)}
          style={{
            flexShrink: 0,
            height: 32,
            padding: "0 12px",
            borderRadius: "var(--radius-button)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Mark done
        </button>
      )}
    </div>
  );
}

function MarkDoneSheet({ vaccine, babyId, onSave, onClose }) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [batch, setBatch] = useState("");
  const [clinic, setClinic] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      baby_id: babyId,
      vaccine_id: vaccine.id,
      administered_at: date,
      batch_number: batch || null,
      clinic: clinic || null,
      notes: notes || null,
    });
    setSaving(false);
    onClose();
  }

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

  return (
    <div style={{ padding: "0 16px 32px" }}>
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 20,
          fontWeight: 400,
          marginBottom: 20,
          marginTop: 4,
        }}
      >
        {vaccine.name}
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Date given</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Batch number</label>
          <input
            type="text"
            placeholder="Optional"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Clinic / hospital</label>
          <input
            type="text"
            placeholder="Optional"
            value={clinic}
            onChange={(e) => setClinic(e.target.value)}
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            placeholder="Any reactions or observations…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

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

export default function VaccinesTab() {
  const { baby } = useBaby();
  const { records, loading, save } = useVaccineRecords(baby?.id ?? null);
  const [sheetVaccine, setSheetVaccine] = useState(null);

  if (loading) {
    return (
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
        Loading…
      </p>
    );
  }

  const doneIds = new Set(records.map((r) => r.vaccine_id));
  const dob = baby?.date_of_birth ? new Date(baby.date_of_birth) : null;

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {});

  for (const vaccine of VACCINE_SCHEDULE) {
    if (!dob) continue;
    const dueDate = getDueDate(vaccine, dob);
    const isDone = doneIds.has(vaccine.id);
    const status = getStatus(dueDate, isDone);
    grouped[status].push({ vaccine, dueDate, isDone });
  }

  return (
    <div>
      {STATUS_ORDER.map((status) => {
        const items = grouped[status];
        if (items.length === 0) return null;

        return (
          <div key={status} style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: STATUS_COLORS[status],
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              {STATUS_LABELS[status]} · {items.length}
            </p>

            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
                padding: "0 16px",
              }}
            >
              {items.map(({ vaccine, dueDate, isDone }, idx) => (
                <VaccineRow
                  key={vaccine.id}
                  vaccine={vaccine}
                  dueDate={dueDate}
                  isDone={isDone}
                  onMarkDone={setSheetVaccine}
                  style={
                    idx === items.length - 1
                      ? { borderBottom: "none" }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        );
      })}

      <BottomSheet open={!!sheetVaccine} onClose={() => setSheetVaccine(null)}>
        {sheetVaccine && (
          <MarkDoneSheet
            vaccine={sheetVaccine}
            babyId={baby?.id}
            onSave={save}
            onClose={() => setSheetVaccine(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
}
