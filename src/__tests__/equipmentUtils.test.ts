import { describe, it, expect } from "vitest";
import { getTTTColor, getEquipmentAccent } from "@/lib/equipmentUtils";

describe("getTTTColor", () => {
  it("returns red for >=30", () => expect(getTTTColor(35).bg).toContain("red"));
  it("returns orange for >=20", () => expect(getTTTColor(25).bg).toContain("orange"));
  it("returns amber for >=10", () => expect(getTTTColor(15).bg).toContain("amber"));
  it("returns dark for <10", () => expect(getTTTColor(5).bg).toContain("black"));
});

describe("getEquipmentAccent", () => {
  it("returns blue for QC", () => expect(getEquipmentAccent("QC")).toBe("#0046af"));
  it("returns green for YT", () => expect(getEquipmentAccent("YT")).toBe("#10b981"));
  it("returns default for unknown", () => expect(getEquipmentAccent("UNKNOWN")).toBe("#64748b"));
});
