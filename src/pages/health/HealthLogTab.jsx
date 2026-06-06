import { useState } from "react";
import { format } from "date-fns";
import BottomSheet from "../../components/BottomSheet";
import HealthLogForm from "../../components/forms/HealthLogForm";
import { useBaby } from "../../context/BabyContext";
import { useHealthLogs } from "../../hooks/useHealthLogs";

const ENTRY_META = {
  fever: { icon: "🌡️", label: "Fever" },
  medication: { icon: "💊", label: "Medication" },
  doctor_visit: { icon: "🏥", label: "Doctor Visit" },
};

function primaryValue(log) {
  if (log.entry_type === "fever" && log.temperature_celsius != null) {
    return `${log.temperature_celsius}°C`;
  }
  if (log.entry_type === "medication" && log.medication_name) {
    return (
      log.medication_name +
      (log.medication_dose ? ` · ${log.medication_dose}` : "")
    );
  }
  if (log.entry_type === "doctor_visit" && log.doctor_name) {
    return log.doctor_name;
  }
  return null;
}

function HealthLogCard({ log }) {
  const meta = ENTRY_META[log.entry_type] ?? {
    icon: "📋",
    label: log.entry_type,
  };
  const primary = primaryValue(log);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 11,
        padding: "10px 14px",
        marginBottom: 8,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "var(--color-accent-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          {meta.label}
          {primary && (
            <span
              style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}
            >
              {" "}
              · {primary}
            </span>
          )}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginTop: 2,
          }}
        >
          {format(new Date(log.timestamp), "d MMM yyyy, HH:mm")}
        </p>
      </div>
    </div>
  );
}

export default function HealthLogTab() {
  const { baby } = useBaby();
  const { logs, loading, save } = useHealthLogs(baby?.id ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (loading) {
    return (
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
        Loading…
      </p>
    );
  }

  return (
    <div>
      {logs.length === 0 ? (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--color-border)",
            padding: "28px 16px",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          No health events recorded yet
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {logs.map((log) => (
            <HealthLogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        aria-label="Add health log entry"
        onClick={() => setSheetOpen(true)}
        style={{
          position: "fixed",
          bottom: 88,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: "var(--color-accent)",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "var(--shadow-fab)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40,
        }}
      >
        +
      </button>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <HealthLogForm
          babyId={baby?.id}
          onSave={save}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}
