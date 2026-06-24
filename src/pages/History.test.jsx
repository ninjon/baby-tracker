import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import History from "./History";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

vi.mock("../hooks/useRealtimeLogs", () => {
  const now = new Date();
  const mockLogs = [
    {
      id: "1",
      category: "feeding",
      type: "bottle",
      amount_ml: 90,
      timestamp: now.toISOString(),
      sortTime: now.toISOString(),
      logged_by: "u1",
    },
    {
      id: "2",
      category: "diaper",
      type: "wet",
      timestamp: now.toISOString(),
      sortTime: now.toISOString(),
      logged_by: "u1",
    },
    {
      id: "3",
      category: "sleep",
      start_time: now.toISOString(),
      end_time: now.toISOString(),
      duration_minutes: 90,
      sortTime: now.toISOString(),
      logged_by: "u1",
    },
  ];
  return {
    useRealtimeLogs: vi
      .fn()
      .mockReturnValue({ logs: mockLogs, loading: false }),
  };
});

function renderHistory() {
  return render(
    <MemoryRouter>
      <History />
    </MemoryRouter>,
  );
}

describe("History", () => {
  it("renders filter chips", () => {
    renderHistory();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
  });

  it("shows all logs by default", () => {
    renderHistory();
    expect(screen.getByText(/Bottle · 90ml/)).toBeInTheDocument();
    expect(screen.getByText(/Pee diaper/)).toBeInTheDocument();
  });

  it("filters to feeding only when Feed chip is tapped", async () => {
    renderHistory();
    await userEvent.click(screen.getByText("Feed"));
    expect(screen.getByText(/Bottle · 90ml/)).toBeInTheDocument();
    expect(screen.queryByText(/Pee diaper/)).not.toBeInTheDocument();
  });

  it("shows date group headers", () => {
    renderHistory();
    expect(screen.getByText(/Today/)).toBeInTheDocument();
  });
});
