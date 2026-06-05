import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Health from "./Health";

vi.mock("./health/GrowthTab", () => ({
  default: () => <div>Growth panel</div>,
}));
vi.mock("./health/VaccinesTab", () => ({
  default: () => <div>Vaccines panel</div>,
}));
vi.mock("./health/HealthLogTab", () => ({
  default: () => <div>Health Log panel</div>,
}));
vi.mock("./health/InsightsTab", () => ({
  default: () => <div>Insights panel</div>,
}));

function renderHealth() {
  return render(
    <MemoryRouter>
      <Health />
    </MemoryRouter>,
  );
}

describe("Health", () => {
  it("renders all four tab labels", () => {
    renderHealth();
    expect(screen.getByRole("tab", { name: "Growth" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Vaccines" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Health Log" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Insights" })).toBeInTheDocument();
  });

  it("shows Growth tab content by default", () => {
    renderHealth();
    expect(screen.getByText("Growth panel")).toBeInTheDocument();
  });

  it("switches to Vaccines tab on click", async () => {
    const user = userEvent.setup();
    renderHealth();
    await user.click(screen.getByRole("tab", { name: "Vaccines" }));
    expect(screen.getByText("Vaccines panel")).toBeInTheDocument();
    expect(screen.queryByText("Growth panel")).not.toBeInTheDocument();
  });

  it("switches to Health Log tab on click", async () => {
    const user = userEvent.setup();
    renderHealth();
    await user.click(screen.getByRole("tab", { name: "Health Log" }));
    expect(screen.getByText("Health Log panel")).toBeInTheDocument();
    expect(screen.queryByText("Growth panel")).not.toBeInTheDocument();
  });

  it("switches to Insights tab on click", async () => {
    const user = userEvent.setup();
    renderHealth();
    await user.click(screen.getByRole("tab", { name: "Insights" }));
    expect(screen.getByText("Insights panel")).toBeInTheDocument();
    expect(screen.queryByText("Growth panel")).not.toBeInTheDocument();
  });
});
