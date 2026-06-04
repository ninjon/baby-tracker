import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PumpForm from "./PumpForm";

describe("PumpForm", () => {
  it("renders left and right volume fields", () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/left/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/right/i)).toBeInTheDocument();
  });

  it("auto-computes total from left and right", async () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/left/i), "60");
    await userEvent.type(screen.getByLabelText(/right/i), "40");
    expect(screen.getByText("100 ml total")).toBeInTheDocument();
  });

  it("shows expiry for fridge storage", async () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Fridge"));
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });

  it("shows no expiry for Feed Now", async () => {
    render(<PumpForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Feed Now"));
    expect(screen.queryByText(/expires/i)).not.toBeInTheDocument();
  });

  it("calls onSave with computed total", async () => {
    const onSave = vi.fn();
    render(<PumpForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/left/i), "60");
    await userEvent.type(screen.getByLabelText(/right/i), "40");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        volume_left_ml: 60,
        volume_right_ml: 40,
        volume_total_ml: 100,
      }),
    );
  });
});
