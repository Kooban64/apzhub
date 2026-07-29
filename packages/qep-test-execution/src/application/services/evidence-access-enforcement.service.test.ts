/**
 * APZQEP-REM-001 — associateEvidence enforcement + audit (L-02).
 */
import { describe, expect, it } from "vitest";

import { ExecutionForbiddenError } from "../../shared/errors";
import type { ExecutionRequestContext } from "../context";
import type { EvidenceAccessPort } from "../ports";
import { createTestExecutionApplicationServices } from "./create-application-services";
import {
  createAllowEvidencePort,
  createDenyEvidencePort,
  createFixedClockPort,
  createInMemoryAuditPort,
  createInMemoryHistoryStore,
  createInMemoryOutboxPort,
  createInMemoryTestExecutionRepository,
  createNoopSearchPort,
  createPermissionPort,
  createSequenceIdPort,
  createStaticSourceResolutionPort,
} from "../testing/in-memory-ports";

/** Mirrors production unconfigured port — deny, never allow. */
function createUnconfiguredDenyEvidencePort(): EvidenceAccessPort {
  return {
    portId: "EvidenceAccessPort",
    async evaluateAccess() {
      return { outcome: "denied", reason: "evidence_access_check_not_configured" };
    },
    async assertAccessible() {
      throw new ExecutionForbiddenError(
        "Evidence is not accessible to the current user",
        {
          reason: "evidence_access_check_not_configured",
        },
      );
    },
  };
}

function createFailingEvidencePort(): EvidenceAccessPort {
  return {
    portId: "EvidenceAccessPort",
    async evaluateAccess() {
      return { outcome: "unavailable", reason: "evidence_access_check_error:timeout" };
    },
    async assertAccessible() {
      throw new ExecutionForbiddenError(
        "Evidence is not accessible to the current user",
        {
          reason: "evidence_access_check_error:timeout",
          outcome: "unavailable",
        },
      );
    },
  };
}

const TENANT = "tenant_1";
const EXECUTOR = "user_executor";
const REVIEWER = "user_reviewer";

function fullCtx(userId = EXECUTOR): ExecutionRequestContext {
  return {
    tenantId: TENANT,
    userId,
    correlationId: "corr_evd_1",
  };
}

function createHarness(evidenceAccess: EvidenceAccessPort) {
  const executions = createInMemoryTestExecutionRepository();
  const history = createInMemoryHistoryStore();
  const audit = createInMemoryAuditPort();
  const outbox = createInMemoryOutboxPort();
  const services = createTestExecutionApplicationServices({
    executions,
    history,
    sources: createStaticSourceResolutionPort(),
    permissions: createPermissionPort(),
    audit,
    outbox,
    search: createNoopSearchPort(),
    evidenceAccess,
    clock: createFixedClockPort(),
    ids: createSequenceIdPort(),
    allocateNumber: () => "TE-EVD-001",
  });
  return { services, executions, audit, outbox };
}

async function reachInProgress(evidenceAccess: EvidenceAccessPort) {
  const harness = createHarness(evidenceAccess);
  const { commands } = harness.services;
  let dto = await commands.createExecution(fullCtx(), {
    projectId: "proj_1",
    workspaceId: "ws_1",
    sourceRefs: {
      planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
    },
  });
  dto = await commands.prepareExecution(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
  });
  dto = await commands.assignExecutor(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
    executorId: EXECUTOR,
    reviewerId: REVIEWER,
  });
  dto = await commands.startExecution(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
  });
  return { ...harness, dto };
}

describe("APZQEP-REM-001 associateEvidence enforcement", () => {
  it("authorised owner/executor associate works when evidence access explicitly allowed", async () => {
    const { services, dto } = await reachInProgress(createAllowEvidencePort());
    const next = await services.commands.associateEvidence(fullCtx(), dto.id, {
      expectedRevision: dto.revision,
      uri: "https://evidence.example/ok.log",
      integrityHash: "sha256:abc",
    });
    expect(next.evidenceReferences).toHaveLength(1);
    expect(next.evidenceReferences[0]?.uri).toBe("https://evidence.example/ok.log");
  });

  it("explicit deny blocks associate and records evidence_access_denied audit", async () => {
    const { services, audit, dto } = await reachInProgress(createDenyEvidencePort());
    await expect(
      services.commands.associateEvidence(fullCtx(), dto.id, {
        expectedRevision: dto.revision,
        uri: "https://evidence.example/secret.log",
      }),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);

    expect(audit.entries.some((e) => e.action === "evidence_access_denied")).toBe(true);
    const reloaded = await services.queries.getExecution(fullCtx(), dto.id);
    expect(reloaded).not.toBeNull();
    expect(reloaded!.evidenceReferences).toHaveLength(0);
  });

  it("unconfigured evidence check (default-deny port) blocks associate", async () => {
    const { services, dto } = await reachInProgress(
      createUnconfiguredDenyEvidencePort(),
    );
    await expect(
      services.commands.associateEvidence(fullCtx(), dto.id, {
        expectedRevision: dto.revision,
        uri: "https://evidence.example/ok.log",
      }),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);
  });

  it("adapter failure blocks associate", async () => {
    const { services, dto } = await reachInProgress(createFailingEvidencePort());
    await expect(
      services.commands.associateEvidence(fullCtx(), dto.id, {
        expectedRevision: dto.revision,
        uri: "https://evidence.example/ok.log",
      }),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);
  });

  it("cross-tenant get does not expose another tenant execution evidence", async () => {
    const { services, dto } = await reachInProgress(createAllowEvidencePort());
    const associated = await services.commands.associateEvidence(fullCtx(), dto.id, {
      expectedRevision: dto.revision,
      uri: "https://evidence.example/tenant-a.log",
    });
    expect(associated.evidenceReferences).toHaveLength(1);
    const otherTenant: ExecutionRequestContext = {
      tenantId: "tenant_other",
      userId: EXECUTOR,
      correlationId: "corr_x",
    };
    // Secure not-found pattern — no evidence disclosure across tenants.
    await expect(
      services.queries.getExecution(otherTenant, dto.id),
    ).resolves.toBeNull();
  });

  it("insufficient role (no execute permission) is blocked before evidence access", async () => {
    const { services, dto } = await reachInProgress(createAllowEvidencePort());
    const reader: ExecutionRequestContext = {
      tenantId: TENANT,
      userId: "user_reader",
      correlationId: "corr_r",
      permissions: ["qep.execution.read"],
    };
    await expect(
      services.commands.associateEvidence(reader, dto.id, {
        expectedRevision: dto.revision,
        uri: "https://evidence.example/ok.log",
      }),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);
  });
});
