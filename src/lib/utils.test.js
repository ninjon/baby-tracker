import { describe, it, expect } from "vitest";
import {
  timeSince,
  formatDuration,
  dayOfLife,
  pumpExpiry,
  computePumpTotal,
  summarizeToday,
  nextBreastSide,
  summarizeRange,
} from "./utils";

describe("timeSince", () => {
  it("returns minutes when under an hour", () => {
    const past = new Date("2026-06-04T09:00:00");
    const now = new Date("2026-06-04T09:42:00");
    expect(timeSince(past, now)).toBe("42m");
  });

  it("returns hours and minutes when over an hour", () => {
    const past = new Date("2026-06-04T07:00:00");
    const now = new Date("2026-06-04T09:25:00");
    expect(timeSince(past, now)).toBe("2h 25m");
  });

  it("returns only hours when exactly on the hour", () => {
    const past = new Date("2026-06-04T07:00:00");
    const now = new Date("2026-06-04T09:00:00");
    expect(timeSince(past, now)).toBe("2h");
  });
});

describe("formatDuration", () => {
  it('formats 45 minutes as "45m"', () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it('formats 105 minutes as "1h 45m"', () => {
    expect(formatDuration(105)).toBe("1h 45m");
  });

  it('formats 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe("1h");
  });
});

describe("dayOfLife", () => {
  it('returns "Day 1" on the birth date', () => {
    const dob = new Date("2026-08-13");
    expect(dayOfLife(dob, new Date("2026-08-13"))).toBe("Day 1");
  });

  it('returns "Day 14" after 13 days', () => {
    const dob = new Date("2026-08-13");
    expect(dayOfLife(dob, new Date("2026-08-26"))).toBe("Day 14");
  });

  it('returns "Xd to go" before birth', () => {
    const dob = new Date("2026-08-13");
    expect(dayOfLife(dob, new Date("2026-06-06"))).toBe("68d to go");
  });
});

describe("pumpExpiry", () => {
  it("returns 4 days later for fridge", () => {
    const label = new Date("2026-09-01");
    const expiry = pumpExpiry("fridge", label);
    expect(expiry).toEqual(new Date("2026-09-05"));
  });

  it("returns 6 months later for freezer", () => {
    const label = new Date("2026-09-01");
    const expiry = pumpExpiry("freezer", label);
    expect(expiry).toEqual(new Date("2027-03-01"));
  });

  it("returns null for feed_now", () => {
    expect(pumpExpiry("feed_now", new Date())).toBeNull();
  });
});

describe("computePumpTotal", () => {
  it("sums left and right", () => {
    expect(computePumpTotal(60, 40)).toBe(100);
  });

  it("treats null as 0", () => {
    expect(computePumpTotal(null, 75)).toBe(75);
    expect(computePumpTotal(50, null)).toBe(50);
  });
});

describe("summarizeToday", () => {
  const now = new Date("2026-08-20T15:00:00");
  const todayAt = (h, m = 0) =>
    new Date(
      `2026-08-20T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
    ).toISOString();
  const yesterday = new Date("2026-08-19T12:00:00").toISOString();

  it("counts today's feeds and sums bottle ml", () => {
    const logs = [
      {
        category: "feeding",
        type: "bottle",
        amount_ml: 90,
        timestamp: todayAt(8),
      },
      {
        category: "feeding",
        type: "breast",
        side: "left",
        timestamp: todayAt(11),
      },
      {
        category: "feeding",
        type: "bottle",
        amount_ml: 60,
        timestamp: todayAt(14),
      },
      {
        category: "feeding",
        type: "bottle",
        amount_ml: 100,
        timestamp: yesterday,
      },
    ];
    const r = summarizeToday(logs, now);
    expect(r.feeds).toBe(3);
    expect(r.bottleMl).toBe(150);
  });

  it("counts wet and dirty diapers, with 'both' counting as each", () => {
    const logs = [
      { category: "diaper", type: "wet", timestamp: todayAt(7) },
      { category: "diaper", type: "dirty", timestamp: todayAt(9) },
      { category: "diaper", type: "both", timestamp: todayAt(12) },
      { category: "diaper", type: "wet", timestamp: yesterday },
    ];
    const r = summarizeToday(logs, now);
    expect(r.wet).toBe(2);
    expect(r.dirty).toBe(2);
  });

  it("returns zeros when there is no data today", () => {
    expect(summarizeToday([], now)).toEqual({
      feeds: 0,
      wet: 0,
      dirty: 0,
      bottleMl: 0,
    });
  });
});

describe("nextBreastSide", () => {
  it("suggests the opposite of the most recent breast feed", () => {
    const logs = [
      {
        category: "feeding",
        type: "breast",
        side: "left",
        timestamp: "2026-08-20T11:00:00Z",
      },
      {
        category: "feeding",
        type: "breast",
        side: "right",
        timestamp: "2026-08-20T08:00:00Z",
      },
    ];
    expect(nextBreastSide(logs)).toBe("right");
  });

  it("ignores bottle feeds when finding the last side", () => {
    const logs = [
      {
        category: "feeding",
        type: "bottle",
        amount_ml: 90,
        timestamp: "2026-08-20T12:00:00Z",
      },
      {
        category: "feeding",
        type: "breast",
        side: "right",
        timestamp: "2026-08-20T09:00:00Z",
      },
    ];
    expect(nextBreastSide(logs)).toBe("left");
  });

  it("returns null when last side was 'both' or there is no breast feed", () => {
    expect(
      nextBreastSide([
        {
          category: "feeding",
          type: "breast",
          side: "both",
          timestamp: "2026-08-20T09:00:00Z",
        },
      ]),
    ).toBeNull();
    expect(nextBreastSide([])).toBeNull();
  });
});

describe("summarizeRange", () => {
  const now = new Date("2026-08-20T15:00:00");

  it("buckets logs into days, newest first", () => {
    const logs = [
      {
        category: "feeding",
        type: "bottle",
        amount_ml: 90,
        timestamp: "2026-08-20T08:00:00",
      },
      { category: "diaper", type: "both", timestamp: "2026-08-20T09:00:00" },
      {
        category: "sleep",
        duration_minutes: 120,
        start_time: "2026-08-19T22:00:00",
      },
    ];
    const rows = summarizeRange(logs, 7, now);
    expect(rows).toHaveLength(7);
    expect(rows[0].date).toBe("2026-08-20");
    expect(rows[0].feeds).toBe(1);
    expect(rows[0].bottleMl).toBe(90);
    expect(rows[0].wet).toBe(1);
    expect(rows[0].dirty).toBe(1);
    expect(rows[1].date).toBe("2026-08-19");
    expect(rows[1].sleepMinutes).toBe(120);
  });

  it("ignores logs outside the requested range", () => {
    const logs = [
      {
        category: "feeding",
        type: "bottle",
        amount_ml: 50,
        timestamp: "2026-08-01T08:00:00",
      },
    ];
    const rows = summarizeRange(logs, 7, now);
    expect(rows.every((r) => r.feeds === 0)).toBe(true);
  });
});
