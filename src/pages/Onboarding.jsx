import { useState } from "react";
import { supabase } from "../lib/supabase";

// Single shared account — username "admin" maps to this email
const SHARED_EMAIL = "darrencheoh@gmail.com";

const INPUT_STYLE = {
  width: "100%",
  padding: "14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-card)",
  fontSize: 16,
  marginBottom: 12,
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  boxSizing: "border-box",
};

export default function Onboarding() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    if (username.trim().toLowerCase() !== "admin") {
      setError("Incorrect username or password.");
      return;
    }

    setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: SHARED_EMAIL,
      password,
    });
    setLoading(false);

    if (authErr) {
      setError("Incorrect username or password.");
    }
    // On success, BabyContext onAuthStateChange fires → app loads
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--color-accent-light)",
              border: "2px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
            }}
          >
            🌸
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 28,
              fontWeight: 400,
              margin: 0,
            }}
          >
            Sophie&apos;s Tracker
          </h1>
          <p
            style={{
              marginTop: 6,
              color: "var(--color-text-secondary)",
              fontSize: 14,
            }}
          >
            Family login
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
            style={INPUT_STYLE}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            style={{ ...INPUT_STYLE, marginBottom: 4 }}
          />

          {error && (
            <p
              style={{
                color: "var(--color-danger)",
                fontSize: 13,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "15px",
              background:
                loading || !username || !password
                  ? "var(--color-border)"
                  : "var(--color-accent)",
              color:
                loading || !username || !password
                  ? "var(--color-text-secondary)"
                  : "#fff",
              border: "none",
              borderRadius: "var(--radius-button)",
              fontSize: 16,
              fontWeight: 700,
              minHeight: "var(--tap-min-height)",
              cursor:
                loading || !username || !password ? "not-allowed" : "pointer",
              transition: "background var(--transition-fast)",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
