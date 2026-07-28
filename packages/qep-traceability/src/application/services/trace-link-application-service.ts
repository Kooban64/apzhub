import { randomUUID } from "node:crypto";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import {
  approveTraceLink,
  createTraceLink,
  retireTraceLink,
  supersedeTraceLink,
  updateTraceAuthority,
  updateTraceConfidence,
  updateTraceEndpoint,
  updateTraceMetadata,
  updateTraceOrigin,
  updateTraceRationale,
  updateTraceScope,
  validateTraceLink,
  type TraceLink,
} from "../../domain/trace-link/trace-link";
import type { TraceLinkDomainEvent } from "../../domain/trace-link/trace-link-events";
import { createTraceId, type TraceId } from "../../domain/trace-link/trace-id";
import {
  createTraceEndpointReference,
  endpointIdentityKey,
  type TraceEndpointReference,
} from "../../domain/trace-link/trace-endpoint";
import type {
  EndpointExistenceFact,
  TraceEdgeFact,
} from "../../domain/trace-link/trace-policy";
import { assertEndpointExistence } from "../../domain/trace-link/trace-policy";
import {
  createTraceScope,
  traceScopeKey,
  type TraceScope,
} from "../../domain/trace-link/trace-scope";
import { createTraceType, type TraceType } from "../../domain/trace-link/trace-type";
import type { TraceHistoryEntry } from "../../domain/trace-link/trace-history";
import type {
  StoredTraceLink,
  TraceLinkRepository,
  TraceTaxonomyRepository,
} from "../../domain/trace-link/trace-link-repository";
import type { TraceTaxonomyDefinition } from "../../domain/trace-link/trace-taxonomy";
import type { TraceEndpointResolver } from "../../infrastructure/endpoint-resolution/endpoint-resolver";
import {
  TraceForbiddenError,
  TraceInvariantViolation,
  TraceNotFoundError,
} from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";

export type TraceLinkAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly traceId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly detailsJson: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

/** Simple append-only audit sink — full audit centralisation happens at the Platform Service layer. */
export type TraceLinkAuditAppender = {
  append(entry: TraceLinkAuditEntry): Promise<void | TraceLinkAuditEntry>;
};

export type TraceObservationEvent = {
  readonly operation: string;
  readonly durationMs: number;
  readonly outcome: "success" | "error";
};

export type TraceEndpointCommandInput = {
  readonly kind: string;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
};

export type CreateTraceLinkCommandInput = {
  readonly type: string;
  readonly source: TraceEndpointCommandInput;
  readonly target: TraceEndpointCommandInput;
  readonly direction?: string;
  readonly strength?: string;
  readonly confidence?: string;
  readonly origin?: string;
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly provenance: {
    readonly actorId: string;
    readonly correlationId: string;
    readonly sourceSystem?: string;
    readonly importBatchId?: string;
    readonly rationaleRef?: string;
  };
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly context?: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable?: boolean;
  };
  readonly rationale?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type UpdateTraceEndpointCommandInput = {
  readonly role: "source" | "target";
  readonly endpoint: TraceEndpointCommandInput;
};

export type SupersedeTraceLinkCommandInput = {
  readonly successorTraceId: string;
};

