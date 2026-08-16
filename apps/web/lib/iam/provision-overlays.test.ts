import { beforeEach, describe, expect, it } from "vitest";

import { getSharedAuthorizationService } from "@apzhub/platform-authorization";

import {
  applyProvisionOverlays,
  normalizeProfessionalToolIds,
  normalizeResourceScopeGrants,
} from "./provision-overlays";
import { resetProfessionalToolGrantsForTests } from "./professional-tools";

describe("provision-overlays", () => {
  beforeEach(() => {
    resetProfessionalToolGrantsForTests();
  });

  it("normalizes allowed scope prefixes and rejects others", () => {
    expect(
      normalizeResourceScopeGrants([
        "support.queue:q1",
        "projects.project:p1",
        "source.repo:r1",
        "support.queue:q1",
      ]),
    ).toEqual(["support.queue:q1", "projects.project:p1", "source.repo:r1"]);
    expect(() => normalizeResourceScopeGrants(["projects.*"])).toThrow(/scope_invalid/);
    expect(() => normalizeResourceScopeGrants(["support.queue:"])).toThrow(
      /scope_invalid/,
    );
  });

  it("normalizes professional tool ids", () => {
    expect(normalizeProfessionalToolIds(["workflow-designer"])).toEqual([
      "workflow-designer",
    ]);
    expect(() => normalizeProfessionalToolIds(["metabase"])).toThrow(
      /professional_tool_unknown/,
    );
  });

  it("applies in-memory scope role and professional tool grants", async () => {
    const userId = `user-overlay-${Date.now()}`;
    const result = await applyProvisionOverlays({
      organisationId: "org-overlay-1",
      userId,
      invitedBy: "admin-1",
      resourceScopeGrants: ["support.queue:intake"],
      professionalToolIds: ["analytics-models"],
    });

    expect(result.resourceScopeGrants).toEqual(["support.queue:intake"]);
    expect(result.scopedRoleId).toBe(`role-user-scope-${userId}`);
    expect(result.professionalToolIds).toEqual(["analytics-models"]);

    const effective = getSharedAuthorizationService().getEffectivePermissions({
      userId,
      tenantId: "org-overlay-1",
    });
    expect(effective.effectivePermissions).toContain("support.queue:intake");
  });
});
