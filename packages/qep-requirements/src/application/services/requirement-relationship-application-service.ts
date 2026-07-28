import { randomUUID } from "node:crypto";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import type { RequirementBaselineRepository } from "../../domain/baseline/requirement-baseline-repository";
import type { RequirementContentVersionRepository } from "../../domain/repositories/requirement-content-version-repository";
import type { RequirementAuditRepository } from "../../domain/repositories/requirement-audit-repository";
import type { RequirementRepository } from "../../domain/repositories/requirement-repository";
import {
  activateRequirementsRelationship,
  changeRelationshipClassification,
  changeRelationshipCriticality,
  changeRelationshipRationale,
  changeRelationshipScope,
  changeRelationshipSemanticProfile,
  changeRelationshipStrength,
  createRequirementsRelationship,
  createRelationshipId,
  createRelationshipType,
  deprecateRequirementsRelationship,
  retireRequirementsRelationship,
  toRelationshipEdgeFact,
  type Relationship,
  type RelationshipListQuery,
  type RelationshipTaxonomyDefinition,
  type RelationshipTaxonomyRepository,
  type RequirementsRelationshipDomainEvent,
  type RequirementsRelationshipRepository,
  type StoredRequirementsRelationship,
} from "../../domain/relationship";
import { createRequirementContentVersionId } from "../../domain/content-version/requirement-content-version-id";
import { createRequirementBaselineId } from "../../domain/baseline/requirement-baseline-id";
import { createRequirementId, type RequirementId } from "../../domain/value-objects/requirement-id";
import {
  QepForbiddenError,
  QepInvariantViolation,
  QepRelationshipNotFoundError,
} from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";

export type RelationshipObservationEvent = {
  readonly operation: string;
  readonly durationMs: number;
  readonly outcome: "success" | "error";
};

export type CreateRelationshipCommandInput = {
  readonly type: string;
  readonly source: {
    readonly mode: string;
    readonly requirementId: string;
    readonly contentVersionId?: string;
  };
  readonly target: {
    readonly mode: string;
    readonly requirementId: string;
    readonly contentVersionId?: string;
  };
  readonly strength?: string;
  readonly criticality?: string;
  readonly classification?: string;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly rationale?: string;
  readonly expectedRevision?: number;
};

export type SupersedeRelationshipCommandInput = {
  readonly successorRequirementId: string;
  readonly predecessorRequirementId: string;
  readonly successorContentVersionId?: string;
  readonly predecessorContentVersionId?: string;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly rationale: string;
  readonly strength?: string;
  readonly criticality?: string;
  readonly classification?: string;
};

export type RequirementRelationshipApplicationServiceDeps = {
  readonly relationships: RequirementsRelationshipRepository;
  readonly relationshipTaxonomy: RelationshipTaxonomyRepository;
  readonly requirements: RequirementRepository;
  readonly contentVersions: RequirementContentVersionRepository;
  readonly baselines: RequirementBaselineRepository;
  readonly audits: RequirementAuditRepository;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onDomainEvent?: (
    event: RequirementsRelationshipDomainEvent,
  ) => void | Promise<void>;
  readonly onRelationshipUpserted?: (
    relationship: StoredRequirementsRelationship,
  ) => void | Promise<void>;
  readonly onObservation?: (event: RelationshipObservationEvent) => void;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
};

