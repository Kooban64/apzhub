import { describe, expect, it } from "vitest";

import {
  formatBytes,
  formatSearchHitKind,
  formatSupportDate,
  formatSupportPriority,
  formatSupportStatus,
} from "./format";

describe("support format helpers", () => {
  it("formats dates, statuses, priorities, and search kinds", () => {
    expect(formatSupportDate(null)).toBe("—");
    expect(formatSupportDate("not-a-date")).toBe("not-a-date");
    expect(formatSupportDate("2026-01-01T12:00:00.000Z")).toMatch(/2026/);
    expect(formatSupportStatus("open")).toBe("Open");
    expect(formatSupportStatus("custom")).toBe("custom");
    expect(formatSupportPriority("high")).toBe("High");
    expect(formatSupportPriority("custom")).toBe("custom");
    expect(formatSearchHitKind("user")).toBe("User");
    expect(formatSearchHitKind("other")).toBe("other");
  });

  it("formats byte sizes", () => {
    expect(formatBytes(undefined)).toBe("—");
    expect(formatBytes(Number.NaN)).toBe("—");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
