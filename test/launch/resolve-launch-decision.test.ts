import { describe, expect, it } from "vitest";

import { resolveLaunchDecision } from "@/lib/launch/resolve-launch-decision";

describe("resolveLaunchDecision", () => {
  it("returns ready with target when tenant allows, tile visible, role granted, realization provisioned", () => {
    const d = resolveLaunchDecision({
      serviceId: "mail",
      tenantAllowsService: true,
      launcherShowsService: true,
      effectiveRole: "editor",
      realization: "provisioned",
    });
    expect(d.readiness).toBe("ready");
    expect(d.allowed).toBe(true);
    expect(d.target?.kind).toBe("oidc_redirect");
    expect(d.emitAuditEvent).toBe(true);
    expect(d.userMessage).toContain("Ready");
  });

  it("defers with pending readiness when realization is pending (reason not_provisioned)", () => {
    const d = resolveLaunchDecision({
      serviceId: "calendar",
      tenantAllowsService: true,
      launcherShowsService: true,
      effectiveRole: "editor",
      realization: "pending",
    });
    expect(d.readiness).toBe("pending");
    expect(d.allowed).toBe(false);
    expect(d.reasonCode).toBe("not_provisioned");
    expect(d.target).toBeNull();
  });

  it("maps failed realization to error readiness with launch_error code", () => {
    const d = resolveLaunchDecision({
      serviceId: "calendar",
      tenantAllowsService: true,
      launcherShowsService: true,
      effectiveRole: "editor",
      realization: "failed",
    });
    expect(d.readiness).toBe("error");
    expect(d.reasonCode).toBe("launch_error");
  });

  it("blocks when service not on tenant allowlist", () => {
    const d = resolveLaunchDecision({
      serviceId: "drive",
      tenantAllowsService: false,
      launcherShowsService: false,
      effectiveRole: "viewer",
      realization: "provisioned",
    });
    expect(d.readiness).toBe("blocked");
    expect(d.reasonCode).toBe("tenant_denied");
  });
});
