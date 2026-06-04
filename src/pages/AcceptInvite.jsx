import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useBaby } from "../context/BabyContext";

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { session, setBaby } = useBaby();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState(null);

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

  if (status === "auth")
    return (
      <div
        style={{
          padding: "32px 24px",
          maxWidth: 400,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
          You're invited! 🎉
        </p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Sign in to accept your invite and join the family.
        </p>
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
