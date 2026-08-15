import { describe, expect, it } from "vitest";
import { GREENBONE_INTEGRATION_VERSION, normalizeGreenboneSimplified } from "./index";

describe("@apzhub/integration-greenbone", () => {
  it("exposes integration version", () => {
    expect(GREENBONE_INTEGRATION_VERSION).toBe("0.1.0");
  });

  it("normalizes simplified Greenbone findings payload", () => {
    const seeds = normalizeGreenboneSimplified({
      findings: [{ level: "high", message: "x", host: "1.2.3.4" }],
      tool: "greenbone",
    });
    expect(seeds).toEqual([
      {
        title: "x",
        severity: "high",
        host: "1.2.3.4",
        message: "x",
      },
    ]);
  });

  it("returns empty for missing findings", () => {
    expect(normalizeGreenboneSimplified({})).toEqual([]);
    expect(normalizeGreenboneSimplified(null)).toEqual([]);
  });
});
