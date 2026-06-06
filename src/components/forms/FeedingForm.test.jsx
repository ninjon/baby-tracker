import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedingForm from "./FeedingForm";

describe("FeedingForm", () => {
  it("renders Breast and Bottle type selectors", () => {
    render(<FeedingForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Breast")).toBeInTheDocument();
    expect(screen.getByText("Bottle")).toBeInTheDocument();
  });

  it("shows side selector when Breast is selected", async () => {
    render(<FeedingForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Breast"));
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(screen.getByText("Both")).toBeInTheDocument();
  });

  it("shows ml input when Bottle is selected", async () => {
    render(<FeedingForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Bottle"));
    expect(screen.getByPlaceholderText(/ml/i)).toBeInTheDocument();
  });

  it("calls onSave with bottle payload", async () => {
    const onSave = vi.fn();
    render(<FeedingForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Bottle"));
    await userEvent.type(screen.getByPlaceholderText(/ml/i), "90");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: "bottle", amount_ml: 90 }),
    );
  });
});
