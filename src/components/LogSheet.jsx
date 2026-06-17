import { useState, useEffect } from "react";
import BottomSheet from "./BottomSheet";
import FeedingForm from "./forms/FeedingForm";
import DiaperForm from "./forms/DiaperForm";
import SleepForm from "./forms/SleepForm";
import GrowthForm from "./forms/GrowthForm";
import PumpForm from "./forms/PumpForm";
import { supabase } from "../lib/supabase";
import { enqueue } from "../lib/offlineQueue";
import { useLogger } from "../context/LoggerContext";
import {
  BottleIcon,
  DropletIcon,
  MoonIcon,
  RulerIcon,
  FlaskIcon,
} from "./Icons";

const CATEGORIES = [
  { value: "feeding", label: "Feeding", Icon: BottleIcon },
  { value: "diaper", label: "Diaper", Icon: DropletIcon },
  { value: "sleep", label: "Sleep", Icon: MoonIcon },
  { value: "growth", label: "Growth", Icon: RulerIcon },
  { value: "pump", label: "Pump", Icon: FlaskIcon },
];

const TABLE_MAP = {
  feeding: "feeding_logs",
  diaper: "diaper_logs",
  sleep: "sleep_logs",
  growth: "growth_logs",
  pump: "pump_logs",
};

export default function LogSheet({
  open,
  babyId,
  category: initialCategory,
  editLog,
  onClose,
  onSaved,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { logger } = useLogger();

  // On open, pick the category. Edit mode forces the log's own category and
  // skips the picker; otherwise use the requested category (or show the picker).
  useEffect(() => {
    if (open) {
      setActiveCategory(editLog ? editLog.category : (initialCategory ?? null));
      setError(null);
    }
  }, [open, initialCategory, editLog]);

  async function handleSave(payload) {
    setSaving(true);
    setError(null);
    const table = TABLE_MAP[activeCategory];

    // Edit mode: update the existing row in place (keeps original author/baby).
    if (editLog) {
      const { error: dbErr } = await supabase
        .from(table)
        .update(payload)
        .eq("id", editLog.id);
      setSaving(false);
      if (dbErr) {
        setError(dbErr.message);
        return;
      }
      onSaved?.();
      onClose();
      return;
    }

    // getSession() reads the locally cached session, so it works offline too.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setSaving(false);
      setError("Your session has expired. Please sign in again.");
      return;
    }
    const row = {
      ...payload,
      baby_id: babyId,
      logged_by: user.id,
      logged_by_name: logger,
    };

    // Offline: queue the insert locally; it syncs automatically on reconnect.
    if (!navigator.onLine) {
      enqueue({
        tempId: crypto.randomUUID?.() ?? `pending-${Date.now()}`,
        table,
        category: activeCategory,
        row,
        queued_at: Date.now(),
      });
      setSaving(false);
      onSaved?.({ category: activeCategory, ...payload });
      onClose();
      setActiveCategory(initialCategory);
      return;
    }

    const { error: dbErr } = await supabase.from(table).insert(row);
    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved?.({ category: activeCategory, ...payload });
    onClose();
    setActiveCategory(initialCategory);
  }

  async function handleDelete() {
    if (!editLog) return;
    setSaving(true);
    setError(null);
    const { error: dbErr } = await supabase
      .from(TABLE_MAP[editLog.category])
      .delete()
      .eq("id", editLog.id);
    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved?.();
    onClose();
  }

  function handleClose() {
    onClose();
    setActiveCategory(initialCategory);
  }

  const formProps = {
    onSave: handleSave,
    onCancel: handleClose,
    initial: editLog ?? undefined,
    onDelete: editLog ? handleDelete : undefined,
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {saving && (
        <div
          style={{
            textAlign: "center",
            padding: 16,
            color: "var(--color-text-secondary)",
          }}
        >
          Saving...
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "8px 16px",
            color: "var(--color-danger)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {!activeCategory && (
        <div style={{ padding: "0 16px 24px" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "6px 0 14px",
            }}
          >
            Log
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  padding: 16,
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  minHeight: "var(--tap-min-height)",
                  color: "var(--color-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <cat.Icon size={18} color="var(--color-accent)" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCategory === "feeding" && <FeedingForm {...formProps} />}
      {activeCategory === "diaper" && <DiaperForm {...formProps} />}
      {activeCategory === "sleep" && <SleepForm {...formProps} />}
      {activeCategory === "growth" && <GrowthForm {...formProps} />}
      {activeCategory === "pump" && <PumpForm {...formProps} />}
    </BottomSheet>
  );
}
