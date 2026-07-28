import { describe, expect, it } from "vitest";

import {
  createVerification,
  updateRationale,
} from "../../domain/verification/verification";
import {
  VerificationNotFoundError,
  VerificationRevisionConflictError,
} from "../../shared/errors";
import {
  createEmptyVerificationStore,
  createInMemoryVerificationRepository,
} from "./verification-repository";

const TENANT = "tenant_verification_contract";
const ACTOR = "user_verification_contract";
const CORR = "corr_verification_contract";
const NOW = "2026-07-26T10:00:00.000Z";

function draftVerification(id: string, artefactId = "req_1") {
  return createVerification({
    id,
    tenantId: TENANT,
    subject: { kind: "requirement", artefactId },
    authority: { kind: "user", actorId: ACTOR },
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: CORR,
  });
}

describe("VerificationRepository contract (in-memory)", () => {
  it("implements create -> get -> save with optimistic revision", async () => {
    const store = createEmptyVerificationStore();
    const repo = createInMemoryVerificationRepository(store);

    const created = await repo.create(draftVerification("ver_contract_1", "req_a1"));
    expect(created.status).toBe("draft");
    expect(created.revision).toBe(1);
    expect(await repo.get(TENANT, created.id)).toEqual(created);
    expect(await repo.exists(TENANT, created.id)).toBe(true);

    const listed = await repo.list(TENANT, {
      subjectKind: "requirement",
      subjectArtefactId: "req_a1",
    });
    expect(listed).toHaveLength(1);

    const mutated = updateRationale(
      created,
      "Updated contract rationale",
      "2026-07-26T10:05:00.000Z",
      ACTOR,
    );
    const saved = await repo.save(mutated, created.revision);
    expect(saved.revision).toBe(2);
    expect(saved.rationale).toBe("Updated contract rationale");
    expect((await repo.listHistory(TENANT, created.id)).length).toBeGreaterThan(1);
  });

  it("throws revision conflict and not-found for invalid saves", async () => {
    const store = createEmptyVerificationStore();
    const repo = createInMemoryVerificationRepository(store);
    const created = await repo.create(
      draftVerification("ver_contract_rev", "req_rev_1"),
    );

    const mutated = updateRationale(
      created,
      "Updated rationale",
      "2026-07-26T10:06:00.000Z",
      ACTOR,
    );

    await expect(repo.save(mutated, 99)).rejects.toThrow(
      VerificationRevisionConflictError,
    );
    await expect(
      repo.save({ ...mutated, id: "ver_missing" as typeof created.id }, 1),
    ).rejects.toThrow(VerificationNotFoundError);
  });

  it("lists verifications filtered by status, outcome, subject, and authority", async () => {
    const store = createEmptyVerificationStore();
    const repo = createInMemoryVerificationRepository(store);
    await repo.create(draftVerification("ver_list_a", "req_list_1"));
    await repo.create(draftVerification("ver_list_b", "req_list_2"));

    const byStatus = await repo.list(TENANT, { status: "draft" });
    expect(byStatus).toHaveLength(2);

    const bySubject = await repo.list(TENANT, {
      subjectKind: "requirement",
      subjectArtefactId: "req_list_1",
    });
    expect(bySubject).toHaveLength(1);

    const byAuthority = await repo.list(TENANT, { authorityActorId: ACTOR });
    expect(byAuthority).toHaveLength(2);
  });
});
