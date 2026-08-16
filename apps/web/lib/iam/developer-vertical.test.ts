import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_ENGINEERING_ID,
} from "@apzhub/platform-authorization";

describe("Phase A Developer vertical access", () => {
  it("Engineering template suggests Projects / Time / QEP / PEN only", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_ENGINEERING_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "projects",
      "time",
      "qep",
      "pentest",
    ]);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("support");
  });

  it("maps developer product roles to tenant_developer workspace landing", () => {
    expect(
      resolveDashboardKindFromRoles([
        "product-projects-member",
        "product-qep-engineer",
        "developer",
      ]),
    ).toBe("tenant_developer");
    expect(shellLandingForKind("tenant_developer")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "Engineering work",
    });
  });

  it("hard-filters nav: Developer sees projects/time/qep/pentest, not support", () => {
    const snap = {
      orgProductKeys: ["projects", "time", "qep", "pentest", "support"],
      productKeys: ["projects", "time", "qep", "pentest"],
    };
    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "projects", workspace: "projects" },
        { id: "time", workspace: "time" },
        { id: "qep", workspace: "qep" },
        { id: "apzpen", workspace: "apzpen" },
        { id: "support", workspace: "support" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["apzpen", "home", "projects", "qep", "time"].sort(),
    );
    expect(softEvaluateProductAccess("projects", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("qep", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
  });

  it("quick actions exclude Support ticket for Developer product set", () => {
    const result = listGlobalQuickActions({
      userPermissions: ["*"],
      entitledProductKeys: ["projects", "time", "qep", "pentest"],
    });
    const ids = result.actions.map((a) => a.id);
    expect(ids).toContain("qa-new-project");
    expect(ids).toContain("qa-log-time");
    expect(ids).toContain("qa-run-test");
    expect(ids).not.toContain("qa-new-ticket");
  });
});
