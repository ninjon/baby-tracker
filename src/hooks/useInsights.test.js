import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  aggregateSleepByDay,
  aggregateFeedByDay,
  useSleepInsights,
  useFeedInsights,
} from "./useInsights";

// ─── Pure aggregation logic ───────────────────────────────────────────────────

const TODAY = "2026-06-06";

const SLEEP_LOGS = [
  // Day 1 — two naps totalling 180 min; longest stretch 120
  {
    id: "s1",
    start_time: `${TODAY}T08:00:00Z`,
    end_time: `${TODAY}T10:00:00Z`,
    duration_minutes: 120,
  },
  {
    id: "s2",
    start_time: `${TODAY}T13:00:00Z`,
    end_time: `${TODAY}T14:00:00Z`,
    duration_minutes: 60,
  },
  // Day 2 — one sleep of 90 min
  {
    id: "s3",
    start_time: "2026-06-05T09:00:00Z",
    end_time: "2026-06-05T10:30:00Z",
    duration_minutes: 90,
  },
];

const FEED_LOGS = [
  { id: "f1", timestamp: `${TODAY}T08:00:00Z`, type: "bottle", amount_ml: 120 },
  {
    id: "f2",
    timestamp: `${TODAY}T11:00:00Z`,
    type: "breast",
    amount_ml: null,
  },
  { id: "f3", timestamp: `${TODAY}T14:00:00Z`, type: "bottle", amount_ml: 90 },
  {
    id: "f4",
    timestamp: "2026-06-05T09:00:00Z",
    type: "bottle",
    amount_ml: 100,
  },
];

describe("aggregateSleepByDay", () => {
  it("returns one bucket per unique day", () => {
    const result = aggregateSleepByDay(SLEEP_LOGS);
    expect(result.dailyTotals).toHaveLength(2);
  });

  it("sums duration_minutes correctly for a day with two sleeps", () => {
    const result = aggregateSleepByDay(SLEEP_LOGS);
    const day1 = result.dailyTotals.find((d) => d.date === TODAY);
    expect(day1.minutes).toBe(180);
  });

  it("calculates the longest single sleep stretch", () => {
    const result = aggregateSleepByDay(SLEEP_LOGS);
    expect(result.longestStretchMinutes).toBe(120);
  });

  it("calculates avg minutes per day", () => {
    const result = aggregateSleepByDay(SLEEP_LOGS);
    // (180 + 90) / 2 = 135
    expect(result.avgMinutesPerDay).toBe(135);
  });

  it("returns empty totals for empty input", () => {
    const result = aggregateSleepByDay([]);
    expect(result.dailyTotals).toEqual([]);
    expect(result.longestStretchMinutes).toBe(0);
    expect(result.avgMinutesPerDay).toBe(0);
  });
});

describe("aggregateFeedByDay", () => {
  it("returns one bucket per unique day", () => {
    const result = aggregateFeedByDay(FEED_LOGS);
    expect(result.dailyAmounts).toHaveLength(2);
  });

  it("sums bottle amount_ml per day", () => {
    const result = aggregateFeedByDay(FEED_LOGS);
    const day1 = result.dailyAmounts.find((d) => d.date === TODAY);
    expect(day1.amount_ml).toBe(210); // 120 + 90
  });

  it("counts breast vs bottle correctly", () => {
    const result = aggregateFeedByDay(FEED_LOGS);
    expect(result.typeBreakdown.bottle).toBe(3);
    expect(result.typeBreakdown.breast).toBe(1);
  });

  it("calculates total feeds per day", () => {
    const result = aggregateFeedByDay(FEED_LOGS);
    // 4 feeds over 2 days = 2 per day
    expect(result.feedsPerDay).toBe(2);
  });

  it("calculates average ml per bottle feed", () => {
    const result = aggregateFeedByDay(FEED_LOGS);
    // (120 + 90 + 100) / 3 = ~103.3
    expect(result.avgMlPerBottleFeed).toBeCloseTo(103.3, 0);
  });

  it("returns empty structure for empty input", () => {
    const result = aggregateFeedByDay([]);
    expect(result.dailyAmounts).toEqual([]);
    expect(result.typeBreakdown).toEqual({ breast: 0, bottle: 0 });
    expect(result.feedsPerDay).toBe(0);
    expect(result.avgMlPerBottleFeed).toBe(0);
  });
});

// ─── Hooks ───────────────────────────────────────────────────────────────────

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: table === "sleep_logs" ? SLEEP_LOGS : FEED_LOGS,
        error: null,
      }),
    })),
  },
}));

describe("useSleepInsights", () => {
  it("returns loading=true initially", () => {
    const { result } = renderHook(() => useSleepInsights("b1", 14));
    expect(result.current.loading).toBe(true);
  });

  it("returns aggregated sleep data after fetch", async () => {
    const { result } = renderHook(() => useSleepInsights("b1", 14));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.dailyTotals.length).toBeGreaterThan(0);
    expect(typeof result.current.longestStretchMinutes).toBe("number");
    expect(typeof result.current.avgMinutesPerDay).toBe("number");
  });
});

describe("useFeedInsights", () => {
  it("returns loading=true initially", () => {
    const { result } = renderHook(() => useFeedInsights("b1", 14));
    expect(result.current.loading).toBe(true);
  });

  it("returns aggregated feed data after fetch", async () => {
    const { result } = renderHook(() => useFeedInsights("b1", 14));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.dailyAmounts.length).toBeGreaterThan(0);
    expect(typeof result.current.feedsPerDay).toBe("number");
  });
});
