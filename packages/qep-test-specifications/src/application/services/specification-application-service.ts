import { randomUUID } from "node:crypto";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import type { SpecificationDomainEvent } from "../../domain/test-specification/specification-events";
import type { SpecificationHistoryEntry } from "../../domain/test-specification/specification-history";
import {
  createSpecificationId,
  type SpecificationId,
} from "../../domain/test-specification/specification-id";
import type { SpecificationRelationship } from "../../domain/test-specification/specification-relationship";
import type {
  StoredTestSpecification,
  TestSpecificationListQuery,
  TestSpecificationRepository,
} from "../../domain/test-specification/specification-repository";
import {
  addSpecificationRelationship,
  approveSpecification,
  cancelSpecification,
  createSuccessorDraft,
  createTestSpecification,
  rejectSpecification,
  removeSpecificationRelationship,
  retireSpecification,
  startSpecificationReview,
  supersedeSpecification,
  updateSpecificationContent,
  updateSpecificationMetadata,
  withdrawSpecification,
  type TestSpecification,
  type UpdateSpecificationContentInput,
} from "../../domain/test-specification/test-specification";
import {
  TestSpecificationForbiddenError,
  TestSpecificationInvariantViolation,
  TestSpecificationNotFoundError,
} from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";

export type SpecificationAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly specificationId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly detailsJson: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

export type SpecificationAuditAppender = {
  append(entry: SpecificationAuditEntry): Promise<void | SpecificationAuditEntry>;
};

export type SpecificationObservationEvent = {
  readonly operation: string;
  readonly durationMs: number;
  readonly outcome: "success" | "error";
};

export type CreateSpecificationCommandInput = {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly scope: string;
  readonly type: string;
  readonly classification: string;
  readonly owner: string;
  readonly author: string;
  readonly priority?: string;
  readonly complexity?: string;
  readonly reviewer?: string;
  readonly preconditions?: readonly string[];
  readonly postconditions?: readonly string[];
  readonly acceptanceCriteria?: readonly string[];
  readonly risks?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly severity?: string;
  }[];
  readonly dependencies?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly referenceKind?: string;
    readonly referenceId?: string;
  }[];
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
};

