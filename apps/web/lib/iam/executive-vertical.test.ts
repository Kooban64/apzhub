import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_EXECUTIVE_ID,
} from "@apzhub/platform-authorization";

describe("Phase A Executive vertical access", () => {
  it("Executive template suggests Analytics / Documents / Knowledge only", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_EXECUTIVE_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "analytics",
      "documents",
      "knowledge",
    ]);
    expect(tmpl?.orgJobRoleId).toBe("role-executive");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("support");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("qep");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("time");
  });

  it("maps executive to tenant_executive workspace home", () => {
    expect(
      resolveDashboardKindFromRoles([
        "executive",
        "product-analytics-viewer",
        "product-documents-auditor",
        "product-knowledge-viewer",
      ]),
    ).toBe("tenant_executive");
    expect(shellLandingForKind("tenant_executive")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "Executive work",
    });
  });

  it("hard-filters nav: Executive sees analytics/documents/knowledge only", () => {
    const snap = {
      orgProductKeys: [
        "analytics",
        "documents",
        "knowledge",
        "projects",
        "support",
        "qep",
      ],
      productKeys: ["analytics", "documents", "knowledge"],
    };
    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "analytics", workspace: "analytics" },
        { id: "documents", workspace: "documents" },
        { id: "knowledge", workspace: "knowledge" },
        { id: "projects", workspace: "projects" },
        { id: "support", workspace: "support" },
        { id: "qep", workspace: "qep" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["analytics", "documents", "home", "knowledge"].sort(),
    );
    expect(softEvaluateProductAccess("analytics", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
  });

  it("quick actions deny Support/Projects/QEP/upload; knowledge view may surface create QA", () => {
    const result = listGlobalQuickActions({
      userPermissions: [
        "analytics.view",
        "document.read",
        "document.audit",
        "knowledge.view",
      ],
      entitledProductKeys: ["analytics", "documents", "knowledge"],
    });
    const ids = result.actions.map((a) => a.id);
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-new-project");
    expect(ids).not.toContain("qa-run-test");
    expect(ids).not.toContain("qa-upload-document");
  });
});
