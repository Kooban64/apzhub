import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "./allow-all-adapter";
import { createAuthWorkbenchPermissionAdapter } from "./auth-permission-adapter";
import {
  createWorkbenchPermissionAdapter,
  resolveWorkbenchPermissionAdapterMode,
} from "./create-permission-adapter";
import { createScaffoldWorkbenchPermissionAdapter } from "./scaffold-permission-adapter";

describe("resolveWorkbenchPermissionAdapterMode", () => {
  it("honours explicit mode override", () => {
    expect(resolveWorkbenchPermissionAdapterMode({ mode: "scaffold" })).toBe(
      "scaffold",
    );
  });

  it("defaults to auth outside test/dev registration", () => {
    expect(resolveWorkbenchPermissionAdapterMode({ nodeEnv: "production" })).toBe(
      "auth",
    );
  });
});

describe("createWorkbenchPermissionAdapter", () => {
  it("creates scaffold adapter when requested", () => {
    const adapter = createWorkbenchPermissionAdapter({
      mode: "scaffold",
      authContext: { userId: "user-1", permissions: ["platform.nav.home.view"] },
    });

    expect(adapter.kind).toBe("scaffold-deny-by-default");
    expect(adapter.can("platform.nav.home.view")).toBe(true);
  });

  it("creates allow-all adapter in test mode", () => {
    expect(createWorkbenchPermissionAdapter({ nodeEnv: "test" })).toBeInstanceOf(
      createAllowAllWorkbenchPermissionAdapter().constructor,
    );
  });

  it("creates auth adapter with session context", () => {
    const adapter = createWorkbenchPermissionAdapter({
      mode: "auth",
      authContext: { userId: "user-1" },
    });

    expect(adapter).toBeInstanceOf(createAuthWorkbenchPermissionAdapter().constructor);
    expect(adapter.getContext()?.userId).toBe("user-1");
  });

  it("creates scaffold adapter without auth context", () => {
    const adapter = createWorkbenchPermissionAdapter({ mode: "scaffold" });
    expect(adapter).toBeInstanceOf(
      createScaffoldWorkbenchPermissionAdapter().constructor,
    );
  });
});
