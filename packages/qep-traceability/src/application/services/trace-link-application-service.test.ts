import { beforeEach, describe, expect, it } from "vitest";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import {
  createInMemoryEndpointRegistry,
  createInMemoryTraceEndpointResolver,
  registerEndpointFact,
  type InMemoryEndpointRegistry,
} from "../../infrastructure/endpoint-resolution/in-memory-endpoint-resolver";
import {
  createQepTraceabilityPersistenceForTest,
  type QepTraceabilityRepositories,
} from "../../infrastructure/factories";
import {
  TraceForbiddenError,
  TraceInvariantViolation,
  TraceNotFoundError,
} from "../../shared/errors";
import {
  createTraceLinkApplicationService,
  type CreateTraceLinkCommandInput,
  type TraceLinkApplicationService,
} from "./trace-link-application-service";

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
  permissions: ["qep.traceability.trace_links.view"],
};

function baseCreateInput(
  overrides: Partial<CreateTraceLinkCommandInput> = {},
): CreateTraceLinkCommandInput {
  return {
    type: "requirement_tested_by",
    source: { kind: "requirement", artefactId: "req_1" },
    target: { kind: "test_case", artefactId: "tc_1" },
    authority: { kind: "user", actorId: ACTOR },
    provenance: { actorId: ACTOR, correlationId: CORR },
    ...overrides,
  };
}

function buildService(registry: InMemoryEndpointRegistry): {
  service: TraceLinkApplicationService;
  repos: QepTraceabilityRepositories;
} {
  const repos = createQepTraceabilityPersistenceForTest({
    allowInMemoryPersistence: true,
  });
  let counter = 0;
  const service = createTraceLinkApplicationService({
    traceLinks: repos.traceLinks,
    traceTaxonomy: repos.traceTaxonomy,
    endpointResolver: createInMemoryTraceEndpointResolver(registry),
    now: () => "2026-07-26T12:00:00.000Z",
    id: () => `trltest${++counter}`,
  });
  return { service, repos };
}

function seedRegistry(): InMemoryEndpointRegistry {
  const registry = createInMemoryEndpointRegistry();
  registerEndpointFact(registry, {
    exists: true,
    tenantId: TENANT,
    kind: "requirement",
    artefactId: "req_1",
  });
  registerEndpointFact(registry, {
    exists: true,
    tenantId: TENANT,
    kind: "test_case",
    artefactId: "tc_1",
  });
  registerEndpointFact(registry, {
    exists: true,
    tenantId: TENANT,
    kind: "test_specification",
    artefactId: "tspec_1",
  });
  registerEndpointFact(registry, {
    exists: true,
    tenantId: TENANT,
    kind: "test_case",
    artefactId: "tc_2",
  });
  return registry;
}

