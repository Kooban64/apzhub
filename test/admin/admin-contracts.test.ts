import { describe, expect, it } from "vitest";

import { adminAlertsPanelSchema } from "@/lib/admin/contracts/alerts";
import { adminAuditSnippetSchema } from "@/lib/admin/contracts/audit";
import { adminHealthStripSchema } from "@/lib/admin/contracts/health";
import { adminProvisioningPreviewSchema } from "@/lib/admin/contracts/provisioning";
import { adminQuickActionsSchema } from "@/lib/admin/contracts/quick-actions";
import { getMockAdminHomeData } from "@/lib/admin/mock-admin-home-data";

describe("admin data contracts", () => {
  it("parses mock bundle through each schema", () => {
    const bundle = getMockAdminHomeData();
    expect(adminHealthStripSchema.parse(bundle.health)).toEqual(bundle.health);
    expect(adminAlertsPanelSchema.parse({ items: bundle.alerts }).items).toEqual(bundle.alerts);
    expect(adminProvisioningPreviewSchema.parse(bundle.provisioning)).toEqual(bundle.provisioning);
    expect(adminAuditSnippetSchema.parse(bundle.audit)).toEqual(bundle.audit);
    expect(adminQuickActionsSchema.parse(bundle.quickActions)).toEqual(bundle.quickActions);
  });
});
