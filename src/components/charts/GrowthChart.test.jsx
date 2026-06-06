import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GrowthChart from "./GrowthChart";

// Mock recharts so tests run without ResizeObserver / canvas in JSDOM.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

const MOCK_DATA = [
  { measured_at: "2026-03-01T09:00:00Z", weight_kg: 4.5 },
  { measured_at: "2026-04-01T09:00:00Z", weight_kg: 5.8 },
];

describe("GrowthChart", () => {
  it("renders the chart label as a heading", () => {
    render(
      <GrowthChart
        data={MOCK_DATA}
        dataKey="weight_kg"
        unit="kg"
        label="Weight"
        color="#e8855a"
      />,
    );
    expect(screen.getByText("Weight")).toBeInTheDocument();
  });

  it("renders a recharts ResponsiveContainer when data is provided", () => {
    render(
      <GrowthChart
        data={MOCK_DATA}
        dataKey="weight_kg"
        unit="kg"
        label="Weight"
        color="#e8855a"
      />,
    );
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders the empty state message when data is empty", () => {
    render(
      <GrowthChart
        data={[]}
        dataKey="weight_kg"
        unit="kg"
        label="Weight"
        color="#e8855a"
      />,
    );
    expect(screen.getByText(/No measurements yet/i)).toBeInTheDocument();
    expect(
      screen.queryByTestId("responsive-container"),
    ).not.toBeInTheDocument();
  });

  it("does not render the chart when data is empty", () => {
    render(
      <GrowthChart
        data={[]}
        dataKey="weight_kg"
        unit="kg"
        label="Weight"
        color="#e8855a"
      />,
    );
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });
});
