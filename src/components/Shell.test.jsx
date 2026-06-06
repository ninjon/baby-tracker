import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Shell from "./Shell";

vi.mock("../context/LoggerContext", () => ({
  useLogger: vi.fn().mockReturnValue({ logger: "Darren" }),
}));

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      select: vi.fn().mockReturnThis(),
    }),
  },
}));

describe("Shell", () => {
  function renderShell(path = "/") {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Shell babyId="baby-1" />
      </MemoryRouter>,
    );
  }

  it("renders bottom nav with 5 items", () => {
    renderShell();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders FAB + button", () => {
    renderShell();
    expect(screen.getByRole("button", { name: /log/i })).toBeInTheDocument();
  });

  it("opens LogSheet when FAB is tapped", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: /log/i }));
    expect(screen.getByText("Feeding")).toBeInTheDocument();
  });
});
