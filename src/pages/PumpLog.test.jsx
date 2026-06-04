import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PumpLog from "./PumpLog";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi
    .fn()
    .mockReturnValue({
      baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
    }),
}));

vi.mock("../hooks/useRealtimeLogs", () => {
  const mockPumpLogs = [
    {
      id: "1",
      category: "pump",
      volume_total_ml: 120,
      storage: "fridge",
      label_date: "2026-09-01",
      timestamp: new Date().toISOString(),
      sortTime: new Date().toISOString(),
    },
    {
      id: "2",
      category: "pump",
      volume_total_ml: 80,
      storage: "freezer",
      label_date: "2026-09-01",
      timestamp: new Date().toISOString(),
      sortTime: new Date().toISOString(),
    },
    {
      id: "3",
      category: "pump",
      volume_total_ml: 60,
      storage: "feed_now",
      label_date: null,
      timestamp: new Date().toISOString(),
      sortTime: new Date().toISOString(),
    },
  ];
  return {
    useRealtimeLogs: vi
      .fn()
      .mockReturnValue({ logs: mockPumpLogs, loading: false }),
  };
});

function renderPumpLog() {
  return render(
    <MemoryRouter>
      <PumpLog />
    </MemoryRouter>,
  );
}

describe("PumpLog", () => {
  it("shows Sessions and Stash tabs", () => {
    renderPumpLog();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Milk Stash")).toBeInTheDocument();
  });

  it("shows session log by default", () => {
    renderPumpLog();
    expect(screen.getAllByText(/120ml|80ml|60ml/).length).toBeGreaterThan(0);
  });

  it("switches to stash view and shows only fridge/freezer", async () => {
    renderPumpLog();
    await userEvent.click(screen.getByText("Milk Stash"));
    expect(screen.getByText("Fridge")).toBeInTheDocument();
    expect(screen.getByText("Freezer")).toBeInTheDocument();
  });
});
