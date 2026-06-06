import { describe, it, expect } from "vitest";
import {
  timeSince,
  formatDuration,
  dayOfLife,
  pumpExpiry,
  computePumpTotal,
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
