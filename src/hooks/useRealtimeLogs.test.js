import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRealtimeLogs } from "./useRealtimeLogs";

vi.mock("../lib/supabase", () => {
  const mockRows = [
    {
      id: "1",
      baby_id: "b1",
      timestamp: "2026-08-14T09:00:00Z",
      type: "wet",
      category: "diaper",
    },
    {
      id: "2",
      baby_id: "b1",
      timestamp: "2026-08-14T08:00:00Z",
      type: "bottle",
      category: "feeding",
    },
  ];
  let calls = 0;
  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        // The hook queries five tables in parallel. Return the two mock
        // rows for the first table only so the merged result is length 2.
        limit: vi.fn().mockImplementation(() => {
          calls += 1;
          return Promise.resolve({
            data: calls === 1 ? mockRows : [],
            error: null,
          });
        }),
      }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      }),
      removeChannel: vi.fn(),
    },
  };
});

describe("useRealtimeLogs", () => {
  it("returns logs and loading state", async () => {
    const { result } = renderHook(() => useRealtimeLogs("b1", 50));
    expect(result.current.loading).toBe(true);
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toHaveLength(2);
  });

  it("returns empty logs when babyId is null", async () => {
    const { result } = renderHook(() => useRealtimeLogs(null, 50));
    await act(async () => {});
    expect(result.current.logs).toHaveLength(0);
  });
});
