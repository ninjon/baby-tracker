import { useState } from "react";
import BottomSheet from "./BottomSheet";
import FeedingForm from "./forms/FeedingForm";
import DiaperForm from "./forms/DiaperForm";
import SleepForm from "./forms/SleepForm";
import GrowthForm from "./forms/GrowthForm";
import PumpForm from "./forms/PumpForm";
import { supabase } from "../lib/supabase";
import { useLogger } from "../context/LoggerContext";

const CATEGORIES = [
  { value: "feeding", label: "Feeding", emoji: "🍼" },
  { value: "diaper", label: "Diaper", emoji: "💩" },
  { value: "sleep", label: "Sleep", emoji: "😴" },
  { value: "growth", label: "Growth", emoji: "📏" },
  { value: "pump", label: "Pump", emoji: "🥛" },
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
  onClose,
  onSaved,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { logger } = useLogger();

  async function handleSave(payload) {
    setSaving(true);
    setError(null);
    const table = TABLE_MAP[activeCategory];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: dbErr } = await supabase
      .from(table)
      .insert({
        ...payload,
        baby_id: babyId,
        logged_by: user.id,
        logged_by_name: logger,
      });
    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved?.({ category: activeCategory, ...payload });
    onClose();
    setActiveCategory(initialCategory);
  }

  function handleClose() {
    onClose();
    setActiveCategory(initialCategory);
  }

  const formProps = { onSave: handleSave, onCancel: handleClose };

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
                }}
              >
                {cat.emoji} <span>{cat.label}</span>
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
