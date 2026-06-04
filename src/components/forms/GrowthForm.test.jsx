import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GrowthForm from "./GrowthForm";

describe("GrowthForm", () => {
  it("renders weight, height, and head fields", () => {
    render(<GrowthForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Weight/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Height/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Head/)).toBeInTheDocument();
  });

  it("calls onSave with numeric values", async () => {
    const onSave = vi.fn();
    render(<GrowthForm onSave={onSave} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/Weight/), "3.8");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ weight_kg: 3.8 }),
    );
  });
});
