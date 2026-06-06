import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHealthLogs } from "./useHealthLogs";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "h1",
            baby_id: "b1",
            timestamp: "2026-06-05T10:00:00Z",
            entry_type: "fever",
            temperature_celsius: 38.5,
            medication_name: null,
            medication_dose: null,
            visit_type: null,
            doctor_name: null,
            diagnosis: null,
            notes: "Fussy, warm forehead",
          },
          {
            id: "h2",
            baby_id: "b1",
            timestamp: "2026-06-04T14:00:00Z",
            entry_type: "medication",
            temperature_celsius: null,
            medication_name: "Paracetamol",
            medication_dose: "2.5ml",
            visit_type: null,
            doctor_name: null,
            diagnosis: null,
            notes: null,
          },
        ],
        error: null,
      }),
    }),
  },
}));

describe("useHealthLogs", () => {
  it("starts with loading true and empty logs", () => {
    const { result } = renderHook(() => useHealthLogs("b1"));
    expect(result.current.loading).toBe(true);
    expect(result.current.logs).toEqual([]);
  });

  it("fetches and returns health logs after load", async () => {
    const { result } = renderHook(() => useHealthLogs("b1"));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toHaveLength(2);
    expect(result.current.logs[0].entry_type).toBe("fever");
    expect(result.current.logs[1].entry_type).toBe("medication");
  });

  it("returns empty logs and stops loading when babyId is null", async () => {
    const { result } = renderHook(() => useHealthLogs(null));
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toEqual([]);
  });

  it("queries the health_logs table", async () => {
    const { supabase } = await import("../lib/supabase");
    renderHook(() => useHealthLogs("b1"));
    await act(async () => {});
    expect(supabase.from).toHaveBeenCalledWith("health_logs");
  });
});
