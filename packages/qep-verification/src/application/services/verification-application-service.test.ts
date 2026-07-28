import { beforeEach, describe, expect, it } from "vitest";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import {
  createInMemorySubjectRegistry,
  createInMemoryVerificationSubjectResolver,
  registerSubjectFact,
  type InMemorySubjectRegistry,
} from "../../infrastructure/subject-resolution/in-memory-subject-resolver";
import {
  createQepVerificationPersistenceForTest,
  type QepVerificationRepositories,
} from "../../infrastructure/factories";
import {
  VerificationForbiddenError,
  VerificationInvariantViolation,
  VerificationNotFoundError,
} from "../../shared/errors";
import {
  createVerificationApplicationService,
  type CreateVerificationCommandInput,
  type VerificationApplicationService,
} from "./verification-application-service";

const TENANT = "tenant_app_svc";
const ACTOR = "user_app_svc";
const CORR = "corr_app_svc";

const FULL_CTX: QepRequestContext = {
  tenantId: TENANT,
  userId: ACTOR,
  correlationId: CORR,
};

const VIEW_ONLY_CTX: QepRequestContext = {
  ...FULL_CTX,
  permissions: ["qep.verification.view"],
};

function baseCreateInput(
  overrides: Partial<CreateVerificationCommandInput> = {},
): CreateVerificationCommandInput {
  return {
    subject: { kind: "requirement", artefactId: "req_1" },
    authority: { kind: "user", actorId: ACTOR },
    ...overrides,
  };
}

function buildService(registry: InMemorySubjectRegistry): {
  service: VerificationApplicationService;
  repos: QepVerificationRepositories;
} {
  const repos = createQepVerificationPersistenceForTest({
    allowInMemoryPersistence: true,
  });
  let counter = 0;
  const service = createVerificationApplicationService({
    verifications: repos.verifications,
    subjectResolver: createInMemoryVerificationSubjectResolver(registry),
    now: () => "2026-07-26T12:00:00.000Z",
    id: () => `vertest${++counter}`,
  });
  return { service, repos };
}

function seedRegistry(): InMemorySubjectRegistry {
  const registry = createInMemorySubjectRegistry();
  registerSubjectFact(registry, {
    exists: true,
    tenantId: TENANT,
    kind: "requirement",
    artefactId: "req_1",
  });
  return registry;
}

describe("VerificationApplicationService", () => {
  let service: VerificationApplicationService;

  beforeEach(() => {
    ({ service } = buildService(seedRegistry()));
  });

  it("creates a Verification in draft and enforces the create permission", async () => {
    await expect(
      service.createVerification(VIEW_ONLY_CTX, baseCreateInput()),
    ).rejects.toThrow(VerificationForbiddenError);

    const created = await service.createVerification(FULL_CTX, baseCreateInput());
    expect(created.status).toBe("draft");
    expect(created.subject.artefactId).toBe("req_1");
  });

  it("rejects creation when the subject resolver reports non-existence", async () => {
    await expect(
      service.createVerification(
        FULL_CTX,
        baseCreateInput({
          subject: { kind: "requirement", artefactId: "does_not_exist" },
        }),
      ),
    ).rejects.toThrow(VerificationInvariantViolation);
  });

  it("drives the full lifecycle: request -> assign -> start -> complete (verified)", async () => {
    const created = await service.createVerification(FULL_CTX, baseCreateInput());

    const requested = await service.requestVerification(FULL_CTX, created.id);
    expect(requested.status).toBe("requested");

    const assigned = await service.assignVerification(FULL_CTX, requested.id, {
      assigneeId: "user_assignee",
    });
    expect(assigned.status).toBe("assigned");
    expect(assigned.assignedTo).toBe("user_assignee");

    const started = await service.startVerification(FULL_CTX, assigned.id);
    expect(started.status).toBe("in_progress");

    const completed = await service.completeVerification(FULL_CTX, started.id, {
      outcome: "verified",
    });
    expect(completed.status).toBe("verified");
    expect(completed.outcome).toBe("verified");
    expect(completed.decision?.outcome).toBe("verified");
  });

  it("drives request -> start -> reject with a failure outcome", async () => {
    const created = await service.createVerification(FULL_CTX, baseCreateInput());
    const requested = await service.requestVerification(FULL_CTX, created.id);
    const started = await service.startVerification(FULL_CTX, requested.id);

    const rejected = await service.rejectVerification(FULL_CTX, started.id, {
      outcome: "failed",
      rationale: "Did not meet the acceptance criteria",
    });
    expect(rejected.status).toBe("rejected");
    expect(rejected.outcome).toBe("failed");
  });

  it("supersedes a verified Verification with an existing successor", async () => {
    const created = await service.createVerification(FULL_CTX, baseCreateInput());
    const requested = await service.requestVerification(FULL_CTX, created.id);
    const started = await service.startVerification(FULL_CTX, requested.id);
    const completed = await service.completeVerification(FULL_CTX, started.id, {
      outcome: "verified",
    });

    const successor = await service.createVerification(FULL_CTX, baseCreateInput());

    const superseded = await service.supersedeVerification(FULL_CTX, completed.id, {
      successorVerificationId: successor.id,
    });
    expect(superseded.status).toBe("superseded");
    expect(superseded.successorVerificationId).toBe(successor.id);

    await expect(
      service.supersedeVerification(FULL_CTX, completed.id, {
        successorVerificationId: "ver_does_not_exist",
      }),
    ).rejects.toThrow(VerificationInvariantViolation);
  });

  it("updates metadata, rationale, and priority while mutable", async () => {
    const created = await service.createVerification(FULL_CTX, baseCreateInput());

    const withMetadata = await service.updateMetadata(FULL_CTX, created.id, {
      risk: "low",
    });
    expect(withMetadata.metadata.entries.risk).toBe("low");

    const withRationale = await service.updateRationale(
      FULL_CTX,
      created.id,
      "Confirms functional coverage",
    );
    expect(withRationale.rationale).toBe("Confirms functional coverage");

    const withPriority = await service.updatePriority(FULL_CTX, created.id, "high");
    expect(withPriority.priority).toBe("high");
  });

  it("lists, filters, and paginates Verifications", async () => {
    await service.createVerification(FULL_CTX, baseCreateInput());
    await service.createVerification(
      FULL_CTX,
      baseCreateInput({ subject: { kind: "requirement", artefactId: "req_1" } }),
    );

    const result = await service.listVerifications(FULL_CTX, {
      subjectKind: "requirement",
    });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);

    const bySubject = await service.listBySubject(FULL_CTX, "requirement", "req_1");
    expect(bySubject).toHaveLength(2);
  });

  it("throws not-found for unknown Verification ids on mutation", async () => {
    await expect(
      service.requestVerification(FULL_CTX, "ver_does_not_exist"),
    ).rejects.toThrow(VerificationNotFoundError);
  });

  it("returns append-only history across the lifecycle", async () => {
    const created = await service.createVerification(FULL_CTX, baseCreateInput());
    const requested = await service.requestVerification(FULL_CTX, created.id);
    await service.assignVerification(FULL_CTX, requested.id, {
      assigneeId: "user_assignee",
    });

    const history = await service.listHistory(FULL_CTX, created.id);
    expect(history.length).toBeGreaterThanOrEqual(3);
    expect(history[0]?.kind).toBe("created");
  });
});
