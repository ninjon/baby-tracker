import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Family from "./Family";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
    session: { user: { id: "u1" } },
  }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "m1",
            user_id: "u1",
            role: "owner",
            accepted_at: new Date().toISOString(),
            users: { email: "owner@test.com" },
          },
        ],
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
    },
  },
}));

function renderFamily() {
  return render(
    <MemoryRouter>
      <Family />
    </MemoryRouter>,
  );
}

describe("Family", () => {
  it("renders Family heading", () => {
    renderFamily();
    expect(screen.getByText("Family")).toBeInTheDocument();
  });

  it("shows invite link section", () => {
    renderFamily();
    expect(screen.getByText(/Invite someone/i)).toBeInTheDocument();
  });
});
