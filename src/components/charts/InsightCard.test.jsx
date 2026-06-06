import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InsightCard from "./InsightCard";

describe("InsightCard", () => {
  it("renders the title", () => {
    render(
      <InsightCard title="Sleep Duration">
        <p>chart</p>
      </InsightCard>,
    );
    expect(screen.getByText("Sleep Duration")).toBeInTheDocument();
  });

  it("renders the subtitle when provided", () => {
    render(
      <InsightCard title="Sleep" subtitle="Last 14 days">
        <p>chart</p>
      </InsightCard>,
    );
    expect(screen.getByText("Last 14 days")).toBeInTheDocument();
  });

  it("does not render a subtitle element when omitted", () => {
    render(
      <InsightCard title="Sleep">
        <p>chart</p>
      </InsightCard>,
    );
    expect(screen.queryByTestId("insight-subtitle")).not.toBeInTheDocument();
  });

  it("renders children inside the card", () => {
    render(
      <InsightCard title="Feed">
        <p>chart content</p>
      </InsightCard>,
    );
    expect(screen.getByText("chart content")).toBeInTheDocument();
  });
});
