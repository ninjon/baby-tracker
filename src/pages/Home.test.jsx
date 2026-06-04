import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

vi.mock("../hooks/useRealtimeLogs", () => ({
  useRealtimeLogs: vi.fn().mockReturnValue({
    logs: [
      {
        id: "1",
        category: "feeding",
        type: "bottle",
        amount_ml: 90,
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: "2",
        category: "diaper",
        type: "wet",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ],
    loading: false,
  }),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  it("shows baby name and day of life", () => {
    renderHome();
    expect(screen.getByText(/Sophie/)).toBeInTheDocument();
    expect(screen.getByText(/Day \d+/)).toBeInTheDocument();
  });

  it("shows the three status cards", () => {
    renderHome();
    expect(screen.getByText("Fed")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText(/Awake|Sleeping/)).toBeInTheDocument();
  });

  it("shows quick log buttons", () => {
    renderHome();
    expect(screen.getByText("🍼 Feeding")).toBeInTheDocument();
    expect(screen.getByText("💧 Diaper")).toBeInTheDocument();
    expect(screen.getByText("😴 Sleep")).toBeInTheDocument();
    expect(screen.getByText("📏 Growth")).toBeInTheDocument();
  });
});
