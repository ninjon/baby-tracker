import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

vi.mock("../context/BabyContext", () => ({
  useBaby: vi.fn().mockReturnValue({
    baby: { id: "b1", name: "Sophie", date_of_birth: "2026-08-13" },
  }),
}));

vi.mock("../context/LoggerContext", () => ({
  useLogger: vi.fn().mockReturnValue({
    logger: "Darren",
    switchLogger: vi.fn(),
    LOGGERS: ["Darren", "Steffi"],
  }),
}));

vi.mock("../hooks/useInsights", () => ({
  useSleepInsights: vi.fn().mockReturnValue({
    dailyTotals: [],
    longestStretchMinutes: 0,
    avgMinutesPerDay: 0,
    loading: false,
  }),
  useFeedInsights: vi.fn().mockReturnValue({
    dailyAmounts: [],
    typeBreakdown: { breast: 0, bottle: 0 },
    feedsPerDay: 0,
    avgMlPerBottleFeed: 0,
    loading: false,
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
    // Pre-birth shows "Xd to go"; post-birth shows "Day N"
    expect(screen.getByText(/\d+d to go|Day \d+/)).toBeInTheDocument();
  });

  it("shows the three status cards", () => {
    renderHome();
    expect(screen.getByText("Fed")).toBeInTheDocument();
    // "Diaper" appears in both status card and quick log — assert at least one
    expect(screen.getAllByText("Diaper").length).toBeGreaterThan(0);
    expect(screen.getByText(/Awake|Sleeping/)).toBeInTheDocument();
  });

  it("shows quick log buttons", () => {
    renderHome();
    expect(screen.getByText("Feeding")).toBeInTheDocument();
    // "Diaper" appears in both status card and quick log button
    expect(screen.getAllByText("Diaper").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Sleep")).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
  });

  it("shows the insights summary card with a fallback when no data", () => {
    renderHome();
    expect(screen.getByText(/Insights · last 7 days/)).toBeInTheDocument();
    expect(
      screen.getByText(/Keep logging to see sleep & feed trends/),
    ).toBeInTheDocument();
  });
});
