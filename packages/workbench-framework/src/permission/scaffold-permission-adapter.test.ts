import { describe, expect, it } from "vitest";

import { createScaffoldWorkbenchPermissionAdapter } from "./scaffold-permission-adapter";

describe("ScaffoldWorkbenchPermissionAdapter", () => {
  it("allows items without permission keys", () => {
    const adapter = createScaffoldWorkbenchPermissionAdapter({
      context: {
        userId: "u1",
        roles: [],
        permissions: new Set(),
      },
    });

    expect(adapter.can(undefined)).toBe(true);
    expect(adapter.filter([{ permission: undefined }])).toEqual([
      { permission: undefined },
    ]);
  });

  it("denies undeclared permission keys by default", () => {
    const adapter = createScaffoldWorkbenchPermissionAdapter({
      context: {
        userId: "u1",
        roles: [],
        permissions: new Set(["platform.nav.home.view"]),
      },
    });

    expect(adapter.can("platform.nav.administration.view")).toBe(false);
    expect(
      adapter.filter([
        { permission: "platform.nav.home.view" },
        { permission: "platform.nav.administration.view" },
      ]),
    ).toEqual([{ permission: "platform.nav.home.view" }]);
    expect(adapter.getDiagnostics?.().filteredItemCount).toBe(1);
  });

  it("tracks denied requests", () => {
    const adapter = createScaffoldWorkbenchPermissionAdapter();
    adapter.recordDeniedRequest?.();
    expect(adapter.getDiagnostics?.().deniedRequestCount).toBe(1);
    expect(adapter.getDiagnostics?.().adapterKind).toBe("scaffold-deny-by-default");
  });
});
