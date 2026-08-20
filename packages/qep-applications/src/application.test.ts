import { describe, expect, it } from "vitest";

import { assertNoRawSecrets } from "./domain/guards";
import { createQepApplicationRegistry } from "./compose";
import {
  createApplicationContextResolver,
  mergeDeterministicLegacyClaims,
} from "./domain/application-context-resolver";

describe("QEP Application registry", () => {
  it("creates a durable application with tenant ownership", async () => {
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      name: "APZHUB",
      key: "HUB",
      actorId: "user_1",
      ownerUserId: "user_1",
      status: "active",
    });
    expect(app.id.startsWith("qapp-")).toBe(true);
    expect(app.tenantId).toBe("tenant_a");
    expect(app.key).toBe("HUB");
    const listed = await registry.service.list({ tenantId: "tenant_a" });
    expect(listed).toHaveLength(1);
  });

  it("isolates applications by tenant", async () => {
    const registry = createQepApplicationRegistry();
    await registry.service.create({
      tenantId: "tenant_a",
      name: "APZHUB",
      key: "HUB",
      actorId: "user_1",
    });
    const other = await registry.service.list({ tenantId: "tenant_b" });
    expect(other).toHaveLength(0);
    await expect(registry.service.get("tenant_b", "missing")).rejects.toThrow(
      "application.not_found",
    );
  });

  it("archives without destroying the application record", async () => {
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      name: "LoveBloom",
      key: "LOVE",
      actorId: "user_1",
    });
    await registry.service.archive("tenant_a", app.id, "user_1");
    const visible = await registry.service.list({ tenantId: "tenant_a" });
    expect(visible).toHaveLength(0);
    const archived = await registry.service.get("tenant_a", app.id);
    expect(archived.status).toBe("archived");
    expect(archived.archivedAt).toBeTruthy();
  });

  it("binds environments and execution targets to the application", async () => {
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      name: "APZHUB",
      key: "HUB",
      actorId: "user_1",
    });
    const env = await registry.service.createEnvironment("tenant_a", app.id, {
      name: "QA",
      category: "test",
      actorId: "user_1",
    });
    expect(env.applicationId).toBe(app.id);
    const target = await registry.service.createExecutionTarget("tenant_a", app.id, {
      name: "QA Host",
      targetType: "remote_host",
      actorId: "user_1",
      environmentId: env.id,
      config: { host: "qa-app-01", port: 22, credentialRef: "vault://qep/qa-host" },
    });
    expect(target.applicationId).toBe(app.id);
    expect(target.environmentId).toBe(env.id);
    expect(target.config.credentialRef).toBe("vault://qep/qa-host");
  });

  it("rejects Web/API/Repository as infrastructure execution target types", async () => {
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      name: "APZHUB",
      key: "HUB",
      actorId: "user_1",
    });
    await expect(
      registry.service.createExecutionTarget("tenant_a", app.id, {
        name: "Web surface",
        targetType: "web",
        actorId: "user_1",
      }),
    ).rejects.toThrow("application.execution_target.type_invalid");
  });

  it("rejects raw SSH secrets on remote host configuration", async () => {
    expect(() => assertNoRawSecrets({ privateKey: "BEGIN RSA" })).toThrow(
      "application.execution_target.raw_secret_forbidden",
    );
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      name: "APZHUB",
      key: "HUB",
      actorId: "user_1",
    });
    await expect(
      registry.service.createExecutionTarget("tenant_a", app.id, {
        name: "QA Host",
        targetType: "remote_host",
        actorId: "user_1",
        config: { password: "secret" },
      }),
    ).rejects.toThrow("application.execution_target.raw_secret_forbidden");
  });

  it("associating a repository does not imply Source entitlement in the model", async () => {
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      name: "APZHUB",
      key: "HUB",
      actorId: "user_1",
    });
    const link = await registry.service.attachRepository(
      "tenant_a",
      app.id,
      "repo_1",
      "user_1",
    );
    expect(link.scmRepositoryId).toBe("repo_1");
    expect(Object.keys(link)).not.toContain("sourceRead");
  });
});

describe("Application ↔ legacy project reconciliation", () => {
  it("maps application id, key, and imported portfolio id deterministically", async () => {
    const registry = createQepApplicationRegistry();
    const app = await registry.service.create({
      tenantId: "tenant_a",
      id: "qproj-imported",
      name: "Payments",
      key: "PAY",
      actorId: "user_1",
      legacyQualityProjectId: "qproj-imported",
    });
    const refs = await registry.service.listLegacyRefs("tenant_a");
    const resolved = refs.filter((row) => row.applicationId === app.id);
    expect(resolved.map((row) => row.projectRef).sort()).toEqual([
      "PAY",
      "qproj-imported",
    ]);
  });

  it("records observed project refs as UNRESOLVED when they do not match an application", async () => {
    const registry = createQepApplicationRegistry();
    await registry.service.create({
      tenantId: "tenant_a",
      name: "Payments",
      key: "PAY",
      actorId: "user_1",
    });
    await registry.service.recordObservedProjectRefs("tenant_a", ["default", "PAY"]);
    const refs = await registry.service.listLegacyRefs("tenant_a");
    const unresolved = refs.filter((row) => !row.applicationId);
    expect(unresolved.map((row) => row.projectRef)).toEqual(["default"]);
    expect(refs.find((row) => row.projectRef === "PAY")?.applicationId).toBeTruthy();
  });

  it("does not guess when two applications claim the same ref at equal rank", () => {
    const claims = mergeDeterministicLegacyClaims([
      {
        id: "qapp-a",
        tenantId: "t",
        key: "ONE",
        name: "A",
        status: "active",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdBy: "u",
        updatedBy: "u",
        legacyQualityProjectId: "SHARED",
      },
      {
        id: "qapp-b",
        tenantId: "t",
        key: "TWO",
        name: "B",
        status: "active",
        revision: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdBy: "u",
        updatedBy: "u",
        legacyQualityProjectId: "SHARED",
      },
    ]);
    expect(claims.some((row) => row.projectRef === "SHARED")).toBe(false);
  });

  it("labels associated records with the application and leaves unresolved unbound", () => {
    const resolver = createApplicationContextResolver({
      applications: [{ id: "qapp-1", name: "Payments" }],
      associations: [
        { projectRef: "qapp-1", applicationId: "qapp-1" },
        { projectRef: "PAY", applicationId: "qapp-1" },
        { projectRef: "default" },
      ],
    });
    expect(resolver.displayContext("PAY")).toBe("Payments");
    expect(resolver.isAssociated("PAY", "qapp-1")).toBe(true);
    expect(resolver.displayContext("default")).toBe("Unbound");
    expect(resolver.isAssociated("default", "qapp-1")).toBe(false);
    expect(resolver.displayContext(undefined)).toBe("—");
  });
});
