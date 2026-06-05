import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useBaby } from "../context/BabyContext";

const INPUT_STYLE = {
  width: "100%",
  padding: "14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-card)",
  fontSize: 16,
  marginBottom: 12,
  boxSizing: "border-box",
};

const BTN_STYLE = {
  width: "100%",
  padding: "15px",
  background: "var(--color-accent)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-button)",
  fontSize: 16,
  fontWeight: 700,
  minHeight: "var(--tap-min-height)",
  cursor: "pointer",
};

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { session, setBaby } = useBaby();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState(null);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [signInError, setSignInError] = useState(null);

  useEffect(() => {
    if (!session) {
      setStatus("auth");
      return;
    }
    acceptInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function acceptInvite() {
    setStatus("accepting");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: invite, error: findErr } = await supabase
      .from("family_members")
      .select("*, babies(*)")
      .eq("invite_token", token)
      .is("accepted_at", null)
      .single();
    if (findErr || !invite) {
      setStatus("error");
      setErrorMsg("Invite not found or already used.");
      return;
    }

    const { error: updateErr } = await supabase
      .from("family_members")
      .update({ user_id: user.id, accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    if (updateErr) {
      setStatus("error");
      setErrorMsg(updateErr.message);
      return;
    }

    setBaby(invite.babies);
    setStatus("done");
    setTimeout(() => navigate("/"), 1500);
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setSignInError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    if (error) {
      setSignInError(error.message);
      return;
    }
    setLinkSent(true);
  }

  if (status === "auth")
    return (
      <div style={{ padding: "32px 24px", maxWidth: 400, margin: "0 auto" }}>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
          You're invited! 🎉
        </p>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Sign in to accept your invite and join the family.
        </p>
        {linkSent ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Check your email</p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
              We sent a magic link to <strong>{email}</strong>. Tap it to sign
              in — you'll be taken straight to the app.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={INPUT_STYLE}
            />
            {signInError && (
              <p
                style={{
                  color: "var(--color-danger)",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {signInError}
              </p>
            )}
            <button type="submit" style={BTN_STYLE}>
              Send magic link
            </button>
          </form>
        )}
      </div>
    );
  if (status === "done")
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "var(--color-success)",
          }}
        >
          You're in! 🎉
        </p>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
          Taking you to the app...
        </p>
      </div>
    );
  if (status === "error")
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "var(--color-danger)",
          }}
        >
          Invite error
        </p>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
          {errorMsg}
        </p>
      </div>
    );
  return (
    <div
      style={{
        padding: "32px 24px",
        textAlign: "center",
        color: "var(--color-text-secondary)",
      }}
    >
      Accepting invite...
    </div>
  );
}
