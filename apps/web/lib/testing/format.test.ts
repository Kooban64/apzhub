import { describe, expect, it } from "vitest";

import { formatBytes, formatStatusLabel, formatTestingDate } from "./format";

describe("testing format helpers", () => {
  it("formats dates with fallback on invalid input", () => {
    const formatted = formatTestingDate("2026-07-10T10:00:00.000Z");
    expect(formatted).toMatch(/2026/);
    expect(formatTestingDate("not-a-date")).toBe("not-a-date");
  });

  it("formats byte sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats status labels from snake_case and kebab-case", () => {
    expect(formatStatusLabel("pending_approval")).toBe("Pending Approval");
    expect(formatStatusLabel("in-progress")).toBe("In Progress");
    expect(formatStatusLabel("ready")).toBe("Ready");
  });
});
