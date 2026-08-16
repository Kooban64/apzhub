import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_QA_ID,
} from "@apzhub/platform-authorization";

describe("Phase A QA vertical access", () => {
  it("QA template suggests QEP / Projects / Time only (no PEN)", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_QA_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "qep",
      "projects",
      "time",
    ]);
    expect(tmpl?.orgJobRoleId).toBe("role-qa-staff");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("pentest");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("support");
  });

  it("maps qa-staff to tenant_qa (not tenant_developer)", () => {
    expect(
      resolveDashboardKindFromRoles([
        "qa-staff",
        "product-qep-engineer",
        "product-projects-member",
      ]),
    ).toBe("tenant_qa");
    expect(resolveDashboardKindFromRoles(["developer", "product-qep-engineer"])).toBe(
      "tenant_developer",
    );
    expect(shellLandingForKind("tenant_qa")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "QA work",
    });
  });

  it("hard-filters nav: QA sees qep/projects/time, not support/pentest", () => {
    const snap = {
      orgProductKeys: ["qep", "projects", "time", "support", "pentest"],
      productKeys: ["qep", "projects", "time"],
    };
    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "qep", workspace: "qep" },
        { id: "projects", workspace: "projects" },
        { id: "time", workspace: "time" },
        { id: "support", workspace: "support" },
        { id: "pentest", workspace: "pentest" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["home", "projects", "qep", "time"].sort(),
    );
    expect(softEvaluateProductAccess("qep", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
    expect(softEvaluateProductAccess("pentest", snap).status).toBe("denied");
  });

  it("quick actions allow run-test/project/time and deny Support", () => {
    const result = listGlobalQuickActions({
      userPermissions: ["*"],
      entitledProductKeys: ["qep", "projects", "time"],
    });
    const ids = result.actions.map((a) => a.id);
    expect(ids).toContain("qa-run-test");
    expect(ids).toContain("qa-new-project");
    expect(ids).toContain("qa-log-time");
    expect(ids).not.toContain("qa-new-ticket");
  });
});