export type TraceLinkListCommandQuery = {
  readonly type?: string;
  readonly lifecycleState?: string;
  readonly sourceKind?: string;
  readonly sourceArtefactId?: string;
  readonly targetKind?: string;
  readonly targetArtefactId?: string;
  readonly artefactId?: string;
  readonly direction?: "inbound" | "outbound" | "both";
  readonly scopeReferenceId?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type DuplicateTraceLinkCandidateQuery = {
  readonly type: string;
  readonly source: TraceEndpointCommandInput;
  readonly target: TraceEndpointCommandInput;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
};

export type TraceLinkApplicationServiceDeps = {
  readonly traceLinks: TraceLinkRepository;
  readonly traceTaxonomy: TraceTaxonomyRepository;
  readonly endpointResolver: TraceEndpointResolver;
  readonly audits?: TraceLinkAuditAppender;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onDomainEvent?: (event: TraceLinkDomainEvent) => void | Promise<void>;
  readonly onTraceLinkUpserted?: (trace: StoredTraceLink) => void | Promise<void>;
  readonly onObservation?: (event: TraceObservationEvent) => void;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
};

export type TraceLinkApplicationService = {
  createTraceLink(
    ctx: QepRequestContext,
    input: CreateTraceLinkCommandInput,
  ): Promise<StoredTraceLink>;
  validateTraceLink(ctx: QepRequestContext, id: string): Promise<StoredTraceLink>;
  approveTraceLink(ctx: QepRequestContext, id: string): Promise<StoredTraceLink>;
  retireTraceLink(ctx: QepRequestContext, id: string): Promise<StoredTraceLink>;
  supersedeTraceLink(
    ctx: QepRequestContext,
    id: string,
    input: SupersedeTraceLinkCommandInput,
  ): Promise<StoredTraceLink>;
  updateConfidence(
    ctx: QepRequestContext,
    id: string,
    confidence: string,
  ): Promise<StoredTraceLink>;
  updateAuthority(
    ctx: QepRequestContext,
    id: string,
    authority: { readonly kind: string; readonly actorId: string },
  ): Promise<StoredTraceLink>;
  updateScope(
    ctx: QepRequestContext,
    id: string,
    scope: { readonly kind: string; readonly referenceId?: string },
  ): Promise<StoredTraceLink>;
  updateRationale(
    ctx: QepRequestContext,
    id: string,
    rationale: string,
  ): Promise<StoredTraceLink>;
  updateMetadata(
    ctx: QepRequestContext,
    id: string,
    patch: Readonly<Record<string, string>>,
  ): Promise<StoredTraceLink>;
  updateOrigin(
    ctx: QepRequestContext,
    id: string,
    origin: string,
  ): Promise<StoredTraceLink>;
  updateEndpoint(
    ctx: QepRequestContext,
    id: string,
    input: UpdateTraceEndpointCommandInput,
  ): Promise<StoredTraceLink>;

  getTraceLink(ctx: QepRequestContext, id: string): Promise<StoredTraceLink | null>;
  listTraceLinks(
    ctx: QepRequestContext,
    query?: TraceLinkListCommandQuery,
  ): Promise<{
    items: readonly StoredTraceLink[];
    total: number;
    limit: number;
    offset: number;
  }>;
  listBySource(
    ctx: QepRequestContext,
    kind: string,
    artefactId: string,
  ): Promise<readonly StoredTraceLink[]>;
  listByTarget(
    ctx: QepRequestContext,
    kind: string,
    artefactId: string,
  ): Promise<readonly StoredTraceLink[]>;
  inbound(
    ctx: QepRequestContext,
    artefactId: string,
  ): Promise<readonly StoredTraceLink[]>;
  outbound(
    ctx: QepRequestContext,
    artefactId: string,
  ): Promise<readonly StoredTraceLink[]>;
  history(ctx: QepRequestContext, id: string): Promise<readonly TraceHistoryEntry[]>;
  taxonomy(ctx: QepRequestContext): Promise<readonly TraceTaxonomyDefinition[]>;
  duplicateCandidates(
    ctx: QepRequestContext,
    query: DuplicateTraceLinkCandidateQuery,
  ): Promise<readonly TraceEdgeFact[]>;
  supersessionChain(
    ctx: QepRequestContext,
    traceId?: string,
  ): Promise<readonly StoredTraceLink[]>;
};

const VIEW = "qep.traceability.trace_links.view";
const CREATE = "qep.traceability.trace_links.create";
const MODIFY = "qep.traceability.trace_links.modify";
const VALIDATE = "qep.traceability.trace_links.validate";
const APPROVE = "qep.traceability.trace_links.approve";
const RETIRE = "qep.traceability.trace_links.retire";
const SUPERSEDE = "qep.traceability.trace_links.supersede";
const HISTORY_VIEW = "qep.traceability.trace_links.history.view";
const TAXONOMY_VIEW = "qep.traceability.taxonomy.view";
const TAXONOMY_ADMIN = "qep.traceability.taxonomy.administer";

function nowIso(deps: TraceLinkApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: TraceLinkApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextTraceId(deps: TraceLinkApplicationServiceDeps): TraceId {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  return createTraceId(generated.startsWith("trl_") ? generated : `trl_${generated}`);
}

function assertAnyPermission(
  ctx: QepRequestContext,
  requiredOneOf: readonly string[],
): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.traceability.*")) return;
  if (requiredOneOf.some((permission) => granted.includes(permission))) return;
  throw new TraceForbiddenError(`Missing permission: ${requiredOneOf[0]}`);
}

/** Local duplicate-key mirror of the infrastructure mapper — kept dependency-free from infra. */
function duplicateKeyOf(input: {
  readonly type: TraceType;
  readonly source: TraceEndpointReference;
  readonly target: TraceEndpointReference;
  readonly scope: TraceScope;
}): string {
  return [
    input.type,
    endpointIdentityKey(input.source),
    endpointIdentityKey(input.target),
    traceScopeKey(input.scope),
  ].join("|");
}

async function appendAudit(
  deps: TraceLinkApplicationServiceDeps,
  ctx: QepRequestContext,
  traceId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  if (!deps.audits) return;
  await deps.audits.append({
    id: deps.id?.() ?? randomUUID(),
    tenantId: ctx.tenantId,
    traceId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

async function observe<T>(
  deps: TraceLinkApplicationServiceDeps,
  operation: string,
  work: () => Promise<T>,
): Promise<T> {
  const started = Date.now();
  try {
    const result = await work();
    deps.onObservation?.({
      operation,
      durationMs: Date.now() - started,
      outcome: "success",
    });
    return result;
  } catch (error) {
    deps.onObservation?.({
      operation,
      durationMs: Date.now() - started,
      outcome: "error",
    });
    throw error;
  }
}

async function emitEvents(
  deps: TraceLinkApplicationServiceDeps,
  trace: TraceLink,
): Promise<void> {
  for (const event of trace.domainEvents) {
    await deps.onDomainEvent?.(event);
  }
}

async function requireTraceLink(
  deps: TraceLinkApplicationServiceDeps,
  tenantId: string,
  id: string,
): Promise<StoredTraceLink> {
  const trace = await deps.traceLinks.get(tenantId, createTraceId(id));
  if (!trace) {
    throw new TraceNotFoundError(`Trace Link not found: ${id}`);
  }
  return trace;
}

async function resolveEndpointFacts(
  deps: TraceLinkApplicationServiceDeps,
  tenantId: string,
  endpoints: readonly TraceEndpointReference[],
): Promise<EndpointExistenceFact[]> {
  const facts: EndpointExistenceFact[] = [];
  for (const endpoint of endpoints) {
    if (endpoint.kind === "external_reference") continue;
    const resolved = await deps.endpointResolver.resolve(
      tenantId,
      endpoint.kind,
      endpoint.artefactId,
      {
        contentVersionId: endpoint.contentVersionId,
        baselineId: endpoint.baselineId,
      },
    );
    facts.push({
      tenantId,
      kind: endpoint.kind,
      artefactId: endpoint.artefactId,
      exists: resolved.exists,
      owningDomain: resolved.owningDomain,
    });
  }
  return facts;
}

async function persistMutation(
  deps: TraceLinkApplicationServiceDeps,
  ctx: QepRequestContext,
  mutated: TraceLink,
  expectedRevision: number,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredTraceLink> {
  const stored = await runInTransaction(deps, async () =>
    deps.traceLinks.save(mutated, expectedRevision),
  );
  await appendAudit(deps, ctx, stored.id, auditAction, {
    ...auditDetails,
    lifecycleState: stored.lifecycleState,
    type: stored.type,
  });
  await emitEvents(deps, mutated);
  try {
    await deps.onTraceLinkUpserted?.(stored);
  } catch {
    // Search / projection failures must not roll back persisted Trace Links.
  }
  return stored;
}

export function createTraceLinkApplicationService(
  deps: TraceLinkApplicationServiceDeps,
): TraceLinkApplicationService {
  const service: TraceLinkApplicationService = {
    async createTraceLink(ctx, input) {
      return observe(deps, "trace_link.create", async () => {
        assertAnyPermission(ctx, [CREATE]);

        const created = createTraceLink({
          id: nextTraceId(deps),
          tenantId: ctx.tenantId,
          type: input.type,
          source: input.source,
          target: input.target,
          direction: input.direction,
          strength: input.strength,
          confidence: input.confidence,
          origin: input.origin,
          authority: input.authority,
          provenance: input.provenance,
          scope: input.scope,
          context: input.context,
          rationale: input.rationale,
          metadata: input.metadata,
          createdAt: nowIso(deps),
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
        });

        const endpointFacts = await resolveEndpointFacts(deps, ctx.tenantId, [
          created.source,
          created.target,
        ]);
        assertEndpointExistence(created.source, created.target, endpointFacts);

        const stored = await runInTransaction(deps, async () =>
          deps.traceLinks.create(created),
        );
        await appendAudit(deps, ctx, stored.id, "qep.trace_link.created", {
          type: stored.type,
        });
        await emitEvents(deps, created);
        try {
          await deps.onTraceLinkUpserted?.(stored);
        } catch {
          // projection isolation
        }
        return stored;
      });
    },

    async validateTraceLink(ctx, id) {
      return observe(deps, "trace_link.validate", async () => {
        assertAnyPermission(ctx, [VALIDATE]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const endpointFacts = await resolveEndpointFacts(deps, ctx.tenantId, [
          existing.source,
          existing.target,
        ]);
        const existingEdges = await deps.traceLinks.listEdgeFacts(ctx.tenantId, {
          excludeTraceId: existing.id,
        });
        const mutated = validateTraceLink(existing, nowIso(deps), ctx.userId, {
          existingEdges,
          endpointFacts,
        });
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.validated",
        );
      });
    },

    async approveTraceLink(ctx, id) {
      return observe(deps, "trace_link.approve", async () => {
        assertAnyPermission(ctx, [APPROVE]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = approveTraceLink(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.approved",
        );
      });
    },

    async retireTraceLink(ctx, id) {
      return observe(deps, "trace_link.retire", async () => {
        assertAnyPermission(ctx, [RETIRE]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = retireTraceLink(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.retired",
        );
      });
    },

    async supersedeTraceLink(ctx, id, input) {
      return observe(deps, "trace_link.supersede", async () => {
        assertAnyPermission(ctx, [SUPERSEDE]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const successorExists = await deps.traceLinks.exists(
          ctx.tenantId,
          createTraceId(input.successorTraceId),
        );
        if (!successorExists) {
          throw new TraceInvariantViolation(
            `Successor Trace Link does not exist: ${input.successorTraceId}`,
          );
        }
        const mutated = supersedeTraceLink(
          existing,
          input.successorTraceId,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.superseded",
          {
            successorTraceId: input.successorTraceId,
          },
        );
      });
    },

    async updateConfidence(ctx, id, confidence) {
      return observe(deps, "trace_link.update_confidence", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceConfidence(
          existing,
          confidence,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.confidence_changed",
          { confidence },
        );
      });
    },

    async updateAuthority(ctx, id, authority) {
      return observe(deps, "trace_link.update_authority", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceAuthority(
          existing,
          authority,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.authority_changed",
          { authority },
        );
      });
    },

    async updateScope(ctx, id, scope) {
      return observe(deps, "trace_link.update_scope", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceScope(existing, scope, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.scope_changed",
          {
            scope,
          },
        );
      });
    },

    async updateRationale(ctx, id, rationale) {
      return observe(deps, "trace_link.update_rationale", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceRationale(
          existing,
          rationale,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.rationale_changed",
        );
      });
    },

    async updateMetadata(ctx, id, patch) {
      return observe(deps, "trace_link.update_metadata", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceMetadata(existing, patch, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.metadata_changed",
        );
      });
    },

    async updateOrigin(ctx, id, origin) {
      return observe(deps, "trace_link.update_origin", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceOrigin(existing, origin, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.origin_changed",
          {
            origin,
          },
        );
      });
    },

    async updateEndpoint(ctx, id, input) {
      return observe(deps, "trace_link.update_endpoint", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireTraceLink(deps, ctx.tenantId, id);
        const mutated = updateTraceEndpoint(
          existing,
          input.role,
          input.endpoint,
          nowIso(deps),
          ctx.userId,
        );
        const changedEndpoint =
          input.role === "source" ? mutated.source : mutated.target;
        const facts = await resolveEndpointFacts(deps, ctx.tenantId, [changedEndpoint]);
        assertEndpointExistence(mutated.source, mutated.target, [
          ...facts,
          // The unchanged endpoint already exists (validated at create/validate); assume existing.
          {
            tenantId: ctx.tenantId,
            kind: input.role === "source" ? existing.target.kind : existing.source.kind,
            artefactId:
              input.role === "source"
                ? existing.target.artefactId
                : existing.source.artefactId,
            exists: true,
          },
        ]);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.trace_link.endpoint_changed",
          { role: input.role },
        );
      });
    },

    async getTraceLink(ctx, id) {
      return observe(deps, "trace_link.get", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.traceLinks.get(ctx.tenantId, createTraceId(id));
      });
    },

    async listTraceLinks(ctx, query = {}) {
      return observe(deps, "trace_link.list", async () => {
        assertAnyPermission(ctx, [VIEW]);
        const items = await deps.traceLinks.list(ctx.tenantId, {
          ...(query.type ? { type: createTraceType(query.type) } : {}),
          ...(query.lifecycleState
            ? {
                lifecycleState:
                  query.lifecycleState as StoredTraceLink["lifecycleState"],
              }
            : {}),
          sourceKind: query.sourceKind,
          sourceArtefactId: query.sourceArtefactId,
          targetKind: query.targetKind,
          targetArtefactId: query.targetArtefactId,
          artefactId: query.artefactId,
          direction: query.direction,
          scopeReferenceId: query.scopeReferenceId,
        });
        return filterAndPaginate(items, query.limit ?? 50, query.offset ?? 0);
      });
    },

    async listBySource(ctx, kind, artefactId) {
      return observe(deps, "trace_link.list_by_source", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.traceLinks.list(ctx.tenantId, {
          sourceKind: kind,
          sourceArtefactId: artefactId,
        });
      });
    },

    async listByTarget(ctx, kind, artefactId) {
      return observe(deps, "trace_link.list_by_target", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.traceLinks.list(ctx.tenantId, {
          targetKind: kind,
          targetArtefactId: artefactId,
        });
      });
    },

    async outbound(ctx, artefactId) {
      return observe(deps, "trace_link.outbound", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.traceLinks.list(ctx.tenantId, {
          artefactId,
          direction: "outbound",
        });
      });
    },

    async inbound(ctx, artefactId) {
      return observe(deps, "trace_link.inbound", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.traceLinks.list(ctx.tenantId, { artefactId, direction: "inbound" });
      });
    },

    async history(ctx, id) {
      return observe(deps, "trace_link.history", async () => {
        assertAnyPermission(ctx, [VIEW, HISTORY_VIEW]);
        return deps.traceLinks.listHistory(ctx.tenantId, createTraceId(id));
      });
    },

    async taxonomy(ctx) {
      return observe(deps, "trace_link.taxonomy", async () => {
        assertAnyPermission(ctx, [VIEW, TAXONOMY_VIEW, TAXONOMY_ADMIN]);
        return deps.traceTaxonomy.list(ctx.tenantId);
      });
    },

    async duplicateCandidates(ctx, query) {
      return observe(deps, "trace_link.duplicate_candidates", async () => {
        assertAnyPermission(ctx, [VIEW]);
        const type = createTraceType(query.type);
        const source = createTraceEndpointReference({
          ...query.source,
          tenantId: ctx.tenantId,
        });
        const target = createTraceEndpointReference({
          ...query.target,
          tenantId: ctx.tenantId,
        });
        const scope = createTraceScope(query.scope ?? { kind: "tenant_global" });
        const key = duplicateKeyOf({ type, source, target, scope });
        const edges = await deps.traceLinks.listEdgeFacts(ctx.tenantId, {});
        return edges.filter(
          (edge) =>
            (edge.lifecycleState === "draft" ||
              edge.lifecycleState === "validated" ||
              edge.lifecycleState === "approved") &&
            duplicateKeyOf(edge) === key,
        );
      });
    },

    async supersessionChain(ctx, traceId) {
      return observe(deps, "trace_link.supersession_chain", async () => {
        assertAnyPermission(ctx, [VIEW]);
        const rows = await deps.traceLinks.list(ctx.tenantId, {
          lifecycleState: "superseded",
        });
        if (!traceId) return rows;
        return rows.filter(
          (row) => row.id === traceId || row.successorTraceId === traceId,
        );
      });
    },
  };

  return service;
}
