import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LoggerProvider, useLogger } from "./LoggerContext";

const wrapper = ({ children }) => <LoggerProvider>{children}</LoggerProvider>;

describe("LoggerContext caregivers", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to Darren and Steffi", () => {
    const { result } = renderHook(() => useLogger(), { wrapper });
    expect(result.current.caregivers).toEqual(["Darren", "Steffi"]);
  });

  it("adds a caregiver, trimming and ignoring duplicates", () => {
    const { result } = renderHook(() => useLogger(), { wrapper });
    act(() => result.current.addCaregiver("  Grandma  "));
    expect(result.current.caregivers).toContain("Grandma");
    act(() => result.current.addCaregiver("Grandma"));
    expect(
      result.current.caregivers.filter((c) => c === "Grandma"),
    ).toHaveLength(1);
  });

  it("removes a caregiver and reassigns the logger when needed", () => {
    const { result } = renderHook(() => useLogger(), { wrapper });
    act(() => result.current.switchLogger("Steffi"));
    act(() => result.current.removeCaregiver("Steffi"));
    expect(result.current.caregivers).not.toContain("Steffi");
    expect(result.current.logger).toBe("Darren");
  });

  it("never removes the last remaining caregiver", () => {
    const { result } = renderHook(() => useLogger(), { wrapper });
    act(() => result.current.removeCaregiver("Steffi"));
    act(() => result.current.removeCaregiver("Darren"));
    expect(result.current.caregivers.length).toBeGreaterThanOrEqual(1);
  });
});