export type RequirementRelationshipApplicationService = {
  createRelationship(
    ctx: QepRequestContext,
    input: CreateRelationshipCommandInput,
  ): Promise<StoredRequirementsRelationship>;
  activateRelationship(
    ctx: QepRequestContext,
    id: string,
  ): Promise<StoredRequirementsRelationship>;
  deprecateRelationship(
    ctx: QepRequestContext,
    id: string,
  ): Promise<StoredRequirementsRelationship>;
  retireRelationship(
    ctx: QepRequestContext,
    id: string,
  ): Promise<StoredRequirementsRelationship>;
  supersedeRelationship(
    ctx: QepRequestContext,
    input: SupersedeRelationshipCommandInput,
  ): Promise<StoredRequirementsRelationship>;
  updateRationale(
    ctx: QepRequestContext,
    id: string,
    rationale: string,
  ): Promise<StoredRequirementsRelationship>;
  updateSemanticProfile(
    ctx: QepRequestContext,
    id: string,
    input: {
      readonly strength?: string;
      readonly criticality?: string;
      readonly classification?: string;
      readonly scope?: { readonly kind: string; readonly referenceId?: string };
      readonly rationale?: string;
    },
  ): Promise<StoredRequirementsRelationship>;
  updateStrength(
    ctx: QepRequestContext,
    id: string,
    strength: string,
  ): Promise<StoredRequirementsRelationship>;
  updateClassification(
    ctx: QepRequestContext,
    id: string,
    classification: string,
  ): Promise<StoredRequirementsRelationship>;
  updateCriticality(
    ctx: QepRequestContext,
    id: string,
    criticality: string,
  ): Promise<StoredRequirementsRelationship>;
  updateScope(
    ctx: QepRequestContext,
    id: string,
    scope: { readonly kind: string; readonly referenceId?: string },
  ): Promise<StoredRequirementsRelationship>;
  getRelationship(
    ctx: QepRequestContext,
    id: string,
  ): Promise<StoredRequirementsRelationship | null>;
  listRelationships(
    ctx: QepRequestContext,
    query?: RelationshipListQuery,
  ): Promise<{
    items: readonly StoredRequirementsRelationship[];
    total: number;
    limit: number;
    offset: number;
  }>;
  listByRequirement(
    ctx: QepRequestContext,
    requirementId: string,
    direction?: "inbound" | "outbound" | "both",
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listInbound(
    ctx: QepRequestContext,
    requirementId: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listOutbound(
    ctx: QepRequestContext,
    requirementId: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listByTaxonomy(
    ctx: QepRequestContext,
    type: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listByLifecycle(
    ctx: QepRequestContext,
    lifecycleState: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listByBaseline(
    ctx: QepRequestContext,
    baselineId: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listByContentVersion(
    ctx: QepRequestContext,
    contentVersionId: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listConflicts(
    ctx: QepRequestContext,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listSupersessionChains(
    ctx: QepRequestContext,
    requirementId?: string,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listTaxonomy(
    ctx: QepRequestContext,
  ): Promise<readonly RelationshipTaxonomyDefinition[]>;
};

function nowIso(deps: RequirementRelationshipApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: RequirementRelationshipApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextRelationshipId(deps: RequirementRelationshipApplicationServiceDeps): string {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  return generated.startsWith("rrl_")
    ? createRelationshipId(generated)
    : createRelationshipId(`rrl_${generated}`);
}

function nextAuditId(deps: RequirementRelationshipApplicationServiceDeps): string {
  return deps.id?.() ?? randomUUID();
}

function assertAnyPermission(ctx: QepRequestContext, requiredOneOf: readonly string[]): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.requirements.*")) return;
  if (requiredOneOf.some((permission) => granted.includes(permission))) return;
  throw new QepForbiddenError(`Missing permission: ${requiredOneOf[0]}`);
}

async function appendRelationshipAudit(
  deps: RequirementRelationshipApplicationServiceDeps,
  ctx: QepRequestContext,
  subjectId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  await deps.audits.append({
    id: nextAuditId(deps),
    tenantId: ctx.tenantId,
    requirementId: subjectId as unknown as RequirementId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

async function observe<T>(
  deps: RequirementRelationshipApplicationServiceDeps,
  operation: string,
  work: () => Promise<T>,
): Promise<T> {
  const started = Date.now();
  try {
    const result = await work();
    deps.onObservation?.({ operation, durationMs: Date.now() - started, outcome: "success" });
    return result;
  } catch (error) {
    deps.onObservation?.({ operation, durationMs: Date.now() - started, outcome: "error" });
    throw error;
  }
}

async function emitEvents(
  deps: RequirementRelationshipApplicationServiceDeps,
  relationship: Relationship,
): Promise<void> {
  for (const event of relationship.domainEvents) {
    await deps.onDomainEvent?.(event);
  }
}

async function requireRelationship(
  deps: RequirementRelationshipApplicationServiceDeps,
  tenantId: string,
  id: string,
): Promise<StoredRequirementsRelationship> {
  const relationship = await deps.relationships.get(tenantId, createRelationshipId(id));
  if (!relationship) {
    throw new QepRelationshipNotFoundError(`Relationship not found: ${id}`);
  }
  return relationship;
}

async function buildActivationContext(
  deps: RequirementRelationshipApplicationServiceDeps,
  tenantId: string,
  relationship: Relationship,
) {
  const source = relationship.direction.source;
  const target = relationship.direction.target;
  const endpointFacts = [];
  for (const endpoint of [source, target]) {
    const requirement = await deps.requirements.findById(tenantId, endpoint.requirementId);
    endpointFacts.push({
      tenantId,
      requirementId: endpoint.requirementId,
      exists: Boolean(requirement),
    });
  }

  const pinFacts = [];
  for (const endpoint of [source, target]) {
    if (endpoint.mode !== "content_version_pinned" || !endpoint.contentVersionId) continue;
    const version = await deps.contentVersions.getById(
      tenantId,
      createRequirementContentVersionId(endpoint.contentVersionId),
    );
    pinFacts.push({
      tenantId,
      requirementId: endpoint.requirementId,
      contentVersionId: endpoint.contentVersionId,
      valid: Boolean(
        version &&
          version.requirementId === endpoint.requirementId &&
          version.tenantId === tenantId,
      ),
    });
  }

  const scopeFacts = [];
  if (relationship.scope.kind !== "product") {
    let exists = false;
    if (relationship.scope.kind === "baseline" && relationship.scope.referenceId) {
      exists = await deps.baselines.baselineExists(
        tenantId,
        createRequirementBaselineId(relationship.scope.referenceId),
      );
    } else {
      // project/release existence is validated by reference shape for Part 2;
      // full project registry integration is out of scope for this programme.
      exists = Boolean(relationship.scope.referenceId?.trim());
    }
    scopeFacts.push({
      tenantId,
      scope: relationship.scope,
      exists,
    });
  }

  const existingEdges = await deps.relationships.listEdgeFacts(tenantId, {
    excludeRelationshipId: relationship.id,
  });

  return { existingEdges, endpointFacts, pinFacts, scopeFacts };
}

async function persistMutation(
  deps: RequirementRelationshipApplicationServiceDeps,
  ctx: QepRequestContext,
  mutated: Relationship,
  expectedRevision: number,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredRequirementsRelationship> {
  const stored = await runInTransaction(deps, async () =>
    deps.relationships.save(mutated, expectedRevision),
  );
  await appendRelationshipAudit(deps, ctx, stored.id, auditAction, {
    ...auditDetails,
    lifecycleState: stored.lifecycleState,
    type: stored.type,
  });
  await emitEvents(deps, mutated);
  try {
    await deps.onRelationshipUpserted?.(stored);
  } catch {
    // Search projection failures must not roll back persisted relationships.
  }
  return stored;
}

export function createRequirementRelationshipApplicationService(
  deps: RequirementRelationshipApplicationServiceDeps,
): RequirementRelationshipApplicationService {
  return {
    async createRelationship(ctx, input) {
      return observe(deps, "relationship.create", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.create"]);
        await deps.relationshipTaxonomy.ensureSeeded(ctx.tenantId);
        const taxonomy = await deps.relationshipTaxonomy.get(
          ctx.tenantId,
          createRelationshipType(input.type),
        );
        if (!taxonomy) {
          throw new QepInvariantViolation("Relationship type is not in the approved taxonomy");
        }

        for (const endpoint of [input.source, input.target]) {
          const requirement = await deps.requirements.findById(
            ctx.tenantId,
            createRequirementId(endpoint.requirementId),
          );
          if (!requirement) {
            throw new QepInvariantViolation(
              `Relationship endpoint requirement does not exist: ${endpoint.requirementId}`,
            );
          }
          if (endpoint.mode === "content_version_pinned") {
            if (!endpoint.contentVersionId) {
              throw new QepInvariantViolation(
                "Content-Version-pinned endpoint requires contentVersionId",
              );
            }
            const version = await deps.contentVersions.getById(
              ctx.tenantId,
              createRequirementContentVersionId(endpoint.contentVersionId),
            );
            if (!version || version.requirementId !== endpoint.requirementId) {
              throw new QepInvariantViolation(
                `Content Version pin is invalid for requirement ${endpoint.requirementId}`,
              );
            }
          }
        }

        if (input.scope?.kind === "baseline" && input.scope.referenceId) {
          const exists = await deps.baselines.baselineExists(
            ctx.tenantId,
            createRequirementBaselineId(input.scope.referenceId),
          );
          if (!exists) {
            throw new QepInvariantViolation(
              "Relationship scope reference does not exist for baseline",
            );
          }
        }

        const created = createRequirementsRelationship({
          id: nextRelationshipId(deps),
          tenantId: ctx.tenantId,
          type: input.type,
          source: input.source,
          target: input.target,
          strength: input.strength,
          criticality: input.criticality,
          classification: input.classification,
          scope: input.scope,
          rationale: input.rationale,
          createdAt: nowIso(deps),
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
        });

        const stored = await runInTransaction(deps, async () =>
          deps.relationships.create(created),
        );
        await appendRelationshipAudit(
          deps,
          ctx,
          stored.id,
          "qep.requirements_relationship.created",
          { type: stored.type },
        );
        await emitEvents(deps, created);
        try {
          await deps.onRelationshipUpserted?.(stored);
        } catch {
          // projection isolation
        }
        return stored;
      });
    },

    async activateRelationship(ctx, id) {
      return observe(deps, "relationship.activate", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.transition"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const activationContext = await buildActivationContext(deps, ctx.tenantId, existing);
        const mutated = activateRequirementsRelationship(
          existing,
          nowIso(deps),
          ctx.userId,
          activationContext,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.activated",
        );
      });
    },

    async deprecateRelationship(ctx, id) {
      return observe(deps, "relationship.deprecate", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.transition"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const mutated = deprecateRequirementsRelationship(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.deprecated",
        );
      });
    },

    async retireRelationship(ctx, id) {
      return observe(deps, "relationship.retire", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.retire"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const mutated = retireRequirementsRelationship(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.retired",
        );
      });
    },

    async supersedeRelationship(ctx, input) {
      return observe(deps, "relationship.supersede", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.create"]);
        assertAnyPermission(ctx, ["qep.requirements.relationships.transition"]);
        const created = await this.createRelationship(ctx, {
          type: "supersedes",
          source: {
            mode: input.successorContentVersionId
              ? "content_version_pinned"
              : "requirement",
            requirementId: input.successorRequirementId,
            contentVersionId: input.successorContentVersionId,
          },
          target: {
            mode: input.predecessorContentVersionId
              ? "content_version_pinned"
              : "requirement",
            requirementId: input.predecessorRequirementId,
            contentVersionId: input.predecessorContentVersionId,
          },
          scope: input.scope,
          rationale: input.rationale,
          strength: input.strength,
          criticality: input.criticality,
          classification: input.classification,
        });
        return this.activateRelationship(ctx, created.id);
      });
    },

    async updateRationale(ctx, id, rationale) {
      return observe(deps, "relationship.update_rationale", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.modify"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const mutated = changeRelationshipRationale(
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
          "qep.requirements_relationship.rationale_changed",
        );
      });
    },

    async updateSemanticProfile(ctx, id, input) {
      return observe(deps, "relationship.update_semantic_profile", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.modify"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        if (input.scope?.kind === "baseline" && input.scope.referenceId) {
          const exists = await deps.baselines.baselineExists(
            ctx.tenantId,
            createRequirementBaselineId(input.scope.referenceId),
          );
          if (!exists) {
            throw new QepInvariantViolation(
              "Relationship scope reference does not exist for baseline",
            );
          }
        }
        const mutated = changeRelationshipSemanticProfile(
          existing,
          input,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.semantic_profile_changed",
        );
      });
    },

    async updateStrength(ctx, id, strength) {
      return observe(deps, "relationship.update_strength", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.modify"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const mutated = changeRelationshipStrength(
          existing,
          strength,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.strength_changed",
          { strength },
        );
      });
    },

    async updateClassification(ctx, id, classification) {
      return observe(deps, "relationship.update_classification", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.modify"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const mutated = changeRelationshipClassification(
          existing,
          classification,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.classification_changed",
          { classification },
        );
      });
    },

    async updateCriticality(ctx, id, criticality) {
      return observe(deps, "relationship.update_criticality", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.modify"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        const mutated = changeRelationshipCriticality(
          existing,
          criticality,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.criticality_changed",
          { criticality },
        );
      });
    },

    async updateScope(ctx, id, scope) {
      return observe(deps, "relationship.update_scope", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.modify"]);
        const existing = await requireRelationship(deps, ctx.tenantId, id);
        if (scope.kind === "baseline" && scope.referenceId) {
          const exists = await deps.baselines.baselineExists(
            ctx.tenantId,
            createRequirementBaselineId(scope.referenceId),
          );
          if (!exists) {
            throw new QepInvariantViolation(
              "Relationship scope reference does not exist for baseline",
            );
          }
        }
        const mutated = changeRelationshipScope(existing, scope, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.requirements_relationship.scope_changed",
          { scope },
        );
      });
    },

    async getRelationship(ctx, id) {
      return observe(deps, "relationship.get", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        return deps.relationships.get(ctx.tenantId, createRelationshipId(id));
      });
    },

    async listRelationships(ctx, query = {}) {
      return observe(deps, "relationship.list", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        const items = await deps.relationships.list(ctx.tenantId, {
          ...query,
          limit: undefined,
          offset: undefined,
        });
        return filterAndPaginate(items, query.limit ?? 50, query.offset ?? 0);
      });
    },

    async listByRequirement(ctx, requirementId, direction = "both") {
      return observe(deps, "relationship.list_by_requirement", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        createRequirementId(requirementId);
        return deps.relationships.list(ctx.tenantId, { requirementId, direction });
      });
    },

    async listInbound(ctx, requirementId) {
      return this.listByRequirement(ctx, requirementId, "inbound");
    },

    async listOutbound(ctx, requirementId) {
      return this.listByRequirement(ctx, requirementId, "outbound");
    },

    async listByTaxonomy(ctx, type) {
      return observe(deps, "relationship.list_by_taxonomy", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        return deps.relationships.list(ctx.tenantId, {
          type: createRelationshipType(type),
        });
      });
    },

    async listByLifecycle(ctx, lifecycleState) {
      return observe(deps, "relationship.list_by_lifecycle", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        return deps.relationships.list(ctx.tenantId, {
          lifecycleState: lifecycleState as never,
        });
      });
    },

    async listByBaseline(ctx, baselineId) {
      return observe(deps, "relationship.list_by_baseline", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        return deps.relationships.list(ctx.tenantId, { baselineId });
      });
    },

    async listByContentVersion(ctx, contentVersionId) {
      return observe(deps, "relationship.list_by_content_version", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        return deps.relationships.list(ctx.tenantId, { contentVersionId });
      });
    },

    async listConflicts(ctx) {
      return observe(deps, "relationship.list_conflicts", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        return deps.relationships.list(ctx.tenantId, { conflictsOnly: true });
      });
    },

    async listSupersessionChains(ctx, requirementId) {
      return observe(deps, "relationship.list_supersession", async () => {
        assertAnyPermission(ctx, ["qep.requirements.relationships.view"]);
        const rows = await deps.relationships.list(ctx.tenantId, {
          supersessionOnly: true,
          ...(requirementId ? { requirementId, direction: "both" as const } : {}),
        });
        // Bounded analytical query: return supersedes edges only (no deep graph walk).
        void toRelationshipEdgeFact;
        return rows;
      });
    },

    async listTaxonomy(ctx) {
      return observe(deps, "relationship.list_taxonomy", async () => {
        assertAnyPermission(ctx, [
          "qep.requirements.relationships.view",
          "qep.requirements.relationships.taxonomy.administer",
        ]);
        return deps.relationshipTaxonomy.list(ctx.tenantId);
      });
    },
  };
}
