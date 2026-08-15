import { describe, expect, it } from "vitest";

import { buildProjectsEngineHealthPayload } from "@/lib/projects/engine-health-payload";

describe("projects engine health (SPR-APZPRD-003-B)", () => {
  it("always reports BetterAuth and never Authentik", () => {
    const payload = buildProjectsEngineHealthPayload({
      userId: "user-1",
      diagnostics: {
        integrationEnabled: true,
        healthStatus: "configured",
        apiTokenPresent: true,
        connectionConfigured: true,
        workspaceConfigured: true,
        issues: [],
      },
      liveListOk: true,
    });
    expect(payload.authN).toBe("betterauth");
    expect(payload.authZ).toBe("apzhub_permission_service");
    expect(payload.engineAuth).toBe("adapter_api_key");
    expect(payload.authentikUsed).toBe(false);
  });
});
