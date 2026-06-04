import { useState, useEffect } from "react";
import { useBaby } from "../context/BabyContext";
import { supabase } from "../lib/supabase";

const ROLE_LABELS = {
  owner: "Owner",
  parent: "Parent",
  viewer: "Viewer (read-only)",
};

export default function Family() {
  const { baby } = useBaby();
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteRole, setInviteRole] = useState("parent");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!baby?.id) return;
    supabase
      .from("family_members")
      .select("*, users:user_id(email)")
      .eq("baby_id", baby.id)
      .order("invited_at")
      .then(({ data }) => setMembers(data ?? []));
  }, [baby?.id]);

  async function generateInvite() {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        baby_id: baby.id,
        user_id: null,
        role: inviteRole,
        invited_at: new Date().toISOString(),
      })
      .select("invite_token")
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setInviteLink(`${window.location.origin}/invite/${data.invite_token}`);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btnBase = {
    width: "100%",
    padding: 14,
    background: "var(--color-accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-button)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    minHeight: "var(--tap-min-height)",
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Family
      </h2>

      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        Members
      </p>
      {members.map((m) => (
        <div
          key={m.id}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            padding: "12px 14px",
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {m.users?.email ?? "Pending invite"}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              {ROLE_LABELS[m.role]}
            </div>
          </div>
          {!m.accepted_at && (
            <span style={{ fontSize: 11, color: "var(--color-warning)" }}>
              Pending
            </span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          Invite someone
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 10,
          }}
        >
          Role for this invite:
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {["parent", "viewer"].map((role) => (
            <button
              key={role}
              onClick={() => setInviteRole(role)}
              style={{
                padding: "12px",
                borderRadius: "var(--radius-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "var(--tap-min-height)",
                background:
                  inviteRole === role
                    ? "var(--color-accent)"
                    : "var(--color-surface)",
                color:
                  inviteRole === role ? "#fff" : "var(--color-text-primary)",
                border: `1.5px solid ${inviteRole === role ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              {role === "parent" ? "✏️ Parent" : "👁 Viewer"}
            </button>
          ))}
        </div>
        <button onClick={generateInvite} style={btnBase}>
          Generate invite link
        </button>
        {error && (
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "var(--color-danger)",
            }}
          >
            Couldn't create invite: {error}
          </p>
        )}
        {inviteLink && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "var(--color-accent-light)",
              border: "1px solid #F5D5C5",
              borderRadius: "var(--radius-card)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              Share this link (single-use):
            </p>
            <div
              style={{
                fontSize: 12,
                wordBreak: "break-all",
                marginBottom: 10,
                color: "var(--color-text-primary)",
              }}
            >
              {inviteLink}
            </div>
            <button
              onClick={copyLink}
              style={{
                ...btnBase,
                background: copied
                  ? "var(--color-success)"
                  : "var(--color-accent)",
              }}
            >
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
