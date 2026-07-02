import { describe, expect, it } from "vitest";

import {
  createAuthWorkbenchPermissionAdapter,
  mapAuthSessionToContext,
} from "./auth-permission-adapter";
import {
  createWorkbenchPermissionAdapter,
  resolveWorkbenchPermissionAdapterMode,
} from "./create-permission-adapter";

describe("AuthWorkbenchPermissionAdapter", () => {
  it("denies undeclared permission keys when RBAC is empty", () => {
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      roles: [],
      permissions: [],
    });

    expect(adapter.can(undefined)).toBe(true);
    expect(adapter.can("platform.nav.administration.view")).toBe(false);
    expect(adapter.getDiagnostics().adapterKind).toBe("auth");
  });

  it("allows manifest items without permission keys", () => {
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      roles: [],
      permissions: [],
    });

    expect(adapter.filter([{ permission: undefined }])).toEqual([
      { permission: undefined },
    ]);
  });

  it("allows declared permissions from session context", () => {
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      roles: ["admin"],
      permissions: ["platform.nav.administration.view"],
    });

    expect(adapter.can("platform.nav.administration.view")).toBe(true);
    expect(
      adapter.filter([
        { permission: "platform.nav.administration.view" },
        { permission: "platform.nav.other.view" },
      ]),
    ).toEqual([{ permission: "platform.nav.administration.view" }]);
  });

  it("updates session context at runtime", () => {
    const adapter = createAuthWorkbenchPermissionAdapter(null);
    expect(adapter.getContext()).toBeNull();

    adapter.setSessionContext({
      userId: "user-2",
      permissions: ["platform.view.read"],
    });
    expect(adapter.can("platform.view.read")).toBe(true);
    adapter.setSessionContext(null);
    expect(adapter.can("platform.view.read")).toBe(false);
  });

  it("records denied requests in diagnostics", () => {
    const adapter = createAuthWorkbenchPermissionAdapter({ userId: "user-1" });
    adapter.recordDeniedRequest();
    expect(adapter.getDiagnostics().deniedRequestCount).toBe(1);
  });

  it("maps auth session input to permission context", () => {
    const context = mapAuthSessionToContext({
      userId: "user-1",
      roles: ["viewer"],
      permissions: ["platform.view.read"],
    });

    expect(context.userId).toBe("user-1");
    expect(context.permissions.has("platform.view.read")).toBe(true);
  });
});

describe("createWorkbenchPermissionAdapter", () => {
  it("uses allow-all in test environment by default", () => {
    expect(resolveWorkbenchPermissionAdapterMode({ nodeEnv: "test" })).toBe(
      "allow-all",
    );
    expect(createWorkbenchPermissionAdapter({ nodeEnv: "test" }).kind).toBe(
      "allow-all",
    );
  });

  it("uses auth adapter in production mode", () => {
    const adapter = createWorkbenchPermissionAdapter({
      nodeEnv: "production",
      authContext: { userId: "user-1" },
    });

    expect(adapter.kind).toBe("auth");
  });
});
