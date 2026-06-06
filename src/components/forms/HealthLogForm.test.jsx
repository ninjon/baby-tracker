import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HealthLogForm from "./HealthLogForm";

const noop = vi.fn();

describe("HealthLogForm", () => {
  it("renders the three entry-type tabs", () => {
    render(<HealthLogForm babyId="b1" onSave={noop} onClose={noop} />);
    expect(screen.getByRole("tab", { name: /fever/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /medication/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /doctor visit/i }),
    ).toBeInTheDocument();
  });

  it("shows temperature field by default (Fever tab active)", () => {
    render(<HealthLogForm babyId="b1" onSave={noop} onClose={noop} />);
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
  });

  it("switches to medication fields when Medication tab is clicked", async () => {
    const user = userEvent.setup();
    render(<HealthLogForm babyId="b1" onSave={noop} onClose={noop} />);
    await user.click(screen.getByRole("tab", { name: /medication/i }));
    expect(screen.getByLabelText(/medication name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dose/i)).toBeInTheDocument();
  });

  it("switches to doctor visit fields when Doctor Visit tab is clicked", async () => {
    const user = userEvent.setup();
    render(<HealthLogForm babyId="b1" onSave={noop} onClose={noop} />);
    await user.click(screen.getByRole("tab", { name: /doctor visit/i }));
    expect(screen.getByLabelText(/visit type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/doctor name/i)).toBeInTheDocument();
  });

  it("calls onSave with fever payload when form is submitted", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<HealthLogForm babyId="b1" onSave={onSave} onClose={noop} />);

    await user.clear(screen.getByLabelText(/temperature/i));
    await user.type(screen.getByLabelText(/temperature/i), "38.5");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        baby_id: "b1",
        entry_type: "fever",
        temperature_celsius: 38.5,
      }),
    );
  });
});
