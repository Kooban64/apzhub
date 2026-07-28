import { describe, expect, it } from "vitest";

import { createRequirementApplicationService } from "./create-requirement-application-service";
import { createRequirementBaselineApplicationService } from "./requirement-baseline-application-service";
import { createRequirementId } from "../../domain/value-objects/requirement-id";
import {
  createEmptyQepRequirementsInMemoryStores,
  createQepRequirementsPersistenceForTest,
} from "../../infrastructure";
import {
  QepBaselineAlreadyLockedError,
  QepBaselineIntegrityError,
  QepBaselineInvalidStateError,
  QepForbiddenError,
  QepInvariantViolation,
} from "../../shared/errors";

const TENANT = "tenant_alpha";
const USER = "user_1";
const PROJECT = "project_1";

function ctx(permissions?: string[]) {
  return {
    tenantId: TENANT,
    userId: USER,
    correlationId: "corr_baseline_1",
    permissions,
  };
}

const ALL = ["qep.requirements.*"];

async function seedRequirementWithVersion(
  persistence: ReturnType<typeof createQepRequirementsPersistenceForTest>,
  key: string,
) {
  const requirements = createRequirementApplicationService({
    requirements: persistence.requirements,
    audits: persistence.audits,
    lifecycleHistory: persistence.lifecycleHistory,
    contentVersions: persistence.contentVersions,
    id: () => `req_${key.toLowerCase()}`,
    now: () => "2026-07-25T10:00:00.000Z",
  });
  const requirement = await requirements.createRequirement(ctx(ALL), {
    projectId: PROJECT,
    key,
    title: `Requirement ${key}`,
    type: "functional",
    priority: "medium",
  });
  const version = await persistence.contentVersions.getLatest(
    TENANT,
    createRequirementId(requirement.id),
  );
  if (!version) {
    throw new Error("expected a content version to exist after requirement creation");
  }
  return { requirement, version };
}

