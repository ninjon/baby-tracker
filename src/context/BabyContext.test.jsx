import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

import { BabyProvider, useBaby } from "./BabyContext";

function TestConsumer() {
  const { session, loading } = useBaby();
  if (loading) return <div>Loading...</div>;
  return <div>{session ? "logged-in" : "logged-out"}</div>;
}

describe("BabyContext", () => {
  it("shows loading initially then logged-out when no session", async () => {
    render(
      <BabyProvider>
        <TestConsumer />
      </BabyProvider>,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("logged-out")).toBeInTheDocument(),
    );
  });
});
