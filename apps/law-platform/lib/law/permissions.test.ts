import { describe, expect, it } from "vitest";

import {
  canAdminLawPractice,
  canViewLaw,
  canViewLawPracticeSurface,
  hasLawPermission,
} from "./permissions";

describe("law permissions helpers (N-02)", () => {
  it("denies when source is empty", () => {
    expect(canViewLaw(undefined)).toBe(false);
    expect(canAdminLawPractice([])).toBe(false);
  });

  it("honours law.* and legal.* wildcards for elevated operators", () => {
    expect(canViewLaw(["law.*"])).toBe(true);
    expect(canAdminLawPractice(["legal.*"])).toBe(true);
    expect(canViewLawPracticeSurface(["legal.*"], "legal.client.view")).toBe(true);
  });

  it("treats law.view as governance-entry identity", () => {
    expect(canViewLaw(["law.view"])).toBe(true);
    expect(canAdminLawPractice(["law.view"])).toBe(false);
    expect(canViewLawPracticeSurface(["law.view"], "legal.client.view")).toBe(false);
    expect(canViewLawPracticeSurface(["law.view"], "legal.trust.view")).toBe(false);
  });

  it("gates practice on admin or explicit practice keys", () => {
    expect(canAdminLawPractice(["law.admin"])).toBe(true);
    expect(canViewLawPracticeSurface(["legal.client.view"], "legal.client.view")).toBe(
      true,
    );
    expect(hasLawPermission(["law.view"], "law.view")).toBe(true);
  });
});
