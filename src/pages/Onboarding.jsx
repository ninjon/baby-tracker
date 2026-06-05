import { useState } from "react";
import { useBaby } from "../context/BabyContext";
import { supabase } from "../lib/supabase";

export default function Onboarding() {
  const { sendMagicLink, baby, setBaby, session } = useBaby();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [babyName, setBabyName] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSendLink(e) {
    e.preventDefault();
    const { error } = await sendMagicLink(email);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  async function handleCreateBaby(e) {
    e.preventDefault();
    if (!babyName.trim() || !dob) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: newBaby, error: babyErr } = await supabase
      .from("babies")
      .insert({
        name: babyName.trim(),
        date_of_birth: dob,
        created_by: user.id,
      })
      .select()
      .single();

    if (babyErr) {
      setError(babyErr.message);
      setSaving(false);
      return;
    }

    await supabase.from("family_members").insert({
      baby_id: newBaby.id,
      user_id: user.id,
      role: "owner",
      accepted_at: new Date().toISOString(),
    });

    setBaby(newBaby);
    setSaving(false);
  }

  if (!session && !sent) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: 400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Welcome
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Enter your email to get started.
        </p>
        <form onSubmit={handleSendLink}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: "100%",
              padding: "14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 16,
              marginBottom: 12,
            }}
          />
          {error && (
            <p style={{ color: "var(--color-danger)", marginBottom: 8 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "15px",
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-button)",
              fontSize: 16,
              fontWeight: 700,
              minHeight: "var(--tap-min-height)",
            }}
          >
            Send magic link
          </button>
        </form>
      </div>
    );
  }

  if (!session && sent && !baby) {
    return (
      <div
        style={{
          padding: "32px 24px",
          maxWidth: 400,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Check your email
        </p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          We sent a magic link to <strong>{email}</strong>. Tap it to sign in.
        </p>
        <button
          onClick={() => setSent(false)}
          style={{
            marginTop: 16,
            padding: "12px 24px",
            background: "none",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-button)",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Use different email
        </button>
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "var(--color-accent-light)",
            border: "1px solid #F5D5C5",
            borderRadius: "var(--radius-card)",
          }}
        >
          <p style={{ fontSize: 12, color: "#7A4030" }}>
            First time? After signing in you'll create Sophie's profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Create baby profile
      </h1>
      <form onSubmit={handleCreateBaby}>
        <label style={{ display: "block", marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Baby's name
          </span>
          <input
            type="text"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="Sophie"
            required
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              padding: "14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 16,
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 20 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Date of birth
          </span>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              padding: "14px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              fontSize: 16,
            }}
          />
        </label>
        {error && (
          <p style={{ color: "var(--color-danger)", marginBottom: 8 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "15px",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-button)",
            fontSize: 16,
            fontWeight: 700,
            minHeight: "var(--tap-min-height)",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Create profile"}
        </button>
      </form>
    </div>
  );
}
