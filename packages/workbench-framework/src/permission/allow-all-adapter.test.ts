import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "./allow-all-adapter";

describe("AllowAllWorkbenchPermissionAdapter", () => {
  it("allows all permission checks", () => {
    const adapter = createAllowAllWorkbenchPermissionAdapter();
    expect(adapter.can("platform.nav.admin.view")).toBe(true);
    expect(adapter.can(undefined)).toBe(true);
  });

  it("returns dev context", () => {
    const adapter = createAllowAllWorkbenchPermissionAdapter();
    const ctx = adapter.getContext();
    expect(ctx?.userId).toBe("dev");
    expect(ctx?.permissions.has("*")).toBe(true);
  });

  it("passes through filter", () => {
    const adapter = createAllowAllWorkbenchPermissionAdapter();
    const items = [{ id: "a" }, { id: "b", permission: "secret" }];
    expect(adapter.filter(items)).toHaveLength(2);
  });
});
