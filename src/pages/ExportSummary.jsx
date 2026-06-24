import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useBaby } from "../context/BabyContext";
import { useRealtimeLogs } from "../hooks/useRealtimeLogs";
import { summarizeRange } from "../lib/utils";
import { ChevronRightIcon } from "../components/Icons";

const DAYS = 7;

function dayLabel(dateKey) {
  return format(new Date(`${dateKey}T00:00:00`), "EEE d MMM");
}

function sleepHours(minutes) {
  return Math.round((minutes / 60) * 10) / 10;
}

function buildText(babyName, rows) {
  const lines = [`${babyName} — last ${rows.length} days`, ""];
  for (const r of rows) {
    const bottle = r.bottleMl ? ` (${r.bottleMl}ml)` : "";
    lines.push(
      `${dayLabel(r.date)}: ${r.feeds} feeds${bottle}, ${r.wet} pee / ${r.dirty} poop, ${sleepHours(r.sleepMinutes)}h sleep`,
    );
  }
  return lines.join("\n");
}

export default function ExportSummary() {
  const { baby } = useBaby();
  const { logs, loading } = useRealtimeLogs(baby?.id, 400);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const rows = summarizeRange(logs, DAYS);
  const totals = rows.reduce(
    (acc, r) => ({
      feeds: acc.feeds + r.feeds,
      bottleMl: acc.bottleMl + r.bottleMl,
      wet: acc.wet + r.wet,
      dirty: acc.dirty + r.dirty,
      sleepMinutes: acc.sleepMinutes + r.sleepMinutes,
    }),
    { feeds: 0, bottleMl: 0, wet: 0, dirty: 0, sleepMinutes: 0 },
  );

  const summaryText = buildText(baby?.name ?? "Baby", rows);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — Share is the fallback
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${baby?.name ?? "Baby"} — last ${DAYS} days`,
          text: summaryText,
        });
      } catch {
        // user cancelled or share failed — no-op
      }
    } else {
      handleCopy();
    }
  }

  const cell = { flex: 1, textAlign: "center", fontSize: 13 };
  const headCell = {
    ...cell,
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
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
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 400,
            margin: 0,
          }}
        >
          Last {DAYS} days
        </h1>
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          marginBottom: 16,
        }}
      >
        A quick summary to show or send at a check-up.
      </p>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: 24,
            color: "var(--color-text-secondary)",
          }}
        >
          Loading...
        </div>
      )}

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          padding: "8px 12px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "6px 0",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ ...headCell, flex: 1.4, textAlign: "left" }}>Day</div>
          <div style={headCell}>Feeds</div>
          <div style={headCell}>Bottle</div>
          <div style={headCell}>Pee</div>
          <div style={headCell}>Poop</div>
          <div style={headCell}>Sleep</div>
        </div>

        {rows.map((r) => (
          <div
            key={r.date}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "9px 0",
              borderBottom: "1px solid var(--color-bg)",
            }}
          >
            <div style={{ flex: 1.4, fontSize: 12, fontWeight: 600 }}>
              {dayLabel(r.date)}
            </div>
            <div style={cell}>{r.feeds}</div>
            <div style={cell}>{r.bottleMl ? `${r.bottleMl}` : "—"}</div>
            <div style={cell}>{r.wet}</div>
            <div style={cell}>{r.dirty}</div>
            <div style={cell}>
              {r.sleepMinutes ? `${sleepHours(r.sleepMinutes)}h` : "—"}
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 0 4px",
            fontWeight: 700,
          }}
        >
          <div style={{ flex: 1.4, fontSize: 12 }}>Total</div>
          <div style={cell}>{totals.feeds}</div>
          <div style={cell}>{totals.bottleMl ? `${totals.bottleMl}` : "—"}</div>
          <div style={cell}>{totals.wet}</div>
          <div style={cell}>{totals.dirty}</div>
          <div style={cell}>
            {totals.sleepMinutes ? `${sleepHours(totals.sleepMinutes)}h` : "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            padding: 14,
            background: "var(--color-surface)",
            color: "var(--color-accent)",
            border: "1.5px solid var(--color-accent)",
            borderRadius: "var(--radius-button)",
            fontSize: 15,
            fontWeight: 700,
            minHeight: "var(--tap-min-height)",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            padding: 14,
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-button)",
            fontSize: 15,
            fontWeight: 700,
            minHeight: "var(--tap-min-height)",
            cursor: "pointer",
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
}
