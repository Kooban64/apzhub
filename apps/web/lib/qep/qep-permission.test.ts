import { describe, expect, it } from "vitest";

import { canShowQepNavItem, hasQepPermission } from "./qep-permission";

describe("hasQepPermission", () => {
  it("matches exact, wildcard, and qep.*", () => {
    expect(hasQepPermission(["qep.defects.read"], "qep.defects.read")).toBe(true);
    expect(hasQepPermission(["qep.defects.*"], "qep.defects.read")).toBe(true);
    expect(hasQepPermission(["qep.*"], "qep.home.read")).toBe(true);
    expect(hasQepPermission(["*"], "qep.home.read")).toBe(true);
    expect(hasQepPermission(["qep.defects.read"], "qep.requirements.view")).toBe(false);
  });

  it("does not treat source.write as QEP or Source read", () => {
    expect(hasQepPermission(["source.write"], "source.read")).toBe(false);
    expect(hasQepPermission(["source.write"], "qep.home.read")).toBe(false);
    expect(hasQepPermission(["qep.*"], "source.read")).toBe(false);
  });
});

describe("canShowQepNavItem", () => {
  it("hides every destination when not entitled", () => {
    expect(
      canShowQepNavItem({
        entitled: false,
        permissions: ["qep.*"],
        required: "qep.home.read",
      }),
    ).toBe(false);
  });

  it("never implies Source from QEP entitlements", () => {
    expect(
      canShowQepNavItem({
        entitled: true,
        permissions: ["qep.*"],
        required: "source.read",
      }),
    ).toBe(false);
  });

  it("shows Phase 5 reader destinations when the granted list is truncated", () => {
    const truncated = Array.from({ length: 80 }, (_, index) => `qep.filler.${index}`);
    expect(
      canShowQepNavItem({
        entitled: true,
        permissions: truncated,
        required: "qep.exploratory.read",
      }),
    ).toBe(true);
    expect(
      canShowQepNavItem({
        entitled: true,
        permissions: truncated,
        required: "qep.experience.read",
      }),
    ).toBe(true);
    expect(
      canShowQepNavItem({
        entitled: true,
        permissions: truncated,
        required: "source.read",
      }),
    ).toBe(false);
  });
});
