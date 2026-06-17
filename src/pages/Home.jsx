import { useNavigate, useOutletContext } from "react-router-dom";
import { useBaby } from "../context/BabyContext";
import { useLogger } from "../context/LoggerContext";
import { useRealtimeLogs } from "../hooks/useRealtimeLogs";
import { useSleepInsights, useFeedInsights } from "../hooks/useInsights";
import {
  timeSince,
  dayOfLife,
  summarizeToday,
  nextBreastSide,
} from "../lib/utils";
import { supabase } from "../lib/supabase";
import {
  BottleIcon,
  DropletIcon,
  MoonIcon,
  RulerIcon,
  ChevronRightIcon,
} from "../components/Icons";

const QUICK_LOG_BUTTONS = [
  { category: "feeding", label: "Feeding", Icon: BottleIcon },
  { category: "diaper", label: "Diaper", Icon: DropletIcon },
  { category: "sleep", label: "Sleep", Icon: MoonIcon },
  { category: "growth", label: "Growth", Icon: RulerIcon },
];

const FEED_URGENT_MS = 3 * 3600000;
const DIAPER_URGENT_MS = 4 * 3600000;
const INSIGHTS_DAYS = 7;

export default function Home() {
  const { baby } = useBaby();
  const { logger, switchLogger, LOGGERS } = useLogger();
  const { openLog } = useOutletContext() ?? {};
  const { logs } = useRealtimeLogs(baby?.id, 50);
  const navigate = useNavigate();

  const sleep = useSleepInsights(baby?.id, INSIGHTS_DAYS);
  const feed = useFeedInsights(baby?.id, INSIGHTS_DAYS);

  const insightParts = [];
  if (sleep.avgMinutesPerDay > 0) {
    insightParts.push(
      `${Math.round((sleep.avgMinutesPerDay / 60) * 10) / 10}h sleep/day`,
    );
  }
  if (feed.feedsPerDay > 0) insightParts.push(`${feed.feedsPerDay} feeds/day`);
  if (feed.avgMlPerBottleFeed > 0) {
    insightParts.push(`${feed.avgMlPerBottleFeed}ml/bottle`);
  }
  const insightsSummary =
    insightParts.length > 0
      ? insightParts.join(" · ")
      : "Keep logging to see sleep & feed trends.";

  const lastFeed = logs.find((l) => l.category === "feeding");
  const lastDiaper = logs.find((l) => l.category === "diaper");
  const activeSleep = logs.find((l) => l.category === "sleep" && !l.end_time);
  const lastSleep = logs.find((l) => l.category === "sleep" && l.end_time);

  const today = summarizeToday(logs);
  const nextSide = nextBreastSide(logs);

  async function endSleep() {
    if (!activeSleep) return;
    const end = new Date();
    const durationMinutes = Math.round(
      (end - new Date(activeSleep.start_time)) / 60000,
    );
    await supabase
      .from("sleep_logs")
      .update({
        end_time: end.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq("id", activeSleep.id);
    // Realtime pushes the change back and the card flips to "Awake".
  }

  const dob = baby ? new Date(baby.date_of_birth) : null;

  return (
    <div style={{ padding: "16px", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            Today
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              fontWeight: 400,
            }}
          >
            {baby?.name} · {dob ? dayOfLife(dob) : "—"}
          </div>
        </div>
        {/* Initials avatar */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {baby?.name?.[0] ?? "S"}
        </div>
      </div>

      {/* Logger switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginRight: 4,
          }}
        >
          Logging as
        </span>
        {LOGGERS.map((name) => (
          <button
            key={name}
            onClick={() => switchLogger(name)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor:
                logger === name ? "var(--color-accent)" : "var(--color-border)",
              background:
                logger === name
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color: logger === name ? "#fff" : "var(--color-text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition:
                "background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Status cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <StatusCard
          label="Fed"
          value={lastFeed ? timeSince(new Date(lastFeed.timestamp)) : "—"}
          sub={lastFeed ? "ago" : ""}
          urgent={
            lastFeed &&
            Date.now() - new Date(lastFeed.timestamp) > FEED_URGENT_MS
          }
        />
        <StatusCard
          label="Diaper"
          value={lastDiaper ? timeSince(new Date(lastDiaper.timestamp)) : "—"}
          sub={lastDiaper ? "ago" : ""}
          urgent={
            lastDiaper &&
            Date.now() - new Date(lastDiaper.timestamp) > DIAPER_URGENT_MS
          }
        />
        {activeSleep ? (
          <StatusCard
            label="Sleeping"
            value={timeSince(new Date(activeSleep.start_time))}
            sub="tap to end"
            onClick={() => {
              if (window.confirm("End this sleep now?")) endSleep();
            }}
          />
        ) : (
          <StatusCard
            label="Awake"
            value={lastSleep ? timeSince(new Date(lastSleep.end_time)) : "—"}
            sub={lastSleep ? "since" : ""}
          />
        )}
      </div>

      {/* Today so far — running daily totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          padding: "12px 8px",
          marginBottom: 20,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <TodayStat value={today.feeds} label="feeds" />
        <TodayStat value={`${today.bottleMl}`} label="ml bottle" />
        <TodayStat value={today.wet} label="wet" />
        <TodayStat value={today.dirty} label="dirty" />
      </div>

      {/* Quick log */}
      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        Quick Log
      </div>
      {nextSide && (
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 10,
            marginTop: -2,
          }}
        >
          Breast: start on{" "}
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
            {nextSide === "left" ? "Left" : "Right"}
          </span>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {QUICK_LOG_BUTTONS.map((btn) => {
          const isPrimary = btn.category === "feeding";
          return (
            <button
              key={btn.category}
              onClick={() => openLog?.(btn.category)}
              style={{
                padding: "14px 16px",
                background: isPrimary
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
                color: isPrimary ? "#fff" : "var(--color-text-primary)",
                border: isPrimary ? "none" : "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                fontSize: 15,
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
                minHeight: "var(--tap-min-height)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: isPrimary ? "none" : "var(--shadow-card)",
              }}
            >
              <btn.Icon
                size={18}
                color={isPrimary ? "#fff" : "var(--color-accent)"}
              />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Insights summary — taps through to Health → Insights */}
      <button
        onClick={() => navigate("/health?tab=insights")}
        style={{
          width: "100%",
          background: "var(--color-accent-light)",
          border: "1px solid #F5D5C5",
          borderRadius: "var(--radius-card)",
          padding: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 16 }} aria-hidden="true">
          ✨
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#C06030",
              marginBottom: 2,
            }}
          >
            Insights · last {INSIGHTS_DAYS} days
          </div>
          <div style={{ fontSize: 12, color: "#7A4030", lineHeight: 1.4 }}>
            {insightsSummary}
          </div>
        </div>
        <ChevronRightIcon size={16} color="#C06030" />
      </button>
    </div>
  );
}

function StatusCard({ label, value, sub, urgent, onClick }) {
  const cardStyle = {
    width: "100%",
    background: "var(--color-surface)",
    border: `1px solid ${urgent ? "var(--color-warning)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-card)",
    padding: 10,
    textAlign: "center",
    boxShadow: "var(--shadow-card)",
    cursor: onClick ? "pointer" : "default",
    font: "inherit",
    color: "inherit",
  };
  const inner = (
    <>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: urgent ? "var(--color-warning)" : "var(--color-text-primary)",
          marginTop: 2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--color-accent)" }}>{sub}</div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={cardStyle}>
        {inner}
      </button>
    );
  }
  return <div style={cardStyle}>{inner}</div>;
}

function TodayStat({ value, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--color-text-primary)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginTop: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}
