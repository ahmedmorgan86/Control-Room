import { describe, it, expect } from "vitest";
import { getFillBarColor, getSeverityColor, getColumnCount } from "@/lib/ui";

describe("getFillBarColor", () => {
  it("returns red for >85%", () => expect(getFillBarColor(0.9)).toBe("#ef4444"));
  it("returns yellow for >70%", () => expect(getFillBarColor(0.8)).toBe("#eab308"));
  it("returns green for >50%", () => expect(getFillBarColor(0.6)).toBe("#22c55e"));
  it("returns blue for <=50%", () => expect(getFillBarColor(0.3)).toBe("#3b82f6"));
});

describe("getSeverityColor", () => {
  it("returns red for CRITICAL", () => expect(getSeverityColor("CRITICAL")).toBe("#ef4444"));
  it("returns orange for HIGH", () => expect(getSeverityColor("HIGH")).toBe("#f97316"));
  it("returns yellow for MEDIUM", () => expect(getSeverityColor("MEDIUM")).toBe("#eab308"));
  it("returns red for unknown", () => expect(getSeverityColor("UNKNOWN")).toBe("#ef4444"));
});

describe("getColumnCount", () => {
  it("returns 1 for 0", () => expect(getColumnCount(0)).toBe(1));
  it("returns count for <=7", () => expect(getColumnCount(5)).toBe(5));
  it("returns 7 for 7", () => expect(getColumnCount(7)).toBe(7));
  it("handles >7", () => expect(getColumnCount(12)).toBeGreaterThanOrEqual(4));
});
