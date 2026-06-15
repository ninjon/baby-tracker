import { useState } from "react";
import { DIAPER_COLORS, CONSISTENCIES } from "../../lib/diaperConstants";
import { format } from "date-fns";

const TYPES = [
  { value: "wet", label: "Wet" },
  { value: "dirty", label: "Dirty" },
  { value: "both", label: "Both" },
];

export default function DiaperForm({ onSave, onCancel }) {
  const [type, setType] = useState("wet");
  const [color, setColor] = useState("yellow");
  const [consistency, setConsistency] = useState("seedy");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  const maxDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const showExtras = type === "dirty" || type === "both";
  const selectedColor = DIAPER_COLORS.find((c) => c.value === color);

  function handleSave() {
    onSave({
      type,
      color: showExtras ? color : null,
      consistency: showExtras ? consistency : null,
      notes: notes.trim() || null,
      timestamp: new Date(timestamp).toISOString(),
    });
  }

  const btnBase = {
    padding: "12px 6px",
    borderRadius: "var(--radius-card)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "1.5px solid var(--color-border)",
    minHeight: "var(--tap-min-height)",
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
        <span style={{ fontSize: 17, fontWeight: 700 }}>Diaper Log</span>
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
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            style={{
              ...btnBase,
              textAlign: "center",
              background:
                type === t.value
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color: type === t.value ? "#fff" : "var(--color-text-primary)",
              borderColor:
                type === t.value
                  ? "var(--color-accent)"
                  : "var(--color-border)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showExtras && (
        <>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #F0EBE6",
              margin: "0 0 14px",
            }}
          />

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Colour
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            {DIAPER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={`Colour ${c.label}`}
                aria-pressed={color === c.value}
                onClick={() => setColor(c.value)}
                style={{
                  textAlign: "center",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: c.hex,
                    margin: "0 auto 4px",
                    cursor: "pointer",
                    border:
                      color === c.value
                        ? "3px solid var(--color-accent)"
                        : "2px solid transparent",
                    boxShadow:
                      color === c.value
                        ? "0 0 0 2px var(--color-accent-light)"
                        : "none",
                    position: "relative",
                  }}
                >
                  {c.warning && (
                    <div
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        width: 14,
                        height: 14,
                        background:
                          c.value === "red"
                            ? "var(--color-danger)"
                            : "var(--color-warning)",
                        borderRadius: "50%",
                        fontSize: 8,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      !
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: color === c.value ? "var(--color-accent)" : "#888",
                    fontWeight: color === c.value ? 600 : 400,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: c.warning
                      ? c.value === "red"
                        ? "var(--color-danger)"
                        : "var(--color-warning)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {c.note}
                </div>
              </button>
            ))}
          </div>

          {selectedColor?.warning && (
            <div
              style={{
                marginBottom: 14,
                background: "#FFF7EC",
                border: "1px solid var(--color-warning)",
                borderRadius: 10,
                padding: "9px 11px",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span>⚠️</span>
              <p style={{ fontSize: 11, color: "#8B5E00", lineHeight: 1.45 }}>
                {selectedColor.warning}
              </p>
            </div>
          )}

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
            Consistency
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 6,
              marginBottom: 16,
            }}
          >
            {CONSISTENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setConsistency(c)}
                style={{
                  ...btnBase,
                  padding: "10px 2px",
                  fontSize: 11,
                  background:
                    consistency === c
                      ? "var(--color-accent)"
                      : "var(--color-surface)",
                  color: consistency === c ? "#fff" : "#888",
                  borderColor:
                    consistency === c
                      ? "var(--color-accent)"
                      : "var(--color-border)",
                }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

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
        Notes{" "}
        <span style={{ textTransform: "none", fontSize: 10, fontWeight: 400 }}>
          (optional)
        </span>
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a note..."
        rows={2}
        style={{
          width: "100%",
          padding: 11,
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          fontSize: 13,
          resize: "none",
          color: "var(--color-text-primary)",
          marginBottom: 16,
        }}
      />

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
        }}
      >
        Save Diaper Log
      </button>
    </div>
  );
}
