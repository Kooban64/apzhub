import { describe, expect, it } from "vitest";

import {
  createInMemoryTestingPersistence,
  PersistenceError,
  type RepositoryContext,
} from "../../index";

const ctx: RepositoryContext = {
  tenantId: "tenant-a",
  organisationId: "org-1",
  actorUserId: "user-1",
  permissions: ["release.*"],
  correlationId: "corr-release-1",
};

const otherTenant: RepositoryContext = {
  ...ctx,
  tenantId: "tenant-b",
};

describe("release governance persistence", () => {
  it("supports in-memory CRUD create/get/list/update for releases", async () => {
    const db = createInMemoryTestingPersistence();
    const created = await db.releases.create(ctx, {
      key: "REL-1",
      name: "Sprint 14",
      status: "draft",
      description: "First release",
      metadataJson: { track: "tcms" },
    });
    expect(created.revision).toBe(1);
    expect(created.tenantId).toBe("tenant-a");
    expect(created.key).toBe("REL-1");
    expect(created.status).toBe("draft");

    const got = await db.releases.get(ctx, created.id);
    expect(got?.name).toBe("Sprint 14");

    const listed = await db.releases.list(ctx);
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.key).toBe("REL-1");

    const updated = await db.releases.update(ctx, created.id, 1, {
      status: "planning",
      name: "Sprint 14b",
    });
    expect(updated.revision).toBe(2);
    expect(updated.status).toBe("planning");
    expect(updated.name).toBe("Sprint 14b");
  });

  it("adds scope and evidence under a release", async () => {
    const db = createInMemoryTestingPersistence();
    const release = await db.releases.create(ctx, {
      key: "REL-2",
      name: "Scoped",
      status: "draft",
    });

    const scope = await db.releaseScopes.create(ctx, {
      releaseId: release.id,
      kind: "plan",
      refId: "plan-1",
      label: "Main plan",
    });
    expect(scope.releaseId).toBe(release.id);
    expect(scope.kind).toBe("plan");

    const evidence = await db.releaseEvidence.create(ctx, {
      releaseId: release.id,
      kind: "report",
      refId: "ev-1",
      summary: "Coverage report",
    });
    expect(evidence.releaseId).toBe(release.id);
    expect(evidence.kind).toBe("report");

    const scopes = await db.releaseScopes.list(ctx);
    expect(scopes.total).toBe(1);
    const evidencePage = await db.releaseEvidence.list(ctx);
    expect(evidencePage.total).toBe(1);
  });

  it("appends release audit entries", async () => {
    const db = createInMemoryTestingPersistence();
    const release = await db.releases.create(ctx, {
      key: "REL-3",
      name: "Audited",
      status: "draft",
    });

    const entry = await db.releaseAudits.append(ctx, {
      id: "audit-rel-1",
      tenantId: ctx.tenantId,
      releaseId: release.id,
      action: "release.created",
      summary: "Release created",
      detailsJson: { key: "REL-3" },
    });
    expect(entry.id).toBe("audit-rel-1");
    expect(entry.releaseId).toBe(release.id);
    expect(entry.occurredAt).toBeTruthy();

    const listed = await db.releaseAudits.listByRelease(ctx, release.id);
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.action).toBe("release.created");

    const got = await db.releaseAudits.get(ctx, entry.id);
    expect(got?.summary).toBe("Release created");
  });

  it("isolates tenants on release aggregates", async () => {
    const db = createInMemoryTestingPersistence();
    const a = await db.releases.create(ctx, {
      key: "REL-A",
      name: "A",
      status: "draft",
    });
    await db.releases.create(otherTenant, {
      key: "REL-B",
      name: "B",
      status: "draft",
    });

    const page = await db.releases.list(ctx);
    expect(page.total).toBe(1);
    expect(page.items[0]?.key).toBe("REL-A");

    expect(await db.releases.get(otherTenant, a.id)).toBeUndefined();

    await db.releaseScopes.create(ctx, {
      releaseId: a.id,
      kind: "suite",
      refId: "suite-1",
    });
    const foreignScopes = await db.releaseScopes.list(otherTenant);
    expect(foreignScopes.total).toBe(0);
  });

  it("denies mutations without release permissions", async () => {
    const db = createInMemoryTestingPersistence();
    const denied: RepositoryContext = {
      tenantId: "tenant-a",
      actorUserId: "viewer",
      permissions: ["testing.view"],
    };

    await expect(
      db.releases.create(denied, {
        key: "REL-X",
        name: "Denied",
        status: "draft",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    await expect(
      db.releaseAudits.append(denied, {
        id: "a1",
        tenantId: denied.tenantId,
        releaseId: "rel-x",
        action: "noop",
        summary: "nope",
      }),
    ).rejects.toBeInstanceOf(PersistenceError);
  });
});
