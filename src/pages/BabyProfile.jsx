import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBaby } from "../context/BabyContext";
import { EditIcon, ChevronRightIcon } from "../components/Icons";

const INPUT_STYLE = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-card)",
  fontSize: 16,
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  outline: "none",
  boxSizing: "border-box",
  // iOS renders date inputs as native controls that ignore CSS padding.
  // appearance:none forces CSS-governed rendering while keeping the native picker.
  WebkitAppearance: "none",
  appearance: "none",
};

const LABEL_STYLE = {
  display: "block",
  marginBottom: 16,
};

const LABEL_TEXT_STYLE = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

export default function BabyProfile() {
  const { baby, updateBaby } = useBaby();
  const navigate = useNavigate();

  const [name, setName] = useState(baby?.name ?? "");
  const [dob, setDob] = useState(baby?.date_of_birth ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || !dob) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: err } = await updateBaby({
      name: name.trim(),
      date_of_birth: dob,
    });

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => navigate(-1), 800);
    }
  }

  return (
    <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => navigate("/more")}
          aria-label="Go back"
          style={{
            background: "none",
            border: "none",
            padding: "4px 8px 4px 0",
            color: "var(--color-accent)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronRightIcon size={22} style={{ transform: "rotate(180deg)" }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EditIcon size={18} color="var(--color-accent)" />
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 400,
              margin: 0,
            }}
          >
            Baby Profile
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <label style={LABEL_STYLE}>
          <span style={LABEL_TEXT_STYLE}>Baby&apos;s name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sophie"
            required
            style={INPUT_STYLE}
          />
        </label>

        <label style={LABEL_STYLE}>
          <span style={LABEL_TEXT_STYLE}>Due date / Date of birth</span>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            style={INPUT_STYLE}
          />
          <span
            style={{
              display: "block",
              marginTop: 5,
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            Update this if the due date changes.
          </span>
        </label>

        {error && (
          <p
            style={{
              color: "var(--color-danger)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {error}
          </p>
        )}

        {saved && (
          <p
            style={{
              color: "var(--color-success)",
              fontSize: 13,
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Saved
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !name.trim() || !dob}
          style={{
            width: "100%",
            padding: "15px",
            background:
              saving || !name.trim() || !dob
                ? "var(--color-border)"
                : "var(--color-accent)",
            color:
              saving || !name.trim() || !dob
                ? "var(--color-text-secondary)"
                : "#fff",
            border: "none",
            borderRadius: "var(--radius-button)",
            fontSize: 16,
            fontWeight: 700,
            minHeight: "var(--tap-min-height)",
            cursor: saving || !name.trim() || !dob ? "not-allowed" : "pointer",
            transition: "background var(--transition-fast)",
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
