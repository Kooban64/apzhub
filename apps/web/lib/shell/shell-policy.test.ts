import { describe, expect, it } from "vitest";

import {
  isOperatorPersonaKind,
  isPlatformOperatorShell,
  preferredShellFamily,
} from "./shell-policy";

describe("shell-policy", () => {
  it("marks console/org as operator shells", () => {
    expect(isPlatformOperatorShell("console")).toBe(true);
    expect(isPlatformOperatorShell("org")).toBe(true);
    expect(isPlatformOperatorShell("workspace")).toBe(false);
  });

  it("routes platform personas to operator family", () => {
    expect(preferredShellFamily("superadmin")).toBe("operator");
    expect(preferredShellFamily("platform_admin")).toBe("operator");
    expect(preferredShellFamily("org_admin")).toBe("operator");
    expect(preferredShellFamily("finance")).toBe("operator");
    expect(preferredShellFamily("compliance")).toBe("operator");
    expect(preferredShellFamily("support")).toBe("operator");
  });

  it("routes tenant productivity to desktop family", () => {
    expect(preferredShellFamily("org_member")).toBe("desktop");
    expect(preferredShellFamily("individual")).toBe("desktop");
    expect(preferredShellFamily("tenant_support")).toBe("desktop");
    expect(isOperatorPersonaKind("tenant_support")).toBe(false);
  });
});
