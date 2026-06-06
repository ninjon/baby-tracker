import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVaccineRecords } from "./useVaccineRecords";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "v1",
            baby_id: "b1",
            vaccine_id: "bcg",
            administered_at: "2026-01-15",
            batch_number: "BCG2026",
            clinic: "KKH",
            notes: null,
          },
        ],
        error: null,
      }),
    }),
  },
}));

describe("useVaccineRecords", () => {
  it("starts with loading true and empty records", () => {
    const { result } = renderHook(() => useVaccineRecords("b1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.records).toEqual([]);
  });

  it("fetches and returns vaccine records after load", async () => {
    const { result } = renderHook(() => useVaccineRecords("b1"));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0].vaccine_id).toBe("bcg");
  });

  it("returns empty records and stops loading when babyId is null", async () => {
    const { result } = renderHook(() => useVaccineRecords(null));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.records).toEqual([]);
  });

  it("queries the vaccine_records table", async () => {
    const { supabase } = await import("../lib/supabase");
    renderHook(() => useVaccineRecords("b1"));
    await act(async () => {});
    expect(supabase.from).toHaveBeenCalledWith("vaccine_records");
  });
});
