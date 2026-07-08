import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDurationMinutes,
  formatMatterListLabel,
} from "../formatting";

describe("formatters", () => {
  it("formats matter list labels", () => {
    expect(formatMatterListLabel("MAT-2026-000001", "Smith v Jones")).toBe(
      "MAT-2026-000001 — Smith v Jones",
    );
  });

  it("formats currency values", () => {
    expect(formatCurrency(1250.5, "AUD")).toContain("1,250.50");
  });

  it("formats durations", () => {
    expect(formatDurationMinutes(90)).toBe("1h 30m");
  });
});
