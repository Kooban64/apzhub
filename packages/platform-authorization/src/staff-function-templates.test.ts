import { describe, expect, it } from "vitest";

import {
  DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID,
  DEFAULT_PRODUCT_SUPPORT_AGENT_ROLE_ID,
  PRODUCT_ROLE_DEFINITIONS,
  STAFF_FUNCTION_CUSTOMER_SUPPORT_ID,
  STAFF_FUNCTION_ENGINEERING_ID,
  STAFF_FUNCTION_FINANCE_ID,
  STAFF_FUNCTION_COMPLIANCE_ID,
  STAFF_FUNCTION_EXECUTIVE_ID,
  STAFF_FUNCTION_QA_ID,
  STAFF_FUNCTION_SECURITY_ID,
  createInMemoryAuthorizationService,
  getStaffFunctionTemplate,
  listProductRoles,
  listStaffFunctionTemplates,
} from "./index";
import {
  DEFAULT_DEVELOPER_ROLE_ID,
  DEFAULT_SUPPORT_AGENT_ROLE_ID,
} from "./persona-roles";

describe("Phase A staff functions + product roles", () => {
  it("exposes Customer Support and Engineering templates without granting permissions", () => {
    const support = getStaffFunctionTemplate(STAFF_FUNCTION_CUSTOMER_SUPPORT_ID);
    expect(support?.orgJobRoleId).toBe(DEFAULT_SUPPORT_AGENT_ROLE_ID);
    expect(support?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "support",
      "time",
      "knowledge",
    ]);

    const engineering = getStaffFunctionTemplate(STAFF_FUNCTION_ENGINEERING_ID);
    expect(engineering?.orgJobRoleId).toBe(DEFAULT_DEVELOPER_ROLE_ID);
    expect(engineering?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "projects",
      "time",
      "qep",
      "pentest",
    ]);

    const finance = getStaffFunctionTemplate(STAFF_FUNCTION_FINANCE_ID);
    expect(finance?.orgJobRoleId).toBe("role-finance-staff");
    expect(finance?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "time",
      "workflow",
      "analytics",
      "documents",
    ]);

    const compliance = getStaffFunctionTemplate(STAFF_FUNCTION_COMPLIANCE_ID);
    expect(compliance?.orgJobRoleId).toBe("role-compliance-officer");
    expect(compliance?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "documents",
      "analytics",
      "knowledge",
    ]);

    const executive = getStaffFunctionTemplate(STAFF_FUNCTION_EXECUTIVE_ID);
    expect(executive?.orgJobRoleId).toBe("role-executive");
    expect(executive?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "analytics",
      "documents",
      "knowledge",
    ]);

    const qa = getStaffFunctionTemplate(STAFF_FUNCTION_QA_ID);
    expect(qa?.orgJobRoleId).toBe("role-qa-staff");
    expect(qa?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "qep",
      "projects",
      "time",
    ]);

    const security = getStaffFunctionTemplate(STAFF_FUNCTION_SECURITY_ID);
    expect(security?.orgJobRoleId).toBe("role-security-staff");
    expect(security?.suggestedProducts.map((p) => p.productKey)).toEqual([
      "pentest",
      "documents",
      "time",
    ]);
    expect(listStaffFunctionTemplates().length).toBe(7);
  });

  it("seeds product roles into the authorization catalogue", () => {
    const { service } = createInMemoryAuthorizationService();
    for (const role of PRODUCT_ROLE_DEFINITIONS) {
      expect(service.roleService.getRole(role.roleId)?.productKey).toBe(
        role.productKey,
      );
    }
    const support = service.roleService.listRolePermissions(
      DEFAULT_PRODUCT_SUPPORT_AGENT_ROLE_ID,
    );
    expect(support.some((g) => g.permissionKey === "support.*")).toBe(true);
    const requester = listProductRoles().find(
      (role) => role.slug === "product-support-requester",
    );
    expect(requester?.permissions).toContain("support.requests.list");
    expect(requester?.permissions).not.toContain("support.*");
    expect(requester?.permissions).not.toContain("support.requests.assign");
    const projects = service.roleService.listRolePermissions(
      DEFAULT_PRODUCT_PROJECTS_MEMBER_ROLE_ID,
    );
    expect(projects.some((g) => g.permissionKey === "projects.view")).toBe(true);
    expect(listProductRoles().length).toBeGreaterThanOrEqual(10);
  });

  it("keeps Support Agent, Developer, Finance, Compliance, and Executive org-job personas as shell baseline only", () => {
    const { service } = createInMemoryAuthorizationService();
    for (const roleId of [
      DEFAULT_SUPPORT_AGENT_ROLE_ID,
      DEFAULT_DEVELOPER_ROLE_ID,
      "role-finance-staff",
      "role-compliance-officer",
      "role-executive",
      "role-qa-staff",
      "role-security-staff",
    ]) {
      const keys = service.roleService
        .listRolePermissions(roleId)
        .map((g) => g.permissionKey);
      expect(keys).not.toContain("support.*");
      expect(keys).not.toContain("project.*");
      expect(keys).not.toContain("document.audit");
      expect(keys).not.toContain("analytics.view");
      expect(keys).toContain("workspace.*");
    }
  });
});
