import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_COMPLIANCE_ID,
} from "@apzhub/platform-authorization";

describe("Phase A Compliance vertical access", () => {
  it("Compliance template suggests Documents / Analytics / Knowledge only", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_COMPLIANCE_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "documents",
      "analytics",
      "knowledge",
    ]);
    expect(tmpl?.orgJobRoleId).toBe("role-compliance-officer");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("support");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("qep");
  });

  it("maps compliance-officer to tenant_compliance (not platform compliance console)", () => {
    expect(
      resolveDashboardKindFromRoles([
        "compliance-officer",
        "product-documents-auditor",
        "product-analytics-viewer",
      ]),
    ).toBe("tenant_compliance");
    expect(resolveDashboardKindFromRoles(["platform-compliance"])).toBe("compliance");
    expect(shellLandingForKind("tenant_compliance")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "Compliance work",
    });
  });

  it("does not map shared analytics-viewer alone to Finance home", () => {
    expect(resolveDashboardKindFromRoles(["product-analytics-viewer"])).toBe(
      "org_member",
    );
    expect(resolveDashboardKindFromRoles(["finance-staff"])).toBe("tenant_finance");
  });

  it("hard-filters nav: Compliance sees documents/analytics/knowledge only", () => {
    const snap = {
      orgProductKeys: [
        "documents",
        "analytics",
        "knowledge",
        "projects",
        "qep",
        "support",
      ],
      productKeys: ["documents", "analytics", "knowledge"],
    };
    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "documents", workspace: "documents" },
        { id: "analytics", workspace: "analytics" },
        { id: "knowledge", workspace: "knowledge" },
        { id: "projects", workspace: "projects" },
        { id: "qep", workspace: "qep" },
        { id: "support", workspace: "support" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["analytics", "documents", "home", "knowledge"].sort(),
    );
    expect(softEvaluateProductAccess("documents", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
    expect(softEvaluateProductAccess("qep", snap).status).toBe("denied");
  });

  it("quick actions allow knowledge and deny Support/Projects/QEP/upload (auditor has no write)", () => {
    const result = listGlobalQuickActions({
      userPermissions: [
        "document.read",
        "document.audit",
        "document.retention",
        "knowledge.view",
        "knowledge.manage",
        "analytics.view",
      ],
      entitledProductKeys: ["documents", "analytics", "knowledge"],
    });
    const ids = result.actions.map((a) => a.id);
    expect(ids).toContain("qa-create-knowledge");
    expect(ids).not.toContain("qa-upload-document");
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-new-project");
    expect(ids).not.toContain("qa-run-test");
  });
});
