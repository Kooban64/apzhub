import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_FINANCE_ID,
} from "@apzhub/platform-authorization";

describe("Phase A Finance vertical access", () => {
  it("Finance template suggests Time / Workflow / Analytics / Documents only", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_FINANCE_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "time",
      "workflow",
      "analytics",
      "documents",
    ]);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("support");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("qep");
  });

  it("maps finance-staff roles to tenant_finance (not platform finance console)", () => {
    expect(
      resolveDashboardKindFromRoles([
        "finance-staff",
        "product-workflow-operator",
        "product-analytics-viewer",
      ]),
    ).toBe("tenant_finance");
    expect(resolveDashboardKindFromRoles(["platform-finance"])).toBe("finance");
    expect(shellLandingForKind("tenant_finance")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "Finance work",
    });
  });

  it("hard-filters nav: Finance sees time/workflow/analytics/documents, not projects/qep/support", () => {
    const snap = {
      orgProductKeys: [
        "time",
        "workflow",
        "analytics",
        "documents",
        "projects",
        "qep",
        "support",
      ],
      productKeys: ["time", "workflow", "analytics", "documents"],
    };
    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "time", workspace: "time" },
        { id: "workflow", workspace: "workflow" },
        { id: "analytics", workspace: "analytics" },
        { id: "documents", workspace: "documents" },
        { id: "projects", workspace: "projects" },
        { id: "qep", workspace: "qep" },
        { id: "support", workspace: "support" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["analytics", "documents", "home", "time", "workflow"].sort(),
    );
    expect(softEvaluateProductAccess("time", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("workflow", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("projects", snap).status).toBe("denied");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
  });

  it("quick actions allow workflow/time/documents and deny Support/Projects/QEP", () => {
    const result = listGlobalQuickActions({
      userPermissions: ["*"],
      entitledProductKeys: ["time", "workflow", "analytics", "documents"],
    });
    const ids = result.actions.map((a) => a.id);
    expect(ids).toContain("qa-log-time");
    expect(ids).toContain("qa-start-workflow");
    expect(ids).toContain("qa-upload-document");
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-new-project");
    expect(ids).not.toContain("qa-run-test");
  });
});