describe("TraceLinkApplicationService", () => {
  let registry: InMemoryEndpointRegistry;
  let service: TraceLinkApplicationService;

  beforeEach(() => {
    registry = seedRegistry();
    ({ service } = buildService(registry));
  });

  it("creates a Trace Link in draft and enforces endpoint existence", async () => {
    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());
    expect(created.lifecycleState).toBe("draft");
    expect(created.id.startsWith("trl_")).toBe(true);

    await expect(
      service.createTraceLink(
        FULL_CTX,
        baseCreateInput({ target: { kind: "test_case", artefactId: "tc_missing" } }),
      ),
    ).rejects.toThrow(TraceInvariantViolation);
  });

  it("progresses a Trace Link through the full lifecycle", async () => {
    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());
    const validated = await service.validateTraceLink(FULL_CTX, created.id);
    expect(validated.lifecycleState).toBe("validated");

    const approved = await service.approveTraceLink(FULL_CTX, created.id);
    expect(approved.lifecycleState).toBe("approved");

    const successor = await service.createTraceLink(
      FULL_CTX,
      baseCreateInput({
        target: { kind: "test_specification", artefactId: "tspec_1" },
        type: "requirement_specified_by",
      }),
    );
    const superseded = await service.supersedeTraceLink(FULL_CTX, approved.id, {
      successorTraceId: successor.id,
    });
    expect(superseded.lifecycleState).toBe("superseded");
    expect(superseded.successorTraceId).toBe(successor.id);
  });

  it("retires an approved Trace Link", async () => {
    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());
    await service.validateTraceLink(FULL_CTX, created.id);
    const approved = await service.approveTraceLink(FULL_CTX, created.id);
    const retired = await service.retireTraceLink(FULL_CTX, approved.id);
    expect(retired.lifecycleState).toBe("retired");
  });

  it("updates confidence, authority, scope, rationale, metadata, origin, endpoint", async () => {
    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());

    const withConfidence = await service.updateConfidence(
      FULL_CTX,
      created.id,
      "provisional",
    );
    expect(withConfidence.confidence).toBe("provisional");

    const withAuthority = await service.updateAuthority(FULL_CTX, created.id, {
      kind: "user",
      actorId: "user_other",
    });
    expect(withAuthority.authority.actorId).toBe("user_other");

    const withScope = await service.updateScope(FULL_CTX, created.id, {
      kind: "tenant_global",
    });
    expect(withScope.scope.kind).toBe("tenant_global");

    const withRationale = await service.updateRationale(
      FULL_CTX,
      created.id,
      "Because the workflow requires it",
    );
    expect(withRationale.rationale).toBe("Because the workflow requires it");

    const withMetadata = await service.updateMetadata(FULL_CTX, created.id, {
      source: "manual",
    });
    expect(withMetadata.metadata.entries.source).toBe("manual");

    const withOrigin = await service.updateOrigin(FULL_CTX, created.id, "system_rule");
    expect(withOrigin.origin).toBe("system_rule");

    const withEndpoint = await service.updateEndpoint(FULL_CTX, created.id, {
      role: "target",
      endpoint: { kind: "test_case", artefactId: "tc_2" },
    });
    expect(withEndpoint.target.artefactId).toBe("tc_2");
  });

  it("enforces permission checks", async () => {
    await expect(
      service.createTraceLink(VIEW_ONLY_CTX, baseCreateInput()),
    ).rejects.toThrow(TraceForbiddenError);

    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());
    await expect(service.retireTraceLink(VIEW_ONLY_CTX, created.id)).rejects.toThrow(
      TraceForbiddenError,
    );
    await expect(
      service.getTraceLink(VIEW_ONLY_CTX, created.id),
    ).resolves.not.toBeNull();
  });

  it("throws not found for unknown Trace Link ids", async () => {
    await expect(service.validateTraceLink(FULL_CTX, "trl_missing")).rejects.toThrow(
      TraceNotFoundError,
    );
  });

  it("lists, queries by source/target, inbound/outbound, and history", async () => {
    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());

    const listed = await service.listTraceLinks(FULL_CTX, {
      sourceArtefactId: "req_1",
    });
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.id).toBe(created.id);

    const bySource = await service.listBySource(FULL_CTX, "requirement", "req_1");
    expect(bySource).toHaveLength(1);

    const byTarget = await service.listByTarget(FULL_CTX, "test_case", "tc_1");
    expect(byTarget).toHaveLength(1);

    const outbound = await service.outbound(FULL_CTX, "req_1");
    expect(outbound).toHaveLength(1);

    const inbound = await service.inbound(FULL_CTX, "tc_1");
    expect(inbound).toHaveLength(1);

    const history = await service.history(FULL_CTX, created.id);
    expect(history.length).toBeGreaterThan(0);
  });

  it("exposes taxonomy and duplicate candidates", async () => {
    const taxonomy = await service.taxonomy(FULL_CTX);
    expect(taxonomy.some((entry) => entry.type === "requirement_tested_by")).toBe(true);

    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());
    const duplicates = await service.duplicateCandidates(FULL_CTX, {
      type: "requirement_tested_by",
      source: { kind: "requirement", artefactId: "req_1" },
      target: { kind: "test_case", artefactId: "tc_1" },
    });
    expect(duplicates.some((edge) => edge.traceId === created.id)).toBe(true);
  });

  it("returns the supersession chain", async () => {
    const created = await service.createTraceLink(FULL_CTX, baseCreateInput());
    await service.validateTraceLink(FULL_CTX, created.id);
    const approved = await service.approveTraceLink(FULL_CTX, created.id);

    const successor = await service.createTraceLink(
      FULL_CTX,
      baseCreateInput({
        target: { kind: "test_specification", artefactId: "tspec_1" },
        type: "requirement_specified_by",
      }),
    );
    const superseded = await service.supersedeTraceLink(FULL_CTX, approved.id, {
      successorTraceId: successor.id,
    });

    const chain = await service.supersessionChain(FULL_CTX, superseded.id);
    expect(chain).toHaveLength(1);
    expect(chain[0]?.id).toBe(superseded.id);

    const all = await service.supersessionChain(FULL_CTX);
    expect(all).toHaveLength(1);
  });
});
