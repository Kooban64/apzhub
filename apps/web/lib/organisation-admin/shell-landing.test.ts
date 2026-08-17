import { describe, expect, it } from "vitest";

import { shellLandingForKind, isOperatorShellPath } from "@/lib/operator/shell-landing";

describe("organisation-admin landing", () => {
  it("lands org_admin on /organisation-admin", () => {
    expect(shellLandingForKind("org_admin").path).toBe("/organisation-admin");
  });

  it("treats organisation-admin as an operator shell path", () => {
    expect(isOperatorShellPath("/organisation-admin")).toBe(true);
    expect(isOperatorShellPath("/organisation-admin/people")).toBe(true);
  });
});
