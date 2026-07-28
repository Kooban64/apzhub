/**
 * APZIDENTITY-005 — Identity Administration vertical certification harness.
 * Ten production-boundary journeys + artefact / classification gates.
 * No new product functionality.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_IDENTITY_PERMISSIONS } from "@apzhub/identity-contracts";
import {
  createIdentityPlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isIdentityServiceEnabled,
  resolveOperationAuthorization,
} from "@apzhub/platform-services";
import {
  createEmptyIdentityInMemoryStores,
  createIdentityPersistence,
} from "@apzhub/identity-persistence";
import { createIdentityFoundation } from "@apzhub/identity-core";
import {
  asIdentityAuditId,
  asIdentityHistoryId,
  asIdentityUserId,
  type IdentityRequestContext,
} from "@apzhub/identity-contracts";

const ROOT = join(__dirname, "../..");

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_iam_a",
    userId: "actor_iam",
    organisationId: "org_iam_a",
    correlationId: "corr_apzidentity_005",
    permissions: ["identity.*"],
    ...overrides,
  };
}

function bundle(options?: {
  readonly authorizationMode?: "allow-all" | "production";
  readonly accessResolver?: InMemoryAuthorizationAccessResolver;
}) {
  let seq = 0;
  const identity = createIdentityPlatformServicesForTest({
    allowInMemoryPersistence: true,
    id: () => `iam_cert_${++seq}`,
  });
  return createPlatformServices({
    identity,
    authorizationMode: options?.authorizationMode ?? "allow-all",
    accessResolver: options?.accessResolver,
  });
}

describe("APZIDENTITY-005 Identity Vertical Certification", () => {
  it("passes vertical architecture audit (0 violations)", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzidentity-005-identity-vertical-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("Journey 1 — user metadata lifecycle with audit/history", async () => {
    const services = bundle();
    const identity = services.gateway.identity;

    const user = await identity.users.create(ctx(), {
      displayName: "Cert User",
      email: "cert.user@example.com",
      authSubjectRef: "auth:cert-user",
    });
    expect(user.status).toBe("draft");
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");

    const read = await identity.users.get(ctx(), user.id);
    expect(read.email).toBe("cert.user@example.com");

    const updated = await identity.users.update(ctx(), {
      userId: user.id,
      displayName: "Cert User Updated",
    });
    expect(updated.displayName).toBe("Cert User Updated");

    const listed = await identity.users.list(ctx());
    expect(listed.some((item) => item.id === user.id)).toBe(true);

    await identity.activation.create(ctx(), {
      userId: user.id,
      reason: "cert-activate",
    });
    expect((await identity.users.get(ctx(), user.id)).status).toBe("active");

    await identity.deactivation.create(ctx(), {
      userId: user.id,
      reason: "cert-deactivate",
    });
    expect((await identity.users.get(ctx(), user.id)).status).toBe("deactivated");

    await identity.activation.create(ctx(), {
      userId: user.id,
      reason: "cert-reactivate",
    });
    expect((await identity.users.get(ctx(), user.id)).status).toBe("active");

    const audits = await identity.audit.list(ctx());
    expect(audits.length).toBeGreaterThan(0);
    const history = await identity.history.list(ctx(), user.id);
    expect(history.length).toBeGreaterThan(0);
  });

  it("Journey 2 — organisation and tenant isolation", async () => {
    const stores = createEmptyIdentityInMemoryStores();
    const repos = createIdentityPersistence({ mode: "memory", stores });
    const foundation = createIdentityFoundation({ repos });
    const now = "2026-07-17T00:00:00.000Z";

    const ctxA: IdentityRequestContext = {
      tenantId: "tenant_a",
      userId: "actor_a",
    };
    const ctxB: IdentityRequestContext = {
      tenantId: "tenant_b",
      userId: "actor_b",
    };

    const userA = await foundation.users.create(ctxA, {
      id: asIdentityUserId("user_a"),
      tenantId: "tenant_a",
      displayName: "Tenant A User",
      email: "a@example.com",
      authSubjectRef: "auth:a",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "actor_a",
      updatedBy: "actor_a",
      revision: 1,
    });
    const userB = await foundation.users.create(ctxB, {
      id: asIdentityUserId("user_b"),
      tenantId: "tenant_b",
      displayName: "Tenant B User",
      email: "b@example.com",
      authSubjectRef: "auth:b",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "actor_b",
      updatedBy: "actor_b",
      revision: 1,
    });

    expect(await foundation.users.get(ctxA, userA.id)).toBeDefined();
    expect(await foundation.users.get(ctxB, userA.id)).toBeNull();
    expect(await foundation.users.get(ctxA, userB.id)).toBeNull();
    expect((await foundation.users.list(ctxA)).map((u) => u.id)).toEqual([userA.id]);
    expect((await foundation.users.list(ctxB)).map((u) => u.id)).toEqual([userB.id]);

    // Gateway production path: empty permissions deny cross-context reads
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const services = bundle({
      authorizationMode: "production",
      accessResolver,
    });
    await expect(
      services.gateway.identity.users.list(ctx({ permissions: [] })),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));
  });

  it("Journey 3 — groups, roles and memberships", async () => {
    const identity = bundle().gateway.identity;
    const user = await identity.users.create(ctx(), {
      displayName: "Member User",
      email: "member@example.com",
    });
    const group = await identity.groups.create(ctx(), {
      key: "cert-group",
      name: "Cert Group",
    });
    const role = await identity.roles.create(ctx(), {
      key: "cert-role",
      name: "Cert Role",
    });
    const membership = await identity.memberships.create(ctx(), {
      userId: user.id,
      kind: "group",
      targetId: group.id,
    });
    expect(membership.status).toBe("active");
    expect(
      (await identity.memberships.list(ctx())).some((m) => m.id === membership.id),
    ).toBe(true);
    expect(await identity.roles.get(ctx(), role.id)).toMatchObject({
      name: "Cert Role",
    });

    const denied = bundle({
      authorizationMode: "production",
      accessResolver: new InMemoryAuthorizationAccessResolver(),
    });
    await expect(
      denied.gateway.identity.memberships.create(
        ctx({ permissions: ["identity.read"] }),
        {
          userId: user.id,
          kind: "role",
          targetId: role.id,
        },
      ),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));
  });

  it("Journey 4 — service assignments metadata only", async () => {
    const identity = bundle().gateway.identity;
    const user = await identity.users.create(ctx(), {
      displayName: "Assigned User",
      email: "assigned@example.com",
    });
    const assignment = await identity.serviceAssignments.create(ctx(), {
      subjectKind: "user",
      subjectId: user.id,
      serviceCapability: "projects",
    });
    expect(assignment.serviceCapability).toBe("projects");
    expect(assignment).not.toHaveProperty("credentials");
    expect(assignment).not.toHaveProperty("providerAccountId");

    const updated = await identity.serviceAssignments.update(ctx(), {
      assignmentId: assignment.id,
      status: "suspended",
    });
    expect(updated.status).toBe("suspended");

    const readiness = await identity.diagnostics.readiness(ctx());
    expect(readiness.provisioningEnabled).toBe(false);
    expect(readiness.authenticationManaged).toBe(false);

    const audits = await identity.audit.list(ctx());
    expect(audits.length).toBeGreaterThan(0);
  });

  it("Journey 5 — invitations metadata only (no email/token/password)", async () => {
    const identity = bundle().gateway.identity;
    const invitation = await identity.invitations.create(ctx(), {
      email: "invitee@example.com",
    });
    expect(invitation.email).toBe("invitee@example.com");
    expect(invitation).not.toHaveProperty("token");
    expect(invitation).not.toHaveProperty("acceptanceToken");
    expect(invitation).not.toHaveProperty("password");
    expect(JSON.stringify(invitation)).not.toMatch(/smtp|sendMail|mailgun/i);

    const updated = await identity.invitations.update(ctx(), {
      invitationId: invitation.id,
      status: "revoked",
    });
    expect(updated.status).toBe("revoked");
    expect((await identity.audit.list(ctx())).length).toBeGreaterThan(0);
  });

  it("Journey 6 — authorization denial matrix", async () => {
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const baseSnapshot = {
      subject: { userId: "actor_iam", status: "active" as const },
      tenantMemberships: [
        { tenantId: "tenant_iam_a", status: "active" as const, isPrimary: true },
      ],
      organisationMemberships: [
        {
          organisationId: "org_iam_a",
          tenantId: "tenant_iam_a",
          status: "active" as const,
        },
      ],
      roleIds: ["role-identity-admin"],
      roleSlugs: ["identity-admin"],
      denyPermissions: [] as string[],
      isPlatformAdministrator: false,
    };
    // No permissions — deny-by-default
    accessResolver.set("actor_iam", "tenant_iam_a", {
      ...baseSnapshot,
      allowPermissions: [],
    });
    const identity = createIdentityPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const services = createPlatformServices({
      identity,
      authorizationMode: "production",
      accessResolver,
    });
    const gw = services.gateway.identity;

    await expect(gw.users.list(ctx())).rejects.toSatisfy((error: unknown) =>
      isPlatformServiceError(error),
    );

    // Read-only permission cannot mutate
    accessResolver.set("actor_iam", "tenant_iam_a", {
      ...baseSnapshot,
      allowPermissions: ["identity.read"],
    });
    await expect(
      gw.users.create(ctx(), {
        displayName: "Nope",
        email: "nope@example.com",
      }),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));

    // Granular management permission allows create when account is active
    accessResolver.set("actor_iam", "tenant_iam_a", {
      ...baseSnapshot,
      allowPermissions: ["identity.user"],
    });
    const created = await gw.users.create(ctx(), {
      displayName: "Allowed",
      email: "allowed@example.com",
    });
    expect(created.id).toBeTruthy();

    expect(
      resolveOperationAuthorization("identityUsers", "create")?.requiredPermission,
    ).toBe("identity.user");
    expect(
      resolveOperationAuthorization("identityServiceAssignments", "create")
        ?.requiredPermission,
    ).toBe("identity.assignment");
  });

  it("Journey 7 — disabled service gate (APZHUB_IDENTITY_ENABLED)", () => {
    expect(isIdentityServiceEnabled({})).toBe(false);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "false" })).toBe(false);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "true" })).toBe(true);

    const withoutIdentity = createPlatformServices({
      authorizationMode: "allow-all",
    });
    expect(() => withoutIdentity.gateway.identity).toThrow(/not enabled/);

    const view = readFileSync(
      join(ROOT, "apps/web/components/identity/platform-identity-view.tsx"),
      "utf8",
    );
    expect(view).toContain("identity-unavailable");
    expect(view).toMatch(/IDENTITY_SERVICE_UNAVAILABLE|isUnavailable/);

    const handler = readFileSync(
      join(ROOT, "apps/web/lib/api/v1/handlers/identity.ts"),
      "utf8",
    );
    expect(handler).toContain("IDENTITY_SERVICE_UNAVAILABLE");
    expect(handler).toContain("503");
  });

  it("Journey 8 — persistence failure maps to safe errors (no silent fallback)", async () => {
    expect(() => createIdentityPlatformServicesForTest({} as never)).toThrow(
      /allowInMemoryPersistence/,
    );

    const identity = createIdentityPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    expect(identity.readiness.persistenceMode).toBe("memory");
    expect(identity.readiness.authenticationManaged).toBe(false);
    expect(identity.readiness.provisioningEnabled).toBe(false);

    // Production factory requires postgres — no silent memory
    const { createIdentityPlatformServicesForProduction } =
      await import("@apzhub/platform-services");
    expect(() => createIdentityPlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );
  });

  it("Journey 9 — audit and history immutability", async () => {
    const stores = createEmptyIdentityInMemoryStores();
    const repos = createIdentityPersistence({ mode: "memory", stores });
    expect(typeof repos.audits.append).toBe("function");
    expect(typeof repos.audits.get).toBe("function");
    expect(typeof repos.audits.list).toBe("function");
    expect(repos.audits).not.toHaveProperty("update");
    expect(repos.audits).not.toHaveProperty("delete");
    expect(typeof repos.history.create).toBe("function");
    expect(repos.history).not.toHaveProperty("update");
    expect(repos.history).not.toHaveProperty("delete");

    const view = readFileSync(
      join(ROOT, "apps/web/components/identity/platform-identity-view.tsx"),
      "utf8",
    );
    expect(view).toContain('section === "audit"');
    expect(view).toContain('section === "history"');
    expect(view).not.toMatch(/Delete audit|Update audit|deleteAudit|updateAudit/);

    // HTTP: no DELETE routes under audit/history
    expect(
      existsSync(join(ROOT, "apps/web/app/api/v1/identity/audit/[auditId]/route.ts")),
    ).toBe(true);
    const auditRoute = readFileSync(
      join(ROOT, "apps/web/app/api/v1/identity/audit/[auditId]/route.ts"),
      "utf8",
    );
    expect(auditRoute).toContain("handleGetIdentityAuditEntry");
    expect(auditRoute).toContain("methodNotAllowedResponse");
    expect(auditRoute).toMatch(/methodNotAllowedResponse\(\["GET"\]/);
    expect(auditRoute).not.toMatch(/handle(?:Update|Delete|Patch)IdentityAudit/);

    const identity = bundle().gateway.identity;
    const user = await identity.users.create(ctx(), {
      displayName: "Audit User",
      email: "audit@example.com",
    });
    const audits = await identity.audit.list(ctx());
    expect(audits[0]?.createdAt).toBeTruthy();
    expect(audits[0]?.actorUserId || audits[0]?.action).toBeTruthy();
    const history = await identity.history.list(ctx(), user.id);
    expect(history[0]?.createdAt).toBeTruthy();

    // IDs are opaque branded strings in persistence layer
    expect(asIdentityAuditId("aud_x")).toBe("aud_x");
    expect(asIdentityHistoryId("hist_x")).toBe("hist_x");
  });

  it("Journey 10 — Workbench production path artefacts and boundaries", () => {
    const required = [
      "apps/web/components/identity/platform-identity-view.tsx",
      "apps/web/components/identity/identity-workspace-router.tsx",
      "apps/web/lib/identity/identity-client.ts",
      "apps/web/lib/identity/identity-api.ts",
      "apps/web/lib/identity/routes.ts",
      "packages/workbench-framework/manifests/platform-identity/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-users/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-diagnostics/module.yaml",
      "testing/playwright/e2e/apzidentity-004-identity-workbench.spec.ts",
    ];
    for (const path of required) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }

    const routes = readFileSync(join(ROOT, "apps/web/lib/identity/routes.ts"), "utf8");
    expect(routes).toContain("/workspace/identity");

    const view = readFileSync(
      join(ROOT, "apps/web/components/identity/platform-identity-view.tsx"),
      "utf8",
    );
    expect(view).toContain("identity-api");
    expect(view).not.toContain("getPlatformServiceGateway");
    expect(view).not.toContain("@apzhub/identity-core");
    expect(view).not.toMatch(/\bfetch\s*\(/);
    expect(view).toContain("AUTHENTICATION NOT MANAGED");
    expect(view).toContain("PROVISIONING NOT AVAILABLE");
    expect(view).toContain("DIRECTORY SYNC");

    const shell = readFileSync(
      join(ROOT, "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(shell).toContain("IdentityWorkspaceRouter");
    expect(shell).toContain("isIdentityRoute");

    expect(existsSync(join(ROOT, "apps/web/app/workspace/identity"))).toBe(false);
  });

  it("certifies OpenAPI 1.9.x–1.14.x Identity surface and route count", () => {
    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(openapi).toContain("Platform Identity Administration");
    expect(openapi).toMatch(/version:\s*1\.(9|10|11|12|13|14)\.\d+/);
    for (const path of [
      "/identity/users",
      "/identity/groups",
      "/identity/service-assignments",
      "/identity/invitations",
      "/identity/health",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).not.toMatch(/\n {2}\/identity\/login:/);
    expect(openapi).not.toMatch(/\n {2}\/identity\/scim:/);

    function countRoutes(dir: string): number {
      let count = 0;
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) count += countRoutes(full);
        else if (entry === "route.ts") count += 1;
      }
      return count;
    }
    expect(countRoutes(join(ROOT, "apps/web/app/api/v1/identity"))).toBe(36);
  });

  it("certifies permission catalogue and package versions", () => {
    expect(PLATFORM_IDENTITY_PERMISSIONS).toContain("identity.read");
    expect(PLATFORM_IDENTITY_PERMISSIONS).toContain("identity.user");
    expect(PLATFORM_IDENTITY_PERMISSIONS).toContain("identity.assignment");

    const versions: Record<string, string> = {
      "packages/identity-contracts/package.json": "0.2.0",
      "packages/identity-core/package.json": "0.2.0",
      "packages/identity-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.32.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const version = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(version, path).toBe(expected);
    }
  });

  it("asserts PRODUCTION_READY_WITH_LIMITATIONS and recommends APZIDENTITY-006 only", () => {
    const report = readFileSync(
      join(ROOT, "docs/sprint/APZIDENTITY-005-completion-report.md"),
      "utf8",
    );
    expect(report).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(report).toContain("APZIDENTITY-006");
    expect(report).toMatch(/Wave Certification|Architecture Freeze/i);
    expect(report).not.toMatch(/implement APZIDENTITY-006/i);

    const readiness = readFileSync(
      join(ROOT, "docs/reviews/APZIDENTITY-005-Production-Readiness.md"),
      "utf8",
    );
    expect(readiness).toContain("PRODUCTION_READY_WITH_LIMITATIONS");

    for (const artefact of [
      "docs/reviews/APZIDENTITY-005-Vertical-Certification.md",
      "docs/reviews/APZIDENTITY-005-Security-Review.md",
      "docs/reviews/APZIDENTITY-005-Known-Limitations.md",
      "docs/reviews/APZIDENTITY-005-Operational-Readiness.md",
      "docs/reviews/APZIDENTITY-005-Quality-Evidence.md",
    ]) {
      expect(existsSync(join(ROOT, artefact)), artefact).toBe(true);
    }
  });
});
