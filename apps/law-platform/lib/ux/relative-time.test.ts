import { describe, expect, it } from "vitest";

import { formatRelativeTimestamp } from "./relative-time";

describe("formatRelativeTimestamp", () => {
  it("formats recent timestamps relatively", () => {
    const now = new Date("2026-06-28T12:00:00.000Z");
    expect(formatRelativeTimestamp("2026-06-28T11:50:00.000Z", now)).toBe("10m ago");
    expect(formatRelativeTimestamp("2026-06-27T12:00:00.000Z", now)).toBe("1d ago");
  });
});
