import { describe, expect, it } from "vitest";

import {
  parseWorkbenchSessionPayload,
  WORKBENCH_SESSION_SCHEMA_VERSION,
} from "./workbench-session-payload";

describe("workbench session payload", () => {
  it("parses a valid session payload", () => {
    const result = parseWorkbenchSessionPayload({
      schemaVersion: WORKBENCH_SESSION_SCHEMA_VERSION,
      activeWorkspace: "home",
      focusedViewId: "platform-home-overview",
      openViews: [{ viewId: "platform-home-overview", workspace: "home" }],
      panels: {
        sidebar: { collapsed: false, width: 280 },
      },
      capturedAt: new Date().toISOString(),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.activeWorkspace).toBe("home");
      expect(result.payload.focusedViewId).toBe("platform-home-overview");
    }
  });

  it("rejects unsupported schema versions", () => {
    const result = parseWorkbenchSessionPayload({
      schemaVersion: "2.0",
      activeWorkspace: "home",
      capturedAt: new Date().toISOString(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe("version_mismatch");
    }
  });

  it("rejects invalid payloads safely", () => {
    const result = parseWorkbenchSessionPayload(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe("invalid");
    }
  });
});
