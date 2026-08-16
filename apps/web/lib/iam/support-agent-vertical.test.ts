import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_CUSTOMER_SUPPORT_ID,
} from "@apzhub/platform-authorization";

describe("Phase A Support Agent vertical access", () => {
  it("Customer Support template suggests Support / Time / Knowledge only", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_CUSTOMER_SUPPORT_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "support",
      "time",
      "knowledge",
    ]);
  });

  it("maps product-support-agent roles to tenant_support workspace landing", () => {
    expect(
      resolveDashboardKindFromRoles(["product-support-agent", "support-agent"]),
    ).toBe("tenant_support");
    expect(shellLandingForKind("tenant_support")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "Support work",
    });
    // Platform support still lands on ops — distinct from tenant Support Agent.
    expect(resolveDashboardKindFromRoles(["platform-support"])).toBe("support");
  });

  it("hard-filters nav: Support Agent sees support/time/knowledge, not projects/qep", () => {
    const snap = {
      organisationId: "apzor",
      userId: "agent-1",
      orgProductKeys: ["support", "time", "knowledge", "projects", "qep"],
      productKeys: ["support", "time", "knowledge"],
      moduleIds: ["support", "time", "knowledge"],
    };

    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "support", workspace: "support" },
        { id: "time", workspace: "time" },
        { id: "knowledge", workspace: "knowledge" },
        { id: "projects", workspace: "projects" },
        { id: "qep", workspace: "qep" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["home", "knowledge", "support", "time"].sort(),
    );

    expect(softEvaluateProductAccess("support", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("projects", snap).status).toBe("denied");
    expect(softEvaluateProductAccess("qep", snap).status).toBe("denied");
  });

  it("denies product when org subscribed but user not granted", () => {
    const snap = {
      orgProductKeys: ["support", "time"],
      productKeys: ["time"],
    };
    expect(softEvaluateProductAccess("time", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
  });
});
