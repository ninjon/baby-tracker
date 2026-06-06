import { useState } from "react";
import { useBaby } from "../../context/BabyContext";
import { useSleepInsights, useFeedInsights } from "../../hooks/useInsights";
import InsightCard from "../../components/charts/InsightCard";
import SleepDurationChart from "../../components/charts/SleepDurationChart";
import SleepTimeChart from "../../components/charts/SleepTimeChart";
import FeedBreakdownChart from "../../components/charts/FeedBreakdownChart";
import FeedAmountChart from "../../components/charts/FeedAmountChart";

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

function StatPill({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: "var(--color-surface-raised, #f8fafc)",
        borderRadius: 10,
        padding: "10px 8px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          margin: 0,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-secondary)",
          margin: "2px 0 0",
        }}
      >
        {label}
      </p>
    </div>
  );
}

export default function InsightsTab() {
  const { baby } = useBaby();
  const [days, setDays] = useState(14);

  const sleep = useSleepInsights(baby?.id, days);
  const feed = useFeedInsights(baby?.id, days);

  const avgSleepHours =
    sleep.avgMinutesPerDay > 0
      ? `${Math.round((sleep.avgMinutesPerDay / 60) * 10) / 10}h`
      : "—";
  const longestStretchHours =
    sleep.longestStretchMinutes > 0
      ? `${Math.round((sleep.longestStretchMinutes / 60) * 10) / 10}h`
      : "—";
  const feedsPerDay = feed.feedsPerDay > 0 ? feed.feedsPerDay : "—";
  const avgBottleMl =
    feed.avgMlPerBottleFeed > 0 ? `${feed.avgMlPerBottleFeed} ml` : "—";

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* Date range toggle */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {RANGE_OPTIONS.map(({ label, days: d }) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              flex: 1,
              padding: "6px 0",
              borderRadius: 8,
              border: "1.5px solid",
              borderColor:
                days === d
                  ? "var(--color-accent)"
                  : "var(--color-border, #e2e8f0)",
              background: days === d ? "var(--color-accent)" : "transparent",
              color: days === d ? "#fff" : "var(--color-text-primary)",
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary stat pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <StatPill label="Avg sleep/day" value={avgSleepHours} />
        <StatPill label="Longest stretch" value={longestStretchHours} />
        <StatPill label="Feeds/day" value={feedsPerDay} />
        <StatPill label="Avg bottle" value={avgBottleMl} />
      </div>

      {/* Sleep section */}
      <InsightCard
        title="Sleep duration"
        subtitle={`Daily totals — last ${days} days`}
      >
        <SleepDurationChart data={sleep.dailyTotals} />
      </InsightCard>

      <InsightCard title="Sleep trend" subtitle="Hours per day over time">
        <SleepTimeChart
          data={sleep.dailyTotals}
          longestStretchMinutes={sleep.longestStretchMinutes}
        />
      </InsightCard>

      {/* Feed section */}
      <InsightCard title="Feed type breakdown" subtitle="Breast vs bottle">
        <FeedBreakdownChart typeBreakdown={feed.typeBreakdown} />
      </InsightCard>

      <InsightCard
        title="Bottle intake"
        subtitle={`Daily ml — last ${days} days`}
      >
        <FeedAmountChart data={feed.dailyAmounts} />
      </InsightCard>
    </div>
  );
}
