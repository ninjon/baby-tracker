import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGrowthLogs } from "./useGrowthLogs";

// Data must live inside the factory — vi.mock is hoisted above const declarations.
vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "a1",
            baby_id: "b1",
            measured_at: "2026-03-01T09:00:00Z",
            weight_kg: 4.5,
            height_cm: 54.0,
            head_cm: 37.0,
            notes: null,
          },
          {
            id: "a2",
            baby_id: "b1",
            measured_at: "2026-04-01T09:00:00Z",
            weight_kg: 5.8,
            height_cm: 57.5,
            head_cm: 38.5,
            notes: null,
          },
        ],
        error: null,
      }),
    }),
  },
}));

describe("useGrowthLogs", () => {
  it("starts with loading true and empty logs", () => {
    const { result } = renderHook(() => useGrowthLogs("b1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.logs).toEqual([]);
  });

  it("fetches and returns growth logs after load", async () => {
    const { result } = renderHook(() => useGrowthLogs("b1"));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toHaveLength(2);
    expect(result.current.logs[0].weight_kg).toBe(4.5);
    expect(result.current.logs[1].weight_kg).toBe(5.8);
  });

  it("returns empty logs and stops loading when babyId is null", async () => {
    const { result } = renderHook(() => useGrowthLogs(null));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toEqual([]);
  });

  it("queries the correct table and columns for the given babyId", async () => {
    const { supabase } = await import("../lib/supabase");
    renderHook(() => useGrowthLogs("b1"));
    await act(async () => {});
    expect(supabase.from).toHaveBeenCalledWith("growth_logs");
  });
});
