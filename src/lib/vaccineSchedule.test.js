import { describe, it, expect } from "vitest";
import { getDueDate, VACCINE_SCHEDULE } from "./vaccineSchedule";

// Sophie's DOB used across tests
const DOB = new Date("2026-01-15");

describe("VACCINE_SCHEDULE", () => {
  it("contains 17 entries covering birth through 18 months", () => {
    expect(VACCINE_SCHEDULE).toHaveLength(17);
  });

  it("every entry has id, name, dueAge, and mandatory fields", () => {
    for (const v of VACCINE_SCHEDULE) {
      expect(v).toHaveProperty("id");
      expect(v).toHaveProperty("name");
      expect(v).toHaveProperty("dueAge");
      expect(v).toHaveProperty("mandatory");
    }
  });

  it("first two entries are due at birth (days: 0)", () => {
    const birthVaccines = VACCINE_SCHEDULE.filter(
      (v) => "days" in v.dueAge && v.dueAge.days === 0,
    );
    expect(birthVaccines.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getDueDate", () => {
  it("returns the DOB itself for a birth vaccine (days: 0)", () => {
    const bcg = VACCINE_SCHEDULE.find((v) => v.id === "bcg");
    const due = getDueDate(bcg, DOB);
    expect(due.getFullYear()).toBe(2026);
    expect(due.getMonth()).toBe(0); // January
    expect(due.getDate()).toBe(15);
  });

  it("returns 1 month after DOB for Hepatitis B dose 2", () => {
    const hepb2 = VACCINE_SCHEDULE.find((v) => v.id === "hepb_2");
    const due = getDueDate(hepb2, DOB);
    expect(due.getFullYear()).toBe(2026);
    expect(due.getMonth()).toBe(1); // February
    expect(due.getDate()).toBe(15);
  });

  it("returns 18 months after DOB for the 18-month boosters", () => {
    const dtapBooster = VACCINE_SCHEDULE.find((v) => v.id === "dtap_booster");
    const due = getDueDate(dtapBooster, DOB);
    expect(due.getFullYear()).toBe(2027);
    expect(due.getMonth()).toBe(6); // July (Jan + 18 months)
    expect(due.getDate()).toBe(15);
  });

  it("returns 12 months after DOB for MMR dose 1", () => {
    const mmr1 = VACCINE_SCHEDULE.find((v) => v.id === "mmr_1");
    const due = getDueDate(mmr1, DOB);
    expect(due.getFullYear()).toBe(2027);
    expect(due.getMonth()).toBe(0); // January
    expect(due.getDate()).toBe(15);
  });
});
