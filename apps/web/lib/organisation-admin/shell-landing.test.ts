import { describe, expect, it } from "vitest";

import { shellLandingForKind, isOperatorShellPath } from "@/lib/operator/shell-landing";

describe("organisation-admin landing", () => {
  it("lands org_admin on Workbench by default (admin is a menu entry)", () => {
    expect(shellLandingForKind("org_admin").path).toBe("/workspace/home");
    expect(shellLandingForKind("org_admin").shell).toBe("workspace");
  });

  it("treats organisation-admin as an operator shell path", () => {
    expect(isOperatorShellPath("/organisation-admin")).toBe(true);
    expect(isOperatorShellPath("/organisation-admin/people")).toBe(true);
  });
});