describe("RequirementBaselineApplicationService", () => {
  it("runs create -> add -> lock -> archive -> compare with in-memory persistence", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const { version } = await seedRequirementWithVersion(persistence, "REQ-BASE");

    let idCounter = 0;
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => `rbl_${++idCounter}`,
      now: () => "2026-07-25T11:00:00.000Z",
    });

    const created = await service.createBaseline(ctx(ALL), {
      name: "Release candidate 1",
      description: "First cut",
    });
    expect(created.status).toBe("draft");
    expect(created.number).toBeGreaterThan(0);

    const withItem = await service.addRequirementVersion(ctx(ALL), created.id, {
      contentVersionId: version.id,
    });
    expect(withItem.items).toHaveLength(1);
    expect(withItem.items[0]?.contentVersionId).toBe(version.id);

    const locked = await service.lockBaseline(ctx(ALL), created.id);
    expect(locked.status).toBe("locked");
    expect(locked.integrityFingerprint).toBeTruthy();
    expect(locked.integrityAlgorithm).toBe("sha256");
    expect(locked.integritySchemaVersion).toBe("requirement-baseline-integrity/v1");
    expect(locked.integrityVerificationStatus).toBe("verified");

    const verified = await service.verifyBaselineIntegrity(ctx(ALL), created.id);
    expect(verified.integrityVerificationStatus).toBe("verified");
    expect(verified.integrityFingerprint).toBe(locked.integrityFingerprint);

    await expect(
      service.addRequirementVersion(ctx(ALL), created.id, {
        contentVersionId: version.id,
      }),
    ).rejects.toBeInstanceOf(QepBaselineAlreadyLockedError);

    const archived = await service.archiveBaseline(ctx(ALL), created.id);
    expect(archived.status).toBe("archived");

    await expect(service.lockBaseline(ctx(ALL), created.id)).rejects.toBeInstanceOf(
      QepInvariantViolation,
    );

    const secondBaseline = await service.createBaseline(ctx(ALL), {
      name: "Release candidate 2",
    });
    const comparison = await service.compareBaselines(ctx(ALL), {
      baseBaselineId: archived.id,
      targetBaselineId: secondBaseline.id,
    });
    expect(comparison.summary.removedCount).toBe(1);
    expect(comparison.summary.addedCount).toBe(0);

    const history = await service.requirementBaselineHistory(ctx(ALL), version.requirementId);
    expect(history.map((baseline) => baseline.id)).toContain(archived.id);

    const listed = await service.listBaselines(ctx(ALL));
    expect(listed.items.length).toBeGreaterThanOrEqual(2);
  });

  it("denies baseline commands without the required permission", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_denied",
      now: () => "2026-07-25T11:00:00.000Z",
    });

    await expect(
      service.createBaseline(ctx(["qep.requirements.baselines.view"]), {
        name: "Unauthorized",
      }),
    ).rejects.toBeInstanceOf(QepForbiddenError);
  });

  it("publishes baseline upserts and domain events", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const upserted: string[] = [];
    const events: string[] = [];
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_events",
      now: () => "2026-07-25T11:00:00.000Z",
      onBaselineUpserted: (baseline) => {
        upserted.push(baseline.id);
      },
      onDomainEvent: (event) => {
        events.push(event.type);
      },
    });

    const created = await service.createBaseline(ctx(ALL), { name: "Observed baseline" });
    expect(upserted).toContain(created.id);
    expect(events).toContain("qep.requirement_baseline.created");
  });

  it("rejects locking a baseline with no content versions", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_empty",
      now: () => "2026-07-25T11:00:00.000Z",
    });

    const created = await service.createBaseline(ctx(ALL), { name: "Empty baseline" });
    await expect(service.lockBaseline(ctx(ALL), created.id)).rejects.toBeInstanceOf(
      QepBaselineInvalidStateError,
    );
    const reloaded = await service.getBaseline(ctx(ALL), created.id);
    expect(reloaded?.status).toBe("draft");
  });

  it("denies integrity verification without the required permission", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const { version } = await seedRequirementWithVersion(persistence, "REQ-VERIFY-DENY");
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_verify_deny",
      now: () => "2026-07-25T11:00:00.000Z",
    });
    const created = await service.createBaseline(ctx(ALL), { name: "Verify deny" });
    await service.addRequirementVersion(ctx(ALL), created.id, { contentVersionId: version.id });
    await service.lockBaseline(ctx(ALL), created.id);

    await expect(
      service.verifyBaselineIntegrity(ctx(["qep.requirements.baselines.view"]), created.id),
    ).rejects.toBeInstanceOf(QepForbiddenError);
  });

  it("rejects integrity verification of a draft baseline", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_verify_draft",
      now: () => "2026-07-25T11:00:00.000Z",
    });
    const created = await service.createBaseline(ctx(ALL), { name: "Verify draft" });

    await expect(
      service.verifyBaselineIntegrity(ctx(ALL), created.id),
    ).rejects.toBeInstanceOf(QepBaselineInvalidStateError);
  });

  it("detects a tampered integrity fingerprint on re-verification and does not corrupt the record", async () => {
    const stores = createEmptyQepRequirementsInMemoryStores();
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
      stores,
    });
    const { version } = await seedRequirementWithVersion(persistence, "REQ-TAMPER");
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_tamper",
      now: () => "2026-07-25T11:00:00.000Z",
    });
    const created = await service.createBaseline(ctx(ALL), { name: "Tamper target" });
    await service.addRequirementVersion(ctx(ALL), created.id, { contentVersionId: version.id });
    const locked = await service.lockBaseline(ctx(ALL), created.id);

    // Simulate storage-level tampering of the recorded fingerprint.
    const stored = stores.baselines.get(locked.id);
    if (!stored) throw new Error("expected baseline to be stored");
    stores.baselines.set(locked.id, { ...stored, integrityFingerprint: "0".repeat(64) });

    await expect(
      service.verifyBaselineIntegrity(ctx(ALL), created.id),
    ).rejects.toBeInstanceOf(QepBaselineIntegrityError);

    const after = await service.getBaseline(ctx(ALL), created.id);
    expect(after?.integrityVerificationStatus).toBe("verification_failed");
    // The corrupted fingerprint itself is never silently rewritten by a failed verification.
    expect(after?.integrityFingerprint).toBe("0".repeat(64));
  });

  it("does not corrupt baseline state when a search/observation hook throws", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementBaselineApplicationService({
      baselines: persistence.baselines,
      contentVersions: persistence.contentVersions,
      audits: persistence.audits,
      id: () => "rbl_obs_fail",
      now: () => "2026-07-25T11:00:00.000Z",
      onBaselineUpserted: () => {
        throw new Error("downstream indexing failed");
      },
    });

    await expect(
      service.createBaseline(ctx(ALL), { name: "Observation failure" }),
    ).rejects.toThrow("downstream indexing failed");

    // The baseline command itself completed and persisted before the hook failed.
    const listed = await service.listBaselines(ctx(ALL));
    expect(listed.items.some((item) => item.name === "Observation failure")).toBe(true);
  });
});
