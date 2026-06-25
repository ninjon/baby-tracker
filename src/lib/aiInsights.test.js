import { describe, it, expect } from "vitest";
import {
  buildInsightsStats,
  buildClaudePrompt,
  INSIGHTS_SYSTEM,
} from "./aiInsights";

describe("buildInsightsStats", () => {
  it("converts sleep minutes to rounded hours and pulls feed numbers", () => {
    const stats = buildInsightsStats({
      babyName: "Sophie",
      days: 7,
      sleep: { avgMinutesPerDay: 845, longestStretchMinutes: 215 },
      feed: {
        feedsPerDay: 8.2,
        avgMlPerBottleFeed: 92,
        typeBreakdown: { breast: 10, bottle: 25 },
      },
    });
    expect(stats.babyName).toBe("Sophie");
    expect(stats.days).toBe(7);
    expect(stats.avgSleepHoursPerDay).toBe(14.1); // 845/60 = 14.08 → 14.1
    expect(stats.longestSleepStretchHours).toBe(3.6); // 215/60 = 3.58 → 3.6
    expect(stats.feedsPerDay).toBe(8.2);
    expect(stats.avgBottleMl).toBe(92);
    expect(stats.breastFeeds).toBe(10);
    expect(stats.bottleFeeds).toBe(25);
  });

  it("defaults gracefully when data is missing", () => {
    const stats = buildInsightsStats({ days: 7, sleep: {}, feed: {} });
    expect(stats.babyName).toBe("Baby");
    expect(stats.avgSleepHoursPerDay).toBe(0);
    expect(stats.feedsPerDay).toBe(0);
    expect(stats.breastFeeds).toBe(0);
  });
});

describe("buildClaudePrompt", () => {
  it("includes the baby name, day count, and the numbers", () => {
    const prompt = buildClaudePrompt({
      babyName: "Sophie",
      days: 7,
      avgSleepHoursPerDay: 14.1,
      longestSleepStretchHours: 3.6,
      feedsPerDay: 8.2,
      avgBottleMl: 92,
      breastFeeds: 10,
      bottleFeeds: 25,
    });
    expect(prompt).toMatch(/Sophie/);
    expect(prompt).toMatch(/7 days/);
    expect(prompt).toMatch(/14\.1/);
    expect(prompt).toMatch(/8\.2/);
    expect(prompt).toMatch(/92/);
  });
});

describe("INSIGHTS_SYSTEM", () => {
  it("instructs the model not to give medical/diagnostic advice", () => {
    expect(INSIGHTS_SYSTEM.toLowerCase()).toMatch(
      /medical|diagnos|pediatrician/,
    );
  });
});
