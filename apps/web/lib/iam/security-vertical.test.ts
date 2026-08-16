import { describe, expect, it } from "vitest";

import { filterWorkbenchItemsByProducts } from "@/lib/commercial/product-access";
import { softEvaluateProductAccess } from "@/lib/commercial/soft-product-access";
import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import {
  getStaffFunctionTemplate,
  STAFF_FUNCTION_SECURITY_ID,
} from "@apzhub/platform-authorization";

describe("Phase A Security vertical access", () => {
  it("Security template suggests PEN / Documents / Time only (no QEP)", () => {
    const tmpl = getStaffFunctionTemplate(STAFF_FUNCTION_SECURITY_ID);
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "pentest",
      "documents",
      "time",
    ]);
    expect(tmpl?.orgJobRoleId).toBe("role-security-staff");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("qep");
    expect(tmpl?.suggestedProducts.map((p) => p.productKey)).not.toContain("support");
  });

  it("maps security-staff to tenant_security", () => {
    expect(
      resolveDashboardKindFromRoles([
        "security-staff",
        "product-pentest-analyst",
        "product-documents-auditor",
      ]),
    ).toBe("tenant_security");
    expect(shellLandingForKind("tenant_security")).toEqual({
      shell: "workspace",
      path: "/workspace/home",
      label: "Security work",
    });
  });

  it("hard-filters nav: Security sees pentest/documents/time, not support/qep", () => {
    const snap = {
      orgProductKeys: ["pentest", "documents", "time", "support", "qep"],
      productKeys: ["pentest", "documents", "time"],
    };
    const allowed = new Set(snap.productKeys);
    const items = filterWorkbenchItemsByProducts(
      [
        { id: "pentest", workspace: "pentest" },
        { id: "documents", workspace: "documents" },
        { id: "time", workspace: "time" },
        { id: "support", workspace: "support" },
        { id: "qep", workspace: "qep" },
        { id: "home", workspace: "home" },
      ],
      allowed,
    );
    expect(items.map((i) => i.id).sort()).toEqual(
      ["documents", "home", "pentest", "time"].sort(),
    );
    expect(softEvaluateProductAccess("pentest", snap).status).toBe("allowed");
    expect(softEvaluateProductAccess("qep", snap).status).toBe("denied");
    expect(softEvaluateProductAccess("support", snap).status).toBe("denied");
  });

  it("quick actions allow time and deny Support/QEP/upload", () => {
    const result = listGlobalQuickActions({
      userPermissions: ["time.*", "testing.*", "document.read", "document.audit"],
      entitledProductKeys: ["pentest", "documents", "time"],
    });
    const ids = result.actions.map((a) => a.id);
    expect(ids).toContain("qa-log-time");
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-run-test");
    expect(ids).not.toContain("qa-upload-document");
  });
});
