import { beforeEach, describe, expect, it } from "vitest";

import { getSharedAuthorizationService } from "@apzhub/platform-authorization";
import { getSharedGovernanceService } from "@apzhub/platform-governance";
import { getSharedTenantManagementService } from "@apzhub/platform-identity";
import { getSharedPersonalisationService } from "@apzhub/platform-personalisation";
import { getSharedPlatformSecurityService } from "@apzhub/platform-security";
import {
  ensurePlatformRuntimeReady,
  getBootstrapPackageDiagnostics,
  resetPlatformBootstrapForTests,
} from "@apzhub/platform-bootstrap/server";
import { loadConsolidatedOperationalDiagnostics } from "@apzhub/platform-bootstrap/diagnostics";

import { WORKSPACE_ROOT } from "./runtime-init";

describe("@apzhub/platform-bootstrap canonical capability initialisation", () => {
  beforeEach(() => {
    resetPlatformBootstrapForTests();
  });

  it("initialises runtime, identity, authorization, personalisation, governance, and security", async () => {
    const bootstrap = await ensurePlatformRuntimeReady(WORKSPACE_ROOT);
    expect(bootstrap.success).toBe(true);

    expect(getSharedTenantManagementService().getDiagnostics()).toBeDefined();
    expect(getSharedAuthorizationService().getDiagnostics()).toBeDefined();
    expect(await getSharedPersonalisationService().getDiagnostics()).toBeDefined();
    expect(await getSharedGovernanceService().getDiagnostics()).toBeDefined();
    expect(
      getSharedPlatformSecurityService().securityDiagnostics.getSecurityDiagnostics(),
    ).toBeDefined();
    expect(getBootstrapPackageDiagnostics(WORKSPACE_ROOT, bootstrap).canonical).toBe(
      true,
    );
  });

  it("loads consolidated diagnostics with bootstrap metadata and law/trust extensions", async () => {
    const consolidated = await loadConsolidatedOperationalDiagnostics(WORKSPACE_ROOT, {
      lawPlatformDiagnostics: {
        product: "law-platform",
        mirroredPersonalisationApis: true,
      },
      trustAccountingDiagnostics: {
        capability: "law.trust.accounting",
        status: "product-scoped",
      },
    });

    expect(consolidated.runtime).toMatchObject({
      bootstrap: {
        package: "@apzhub/platform-bootstrap",
        canonical: true,
        runtimeReady: true,
      },
    });
    expect(consolidated.identity).toBeDefined();
    expect(consolidated.authorization).toBeDefined();
    expect(consolidated.personalisation).toBeDefined();
    expect(consolidated.governance).toBeDefined();
    expect(consolidated.security).toBeDefined();
    expect(consolidated.lawPlatform).toMatchObject({ product: "law-platform" });
    expect(consolidated.trustAccounting).toMatchObject({
      capability: "law.trust.accounting",
    });
  });
});
