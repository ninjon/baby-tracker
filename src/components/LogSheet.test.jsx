import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogSheet from "./LogSheet";

vi.mock("../context/LoggerContext", () => ({
  useLogger: vi.fn().mockReturnValue({ logger: "Darren" }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
    }),
  },
}));

describe("LogSheet", () => {
  it("shows category picker when open with no preselected category", () => {
    render(
      <LogSheet
        open
        babyId="baby-1"
        category={null}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText("Feeding")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Pump")).toBeInTheDocument();
  });

  it('shows FeedingForm directly when category="feeding"', () => {
    render(
      <LogSheet
        open
        babyId="baby-1"
        category="feeding"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText("Breast")).toBeInTheDocument();
    expect(screen.getByText("Bottle")).toBeInTheDocument();
  });

  it('shows DiaperForm directly when category="diaper"', () => {
    render(
      <LogSheet
        open
        babyId="baby-1"
        category="diaper"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText("Wet")).toBeInTheDocument();
  });
});
