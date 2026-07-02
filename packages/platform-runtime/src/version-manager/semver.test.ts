import { describe, expect, it } from "vitest";

import {
  compareSemver,
  isValidPlatformVersionConstraint,
  isValidSemver,
  satisfiesPlatformVersion,
} from "./semver";

describe("Version Manager", () => {
  it("validates semver strings", () => {
    expect(isValidSemver("1.0.0")).toBe(true);
    expect(isValidSemver("0.1.0")).toBe(true);
    expect(isValidSemver("1.0.0-alpha")).toBe(true);
    expect(isValidSemver("invalid")).toBe(false);
  });

  it("validates platform version constraints", () => {
    expect(isValidPlatformVersionConstraint(">=0.2.0")).toBe(true);
    expect(isValidPlatformVersionConstraint(">=not-valid")).toBe(false);
  });

  it("compares semver values", () => {
    expect(compareSemver("1.0.0", "0.9.0")).toBeGreaterThan(0);
    expect(compareSemver("0.1.0", "0.1.0")).toBe(0);
  });

  it("checks platform version satisfaction", () => {
    expect(satisfiesPlatformVersion(">=0.2.0", "0.3.0")).toBe(true);
    expect(satisfiesPlatformVersion(">=0.2.0", "0.1.0")).toBe(false);
    expect(satisfiesPlatformVersion(undefined, "0.1.0")).toBe(true);
  });
});
