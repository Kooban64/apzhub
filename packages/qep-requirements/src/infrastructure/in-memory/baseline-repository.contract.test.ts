import { describe, expect, it } from "vitest";

import { createRequirementBaseline } from "../../domain/baseline/requirement-baseline";
import { createRequirementBaselineItem } from "../../domain/baseline/requirement-baseline-item";
import type { RequirementBaselineLockIntegrityInput } from "../../domain/baseline/requirement-baseline-repository";
import {
  QepBaselineInvalidStateError,
  QepBaselineAlreadyLockedError,
  QepBaselineArchivedError,
  QepBaselineNotFoundError,
} from "../../shared/errors";
import {
  createEmptyBaselineStore,
  createInMemoryRequirementBaselineRepository,
} from "./baseline-repository";

const TENANT = "tenant_baseline_contract";
const ACTOR = "user_baseline_contract";

function draftBaseline(id: string, number: number) {
  return createRequirementBaseline({
    id,
    tenantId: TENANT,
    number,
    name: `Baseline ${number}`,
    createdAt: "2026-07-25T10:00:00.000Z",
    createdBy: ACTOR,
    correlationId: "corr_baseline_contract",
  });
}

function item(requirementId: string, contentVersionId: string) {
  return createRequirementBaselineItem({
    requirementId,
    contentVersionId,
    contentVersionNumber: 1,
    includedAt: "2026-07-25T10:01:00.000Z",
    includedBy: ACTOR,
  });
}

const INTEGRITY: RequirementBaselineLockIntegrityInput = {
  fingerprint: "fingerprint_contract",
  algorithm: "sha256",
  schemaVersion: "requirement-baseline-integrity/v1",
  verificationStatus: "verified",
  verifiedAt: "2026-07-25T10:05:00.000Z",
};

describe("RequirementBaselineRepository contract (in-memory)", () => {
  it("implements the full create -> membership -> lock -> archive lifecycle", async () => {
    const repo = createInMemoryRequirementBaselineRepository(
      createEmptyBaselineStore(),
    );

    const created = await repo.createBaseline(draftBaseline("rbl_contract_1", 1));
    expect(created.status).toBe("draft");
    expect(await repo.getBaseline(TENANT, created.id)).toEqual(created);
    expect(await repo.baselineExists(TENANT, created.id)).toBe(true);
    expect(await repo.baselineNumberExists(TENANT, created.number)).toBe(true);
    expect(await repo.nextBaselineNumber(TENANT)).toBe(2);

    const withItem = await repo.addRequirementVersion(
      TENANT,
      created.id,
      item("req_contract_1", "rcv_contract_1"),
      "2026-07-25T10:02:00.000Z",
      ACTOR,
    );
    expect(withItem.items).toHaveLength(1);
    expect(await repo.listBaselineItems(TENANT, created.id)).toHaveLength(1);

    const locked = await repo.lockBaseline(
      TENANT,
      created.id,
      INTEGRITY,
      "2026-07-25T10:05:00.000Z",
      ACTOR,
    );
    expect(locked.status).toBe("locked");
    expect(locked.integrityFingerprint).toBe(INTEGRITY.fingerprint);
    expect(locked.integrityVerificationStatus).toBe("verified");

    const reverified = await repo.recordIntegrityVerification(TENANT, created.id, {
      verificationStatus: "verified",
      verifiedAt: "2026-07-25T10:06:00.000Z",
    });
    expect(reverified.integrityVerifiedAt).toBe("2026-07-25T10:06:00.000Z");

    const archived = await repo.archiveBaseline(
      TENANT,
      created.id,
      "2026-07-25T10:10:00.000Z",
      ACTOR,
    );
    expect(archived.status).toBe("archived");

    const listed = await repo.listBaselines(TENANT);
    expect(listed).toHaveLength(1);

    const history = await repo.listBaselinesForRequirement(
      TENANT,
      item("req_contract_1", "rcv_contract_1").requirementId,
    );
    expect(history).toHaveLength(1);
  });

  it("rejects locking a baseline with no content versions", async () => {
    const repo = createInMemoryRequirementBaselineRepository(
      createEmptyBaselineStore(),
    );
    const created = await repo.createBaseline(draftBaseline("rbl_contract_2", 1));

    await expect(
      repo.lockBaseline(
        TENANT,
        created.id,
        INTEGRITY,
        "2026-07-25T10:05:00.000Z",
        ACTOR,
      ),
    ).rejects.toThrow(QepBaselineInvalidStateError);
  });

  it("rejects locking or archiving a baseline more than once", async () => {
    const repo = createInMemoryRequirementBaselineRepository(
      createEmptyBaselineStore(),
    );
    const created = await repo.createBaseline(draftBaseline("rbl_contract_3", 1));
    await repo.addRequirementVersion(
      TENANT,
      created.id,
      item("req_contract_3", "rcv_contract_3"),
      "2026-07-25T10:02:00.000Z",
      ACTOR,
    );
    await repo.lockBaseline(
      TENANT,
      created.id,
      INTEGRITY,
      "2026-07-25T10:05:00.000Z",
      ACTOR,
    );

    await expect(
      repo.lockBaseline(
        TENANT,
        created.id,
        INTEGRITY,
        "2026-07-25T10:05:00.000Z",
        ACTOR,
      ),
    ).rejects.toThrow(QepBaselineAlreadyLockedError);

    await repo.archiveBaseline(TENANT, created.id, "2026-07-25T10:10:00.000Z", ACTOR);

    await expect(
      repo.archiveBaseline(TENANT, created.id, "2026-07-25T10:10:00.000Z", ACTOR),
    ).rejects.toThrow(QepBaselineArchivedError);
  });

  it("throws not-found for an unknown or cross-tenant baseline id", async () => {
    const repo = createInMemoryRequirementBaselineRepository(
      createEmptyBaselineStore(),
    );
    await expect(
      repo.addRequirementVersion(
        TENANT,
        draftBaseline("rbl_contract_missing", 9).id,
        item("req_x", "rcv_x"),
        "2026-07-25T10:02:00.000Z",
        ACTOR,
      ),
    ).rejects.toThrow(QepBaselineNotFoundError);
  });
});
