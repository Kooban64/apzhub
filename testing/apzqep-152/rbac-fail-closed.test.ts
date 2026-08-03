/**
 * APZQEP-152 — fail-closed Cap RBAC (no HTTP elevation; role catalogue).
 */
import { describe, expect, it } from "vitest";

import {
  createInMemoryAuthorizationService,
  DEFAULT_QEP_OPERATOR_ROLE_ID,
  DEFAULT_TENANT_MEMBER_ROLE_ID,
  QEP_OPERATOR_PERMISSIONS,
} from "@apzhub/platform-authorization";
import {
  DEFAULT_PLATFORM_TENANT_ID,
  provisionDefaultAuthorizationForUser as provisionOnService,
} from "../../packages/platform-authorization/src/authorization-seed";
import { createEnterpriseTestSuiteManagement } from "@apzhub/qep-suites";

describe("APZQEP-152 Cap RBAC fail-closed", () => {
  it("does not grant Cap permissions to default tenant-member provision", () => {
    const { service } = createInMemoryAuthorizationService();
    const prev = process.env.APZQEP_QEP_AUTO_ASSIGN_OPERATOR;
    delete process.env.APZQEP_QEP_AUTO_ASSIGN_OPERATOR;
    try {
      provisionOnService(service, {
        userId: "user-member",
        tenantId: DEFAULT_PLATFORM_TENANT_ID,
      });
      const effective = service.getEffectivePermissions({
        userId: "user-member",
        tenantId: DEFAULT_PLATFORM_TENANT_ID,
      });
      expect(effective.effectivePermissions).not.toContain("qep.suites.read");
      expect(effective.effectivePermissions).not.toContain("qep.suites.create");
      expect(effective.roleIds).toContain(DEFAULT_TENANT_MEMBER_ROLE_ID);
    } finally {
      if (prev === undefined) delete process.env.APZQEP_QEP_AUTO_ASSIGN_OPERATOR;
      else process.env.APZQEP_QEP_AUTO_ASSIGN_OPERATOR = prev;
    }
  });

  it("grants Cap operator permissions when qep-operator is assigned", () => {
    const { service } = createInMemoryAuthorizationService();
    service.assignRole({
      userId: "user-op",
      roleId: DEFAULT_QEP_OPERATOR_ROLE_ID,
      productKey: "apzqep",
    });
    const effective = service.getEffectivePermissions({
      userId: "user-op",
      productKey: "apzqep",
    });
    for (const perm of QEP_OPERATOR_PERMISSIONS) {
      expect(effective.effectivePermissions).toContain(perm);
    }
  });

  it("denies Cap suite create without Cap permissions", async () => {
    const { service } = createEnterpriseTestSuiteManagement();
    await expect(
      service.create(
        {
          userId: "u1",
          tenantId: "t1",
          permissions: [],
        },
        { name: "Denied Suite" },
        new Date().toISOString(),
      ),
    ).rejects.toThrow(/permission/);
  });

  it("allows Cap suite create with Cap permissions", async () => {
    const { service } = createEnterpriseTestSuiteManagement();
    const suite = await service.create(
      {
        userId: "u1",
        tenantId: "t1",
        permissions: ["qep.suites.create", "qep.suites.read"],
      },
      { name: "Allowed Suite" },
      new Date().toISOString(),
    );
    expect(suite.name).toBe("Allowed Suite");
  });

  it("Cap HTTP handlers no longer elevate empty permission lists", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = path.resolve(process.cwd(), "apps/web/lib/api/v1/handlers");
    const files = [
      "qep-suites.ts",
      "qep-execution-plans.ts",
      "qep-execution-workspace.ts",
      "qep-defects.ts",
      "qep-enterprise-requirements.ts",
      "qep-enterprise-reporting.ts",
    ];
    for (const file of files) {
      const text = await fs.readFile(path.join(root, file), "utf8");
      expect(text).toMatch(/fail closed/);
      expect(text).not.toMatch(/base\.includes\(/);
      expect(text).toMatch(/permissions:\s*context\.serviceContext\.permissions/);
    }
  });
});
