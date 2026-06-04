import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiaperForm from "./DiaperForm";

describe("DiaperForm", () => {
  it("renders type selector with Wet, Dirty, Both", () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Wet")).toBeInTheDocument();
    expect(screen.getByText("Dirty")).toBeInTheDocument();
    expect(screen.getByText("Both")).toBeInTheDocument();
  });

  it("shows colour picker and consistency when Dirty is selected", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Dirty"));
    expect(screen.getByText("Yellow")).toBeInTheDocument();
    expect(screen.getByText("Seedy")).toBeInTheDocument();
  });

  it("does not show colour picker when Wet is selected", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Wet"));
    expect(screen.queryByText("Yellow")).not.toBeInTheDocument();
  });

  it("shows PD warning when White is selected", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Dirty"));
    await userEvent.click(screen.getByText("White"));
    expect(screen.getByText(/liver or bile/)).toBeInTheDocument();
  });

  it("does not show PD warning for Yellow", async () => {
    render(<DiaperForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Dirty"));
    await userEvent.click(screen.getByText("Yellow"));
    expect(screen.queryByText(/liver or bile/)).not.toBeInTheDocument();
  });

  it("calls onSave with correct payload", async () => {
    const onSave = vi.fn();
    render(<DiaperForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText("Wet"));
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: "wet" }),
    );
  });
});
