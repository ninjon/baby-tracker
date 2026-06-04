import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SleepForm from "./SleepForm";

describe("SleepForm", () => {
  it("renders start and end time fields", () => {
    render(<SleepForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
  });

  it('renders "Still sleeping" button', () => {
    render(<SleepForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /still sleeping/i }),
    ).toBeInTheDocument();
  });

  it("calls onSave with null end_time when Still Sleeping tapped", async () => {
    const onSave = vi.fn();
    render(<SleepForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(
      screen.getByRole("button", { name: /still sleeping/i }),
    );
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ end_time: null }),
    );
  });

  it("calls onSave with both times when Save is tapped", async () => {
    const onSave = vi.fn();
    render(<SleepForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /^save sleep/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        start_time: expect.any(String),
        end_time: expect.any(String),
      }),
    );
  });
});