export type UpdateSpecificationDraftCommandInput = {
  readonly content?: UpdateSpecificationContentInput;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type SubmitSpecificationReviewCommandInput = {
  readonly reviewerId: string;
};

export type ApproveSpecificationCommandInput = {
  readonly approvalComment?: string;
};

export type RejectSpecificationCommandInput = {
  readonly reviewComment: string;
};

export type SupersedeSpecificationCommandInput = {
  readonly successorSpecificationId?: string;
  readonly createSuccessor?: {
    readonly id?: string;
    readonly bump: "major" | "minor";
    readonly title?: string;
    readonly description?: string;
    readonly objective?: string;
    readonly comparisonNotes?: string;
  };
};

export type AddSpecificationRelationshipCommandInput = {
  readonly id: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  readonly label?: string;
};

export type SpecificationListCommandQuery = TestSpecificationListQuery;

export type SpecificationApplicationServiceDeps = {
  readonly specifications: TestSpecificationRepository;
  readonly audits?: SpecificationAuditAppender;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onDomainEvent?: (event: SpecificationDomainEvent) => void | Promise<void>;
  readonly onSpecificationUpserted?: (
    specification: StoredTestSpecification,
  ) => void | Promise<void>;
  readonly onObservation?: (event: SpecificationObservationEvent) => void;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
};

export type SpecificationApplicationService = {
  createSpecification(
    ctx: QepRequestContext,
    input: CreateSpecificationCommandInput,
  ): Promise<StoredTestSpecification>;
  updateDraft(
    ctx: QepRequestContext,
    id: string,
    input: UpdateSpecificationDraftCommandInput,
  ): Promise<StoredTestSpecification>;
  submitForReview(
    ctx: QepRequestContext,
    id: string,
    input: SubmitSpecificationReviewCommandInput,
  ): Promise<StoredTestSpecification>;
  approve(
    ctx: QepRequestContext,
    id: string,
    input?: ApproveSpecificationCommandInput,
  ): Promise<StoredTestSpecification>;
  reject(
    ctx: QepRequestContext,
    id: string,
    input: RejectSpecificationCommandInput,
  ): Promise<StoredTestSpecification>;
  withdraw(ctx: QepRequestContext, id: string): Promise<StoredTestSpecification>;
  supersede(
    ctx: QepRequestContext,
    id: string,
    input?: SupersedeSpecificationCommandInput,
  ): Promise<{
    readonly predecessor: StoredTestSpecification;
    readonly successor?: StoredTestSpecification;
  }>;
  retire(ctx: QepRequestContext, id: string): Promise<StoredTestSpecification>;
  cancel(ctx: QepRequestContext, id: string): Promise<StoredTestSpecification>;
  addRelationship(
    ctx: QepRequestContext,
    id: string,
    input: AddSpecificationRelationshipCommandInput,
  ): Promise<StoredTestSpecification>;
  removeRelationship(
    ctx: QepRequestContext,
    id: string,
    relationshipId: string,
  ): Promise<StoredTestSpecification>;

  get(ctx: QepRequestContext, id: string): Promise<StoredTestSpecification | null>;
  list(
    ctx: QepRequestContext,
    query?: SpecificationListCommandQuery,
  ): Promise<{
    items: readonly StoredTestSpecification[];
    total: number;
    limit: number;
    offset: number;
  }>;
  search(
    ctx: QepRequestContext,
    query: string,
    queryOptions?: Omit<SpecificationListCommandQuery, "query">,
  ): Promise<{
    items: readonly StoredTestSpecification[];
    total: number;
    limit: number;
    offset: number;
  }>;
  listHistory(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly SpecificationHistoryEntry[]>;
  listVersions(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly StoredTestSpecification[]>;
  findLatestApproved(
    ctx: QepRequestContext,
    number: string,
  ): Promise<StoredTestSpecification | null>;
  listRelationships(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly SpecificationRelationship[]>;
};

const CREATE = "qep.specification.create";
const READ = "qep.specification.read";
const UPDATE = "qep.specification.update";
const REVIEW = "qep.specification.review";
const APPROVE = "qep.specification.approve";
const REJECT = "qep.specification.reject";
const WITHDRAW = "qep.specification.withdraw";
const RETIRE = "qep.specification.retire";
const CANCEL = "qep.specification.cancel";
const SEARCH = "qep.specification.search";
const HISTORY_VIEW = "qep.specification.history.view";

function nowIso(deps: SpecificationApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: SpecificationApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextSpecificationId(
  deps: SpecificationApplicationServiceDeps,
): SpecificationId {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  return createSpecificationId(
    generated.startsWith("tsp_") ? generated : `tsp_${generated}`,
  );
}

function assertAnyPermission(
  ctx: QepRequestContext,
  requiredOneOf: readonly string[],
): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.specification.*")) return;
  if (requiredOneOf.some((permission) => granted.includes(permission))) return;
  throw new TestSpecificationForbiddenError(`Missing permission: ${requiredOneOf[0]}`);
}

async function appendAudit(
  deps: SpecificationApplicationServiceDeps,
  ctx: QepRequestContext,
  specificationId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  if (!deps.audits) return;
  await deps.audits.append({
    id: deps.id?.() ?? randomUUID(),
    tenantId: ctx.tenantId,
    specificationId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

async function observe<T>(
  deps: SpecificationApplicationServiceDeps,
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
  deps: SpecificationApplicationServiceDeps,
  specification: TestSpecification,
): Promise<void> {
  for (const event of specification.domainEvents) {
    await deps.onDomainEvent?.(event);
  }
}

async function requireSpecification(
  deps: SpecificationApplicationServiceDeps,
  tenantId: string,
  id: string,
): Promise<StoredTestSpecification> {
  const specification = await deps.specifications.get(
    tenantId,
    createSpecificationId(id),
  );
  if (!specification) {
    throw new TestSpecificationNotFoundError(`Test Specification not found: ${id}`);
  }
  return specification;
}

async function persistMutation(
  deps: SpecificationApplicationServiceDeps,
  ctx: QepRequestContext,
  mutated: TestSpecification,
  expectedRevision: number,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredTestSpecification> {
  const stored = await runInTransaction(deps, async () =>
    deps.specifications.save(mutated, expectedRevision),
  );
  await appendAudit(deps, ctx, stored.record.id, auditAction, {
    ...auditDetails,
    status: stored.record.status,
  });
  await emitEvents(deps, mutated);
  try {
    await deps.onSpecificationUpserted?.(stored);
  } catch {
    // Search / projection failures must not roll back persisted Specifications.
  }
  return stored;
}

async function persistCreate(
  deps: SpecificationApplicationServiceDeps,
  ctx: QepRequestContext,
  created: TestSpecification,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredTestSpecification> {
  const stored = await runInTransaction(deps, async () =>
    deps.specifications.create(created),
  );
  await appendAudit(deps, ctx, stored.record.id, auditAction, auditDetails);
  await emitEvents(deps, created);
  try {
    await deps.onSpecificationUpserted?.(stored);
  } catch {
    // projection isolation
  }
  return stored;
}

export function createSpecificationApplicationService(
  deps: SpecificationApplicationServiceDeps,
): SpecificationApplicationService {
  const service: SpecificationApplicationService = {
    async createSpecification(ctx, input) {
      return observe(deps, "specification.create", async () => {
        assertAnyPermission(ctx, [CREATE]);
        const created = createTestSpecification({
          id: nextSpecificationId(deps),
          tenantId: ctx.tenantId,
          number: input.number,
          title: input.title,
          description: input.description,
          objective: input.objective,
          scope: input.scope,
          type: input.type,
          classification: input.classification,
          owner: input.owner,
          author: input.author,
          priority: input.priority,
          complexity: input.complexity,
          reviewer: input.reviewer,
          preconditions: input.preconditions,
          postconditions: input.postconditions,
          acceptanceCriteria: input.acceptanceCriteria,
          risks: input.risks,
          dependencies: input.dependencies,
          tags: input.tags,
          metadata: input.metadata,
          createdAt: nowIso(deps),
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
        });
        return persistCreate(deps, ctx, created, "qep.specification.created", {
          number: created.record.number,
        });
      });
    },

    async updateDraft(ctx, id, input) {
      return observe(deps, "specification.update_draft", async () => {
        assertAnyPermission(ctx, [UPDATE]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        let mutated: TestSpecification = existing;
        if (input.content) {
          mutated = updateSpecificationContent(
            mutated,
            input.content,
            nowIso(deps),
            ctx.userId,
          );
        }
        if (input.metadata) {
          mutated = updateSpecificationMetadata(
            mutated,
            input.metadata,
            nowIso(deps),
            ctx.userId,
          );
        }
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.updated",
        );
      });
    },

    async submitForReview(ctx, id, input) {
      return observe(deps, "specification.submit_for_review", async () => {
        assertAnyPermission(ctx, [REVIEW]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = startSpecificationReview(
          existing,
          input.reviewerId,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.review_started",
          { reviewerId: input.reviewerId },
        );
      });
    },

    async approve(ctx, id, input = {}) {
      return observe(deps, "specification.approve", async () => {
        assertAnyPermission(ctx, [APPROVE]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = approveSpecification(
          existing,
          nowIso(deps),
          ctx.userId,
          input.approvalComment,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.approved",
        );
      });
    },

    async reject(ctx, id, input) {
      return observe(deps, "specification.reject", async () => {
        assertAnyPermission(ctx, [REJECT]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = rejectSpecification(
          existing,
          nowIso(deps),
          ctx.userId,
          input.reviewComment,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.rejected",
        );
      });
    },

    async withdraw(ctx, id) {
      return observe(deps, "specification.withdraw", async () => {
        assertAnyPermission(ctx, [WITHDRAW]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = withdrawSpecification(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.withdrawn",
        );
      });
    },

    async supersede(ctx, id, input = {}) {
      return observe(deps, "specification.supersede", async () => {
        assertAnyPermission(ctx, [UPDATE]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);

        let successorId = input.successorSpecificationId;
        let successorStored: StoredTestSpecification | undefined;

        if (input.createSuccessor) {
          const successorDraft = createSuccessorDraft(existing, {
            id: input.createSuccessor.id ?? nextSpecificationId(deps),
            bump: input.createSuccessor.bump,
            title: input.createSuccessor.title,
            description: input.createSuccessor.description,
            objective: input.createSuccessor.objective,
            comparisonNotes: input.createSuccessor.comparisonNotes,
            createdAt: nowIso(deps),
            createdBy: ctx.userId,
            correlationId: ctx.correlationId,
          });
          successorStored = await persistCreate(
            deps,
            ctx,
            successorDraft,
            "qep.specification.successor_created",
            { predecessorId: existing.record.id },
          );
          successorId = successorStored.record.id;
        }

        if (!successorId) {
          throw new TestSpecificationInvariantViolation(
            "Supersede requires successorSpecificationId or createSuccessor",
          );
        }

        const successorExists = await deps.specifications.exists(
          ctx.tenantId,
          createSpecificationId(successorId),
        );
        if (!successorExists) {
          throw new TestSpecificationInvariantViolation(
            `Successor Test Specification does not exist: ${successorId}`,
          );
        }

        const mutated = supersedeSpecification(
          existing,
          successorId,
          nowIso(deps),
          ctx.userId,
        );
        const predecessor = await persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.superseded",
          { successorSpecificationId: successorId },
        );
        return { predecessor, successor: successorStored };
      });
    },

    async retire(ctx, id) {
      return observe(deps, "specification.retire", async () => {
        assertAnyPermission(ctx, [RETIRE]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = retireSpecification(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.retired",
        );
      });
    },

    async cancel(ctx, id) {
      return observe(deps, "specification.cancel", async () => {
        assertAnyPermission(ctx, [CANCEL]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = cancelSpecification(existing, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.cancelled",
        );
      });
    },

    async addRelationship(ctx, id, input) {
      return observe(deps, "specification.add_relationship", async () => {
        assertAnyPermission(ctx, [UPDATE]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = addSpecificationRelationship(
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
          "qep.specification.relationship_added",
          { kind: input.kind, artefactId: input.artefactId },
        );
      });
    },

    async removeRelationship(ctx, id, relationshipId) {
      return observe(deps, "specification.remove_relationship", async () => {
        assertAnyPermission(ctx, [UPDATE]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        const mutated = removeSpecificationRelationship(
          existing,
          relationshipId,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.specification.relationship_removed",
          { relationshipId },
        );
      });
    },

    async get(ctx, id) {
      return observe(deps, "specification.get", async () => {
        assertAnyPermission(ctx, [READ]);
        return deps.specifications.get(ctx.tenantId, createSpecificationId(id));
      });
    },

    async list(ctx, query = {}) {
      return observe(deps, "specification.list", async () => {
        assertAnyPermission(ctx, [READ]);
        const items = await deps.specifications.list(ctx.tenantId, query);
        return filterAndPaginate(items, query.limit ?? 50, query.offset ?? 0);
      });
    },

    async search(ctx, query, queryOptions = {}) {
      return observe(deps, "specification.search", async () => {
        assertAnyPermission(ctx, [READ, SEARCH]);
        const items = await deps.specifications.list(ctx.tenantId, {
          ...queryOptions,
          query,
        });
        return filterAndPaginate(
          items,
          queryOptions.limit ?? 50,
          queryOptions.offset ?? 0,
        );
      });
    },

    async listHistory(ctx, id) {
      return observe(deps, "specification.history", async () => {
        assertAnyPermission(ctx, [READ, HISTORY_VIEW]);
        return deps.specifications.listHistory(ctx.tenantId, createSpecificationId(id));
      });
    },

    async listVersions(ctx, id) {
      return observe(deps, "specification.list_versions", async () => {
        assertAnyPermission(ctx, [READ]);
        const existing = await requireSpecification(deps, ctx.tenantId, id);
        return deps.specifications.listVersionsByNumber(
          ctx.tenantId,
          existing.record.number,
        );
      });
    },

    async findLatestApproved(ctx, number) {
      return observe(deps, "specification.find_latest_approved", async () => {
        assertAnyPermission(ctx, [READ]);
        return deps.specifications.findLatestApprovedByNumber(ctx.tenantId, number);
      });
    },

    async listRelationships(ctx, id) {
      return observe(deps, "specification.list_relationships", async () => {
        assertAnyPermission(ctx, [READ]);
        return deps.specifications.listRelationships(
          ctx.tenantId,
          createSpecificationId(id),
        );
      });
    },
  };

  return service;
}
