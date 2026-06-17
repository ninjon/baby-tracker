import { describe, it, expect, beforeEach, vi } from "vitest";
import { getQueue, enqueue, clearQueue, flushQueue } from "./offlineQueue";

describe("offlineQueue", () => {
  beforeEach(() => localStorage.clear());

  it("enqueues and reads items", () => {
    enqueue({
      tempId: "t1",
      table: "feeding_logs",
      category: "feeding",
      row: { baby_id: "b1", amount_ml: 90 },
    });
    const q = getQueue();
    expect(q).toHaveLength(1);
    expect(q[0].table).toBe("feeding_logs");
  });

  it("returns an empty array when storage is empty or malformed", () => {
    expect(getQueue()).toEqual([]);
    localStorage.setItem("offline_log_queue", "not json");
    expect(getQueue()).toEqual([]);
  });

  it("flushes successful inserts and keeps failures queued", async () => {
    enqueue({
      tempId: "t1",
      table: "feeding_logs",
      category: "feeding",
      row: { baby_id: "b1" },
    });
    enqueue({
      tempId: "t2",
      table: "diaper_logs",
      category: "diaper",
      row: { baby_id: "b1" },
    });

    const supabase = {
      from: vi.fn((table) => ({
        insert: vi.fn().mockResolvedValue({
          error: table === "diaper_logs" ? { message: "boom" } : null,
        }),
      })),
    };

    const res = await flushQueue(supabase);
    expect(res.flushed).toBe(1);
    expect(getQueue()).toHaveLength(1);
    expect(getQueue()[0].table).toBe("diaper_logs");
  });

  it("clears the queue", () => {
    enqueue({ tempId: "t1", table: "feeding_logs", row: {} });
    clearQueue();
    expect(getQueue()).toEqual([]);
  });
});
