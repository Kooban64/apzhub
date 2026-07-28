import { randomUUID } from "node:crypto";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import {
  assignVerification,
  cancelVerification,
  createVerification,
  expireVerification,
  rejectVerification,
  retireVerification,
  requestVerification,
  startVerification,
  supersedeVerification,
  updateMetadata as applyMetadataUpdate,
  updatePriority as applyPriorityUpdate,
  updateRationale as applyRationaleUpdate,
  verifyVerification,
  withdrawVerification,
  type CompleteVerificationInput,
  type Verification,
} from "../../domain/verification/verification";
import type { VerificationDomainEvent } from "../../domain/verification/verification-events";
import { createVerificationId, type VerificationId } from "../../domain/verification/verification-id";
import type { VerificationHistoryEntry } from "../../domain/verification/verification-history";
import type {
  StoredVerification,
  VerificationRepository,
} from "../../domain/verification/verification-repository";
import type { VerificationSubjectResolver } from "../../infrastructure/subject-resolution/subject-resolver";
import {
  VerificationForbiddenError,
  VerificationInvariantViolation,
  VerificationNotFoundError,
} from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";

export type VerificationAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly verificationId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly detailsJson: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

/** Simple append-only audit sink — full audit centralisation happens at the Platform Service layer. */
export type VerificationAuditAppender = {
  append(entry: VerificationAuditEntry): Promise<void | VerificationAuditEntry>;
};

export type VerificationObservationEvent = {
  readonly operation: string;
  readonly durationMs: number;
  readonly outcome: "success" | "error";
};

export type CreateVerificationCommandInput = {
  readonly subject: {
    readonly kind: string;
    readonly artefactId: string;
    readonly contentVersionId?: string;
    readonly baselineId?: string;
    readonly externalUri?: string;
  };
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly context?: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable?: boolean;
  };
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly priority?: string;
  readonly origin?: string;
  readonly rationale?: string;
  readonly reason?: string;
  readonly comment?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type CompleteVerificationCommandInput = CompleteVerificationInput;

export type AssignVerificationCommandInput = {
  readonly assigneeId: string;
};

export type SupersedeVerificationCommandInput = {
  readonly successorVerificationId: string;
};

export type VerificationListCommandQuery = {
  readonly status?: string;
  readonly outcome?: string;
  readonly subjectKind?: string;
  readonly subjectArtefactId?: string;
  readonly authorityActorId?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type VerificationApplicationServiceDeps = {
  readonly verifications: VerificationRepository;
  readonly subjectResolver?: VerificationSubjectResolver;
  readonly audits?: VerificationAuditAppender;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onDomainEvent?: (event: VerificationDomainEvent) => void | Promise<void>;
  readonly onVerificationUpserted?: (verification: StoredVerification) => void | Promise<void>;
  readonly onObservation?: (event: VerificationObservationEvent) => void;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
};

export type VerificationApplicationService = {
  createVerification(
    ctx: QepRequestContext,
    input: CreateVerificationCommandInput,
  ): Promise<StoredVerification>;
  requestVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification>;
  assignVerification(
    ctx: QepRequestContext,
    id: string,
    input: AssignVerificationCommandInput,
  ): Promise<StoredVerification>;
  startVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification>;
  completeVerification(
    ctx: QepRequestContext,
    id: string,
    input: CompleteVerificationCommandInput,
  ): Promise<StoredVerification>;
  rejectVerification(
    ctx: QepRequestContext,
    id: string,
    input: CompleteVerificationCommandInput,
  ): Promise<StoredVerification>;
  expireVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification>;
  withdrawVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification>;
  supersedeVerification(
    ctx: QepRequestContext,
    id: string,
    input: SupersedeVerificationCommandInput,
  ): Promise<StoredVerification>;
  cancelVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification>;
  retireVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification>;
  updateMetadata(
    ctx: QepRequestContext,
    id: string,
    patch: Readonly<Record<string, string>>,
  ): Promise<StoredVerification>;
  updateRationale(ctx: QepRequestContext, id: string, rationale: string): Promise<StoredVerification>;
  updatePriority(ctx: QepRequestContext, id: string, priority: string): Promise<StoredVerification>;

  getVerification(ctx: QepRequestContext, id: string): Promise<StoredVerification | null>;
  listVerifications(
    ctx: QepRequestContext,
    query?: VerificationListCommandQuery,
  ): Promise<{
    items: readonly StoredVerification[];
    total: number;
    limit: number;
    offset: number;
  }>;
  listBySubject(
    ctx: QepRequestContext,
    kind: string,
    artefactId: string,
  ): Promise<readonly StoredVerification[]>;
  listHistory(ctx: QepRequestContext, id: string): Promise<readonly VerificationHistoryEntry[]>;
  supersessionChain(
    ctx: QepRequestContext,
    verificationId?: string,
  ): Promise<readonly StoredVerification[]>;
};

const VIEW = "qep.verification.view";
const CREATE = "qep.verification.create";
const REQUEST = "qep.verification.request";
const ASSIGN = "qep.verification.assign";
const START = "qep.verification.start";
const COMPLETE = "qep.verification.complete";
const REJECT = "qep.verification.reject";
const EXPIRE = "qep.verification.expire";
const WITHDRAW = "qep.verification.withdraw";
const SUPERSEDE = "qep.verification.supersede";
const CANCEL = "qep.verification.cancel";
const RETIRE = "qep.verification.retire";
const MODIFY = "qep.verification.modify";
const HISTORY_VIEW = "qep.verification.history.view";

function nowIso(deps: VerificationApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: VerificationApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextVerificationId(deps: VerificationApplicationServiceDeps): VerificationId {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  return createVerificationId(generated.startsWith("ver_") ? generated : `ver_${generated}`);
}

function assertAnyPermission(ctx: QepRequestContext, requiredOneOf: readonly string[]): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.verification.*")) return;
  if (requiredOneOf.some((permission) => granted.includes(permission))) return;
  throw new VerificationForbiddenError(`Missing permission: ${requiredOneOf[0]}`);
}

async function appendAudit(
  deps: VerificationApplicationServiceDeps,
  ctx: QepRequestContext,
  verificationId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  if (!deps.audits) return;
  await deps.audits.append({
    id: deps.id?.() ?? randomUUID(),
    tenantId: ctx.tenantId,
    verificationId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

async function observe<T>(
  deps: VerificationApplicationServiceDeps,
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
  deps: VerificationApplicationServiceDeps,
  verification: Verification,
): Promise<void> {
  for (const event of verification.domainEvents) {
    await deps.onDomainEvent?.(event);
  }
}

async function requireVerification(
  deps: VerificationApplicationServiceDeps,
  tenantId: string,
  id: string,
): Promise<StoredVerification> {
  const verification = await deps.verifications.get(tenantId, createVerificationId(id));
  if (!verification) {
    throw new VerificationNotFoundError(`Verification not found: ${id}`);
  }
  return verification;
}

async function assertSubjectExists(
  deps: VerificationApplicationServiceDeps,
  tenantId: string,
  subject: { readonly kind: string; readonly artefactId: string },
): Promise<void> {
  if (!deps.subjectResolver || subject.kind === "external_reference") return;
  const resolved = await deps.subjectResolver.resolve(tenantId, subject.kind, subject.artefactId);
  if (!resolved.exists) {
    throw new VerificationInvariantViolation(
      `Verification subject does not exist: ${subject.kind}:${subject.artefactId}`,
    );
  }
}

async function persistMutation(
  deps: VerificationApplicationServiceDeps,
  ctx: QepRequestContext,
  mutated: Verification,
  expectedRevision: number,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredVerification> {
  const stored = await runInTransaction(deps, async () =>
    deps.verifications.save(mutated, expectedRevision),
  );
  await appendAudit(deps, ctx, stored.id, auditAction, {
    ...auditDetails,
    status: stored.status,
  });
  await emitEvents(deps, mutated);
  try {
    await deps.onVerificationUpserted?.(stored);
  } catch {
    // Search / projection failures must not roll back persisted Verifications.
  }
  return stored;
}

export function createVerificationApplicationService(
  deps: VerificationApplicationServiceDeps,
): VerificationApplicationService {
  const service: VerificationApplicationService = {
    async createVerification(ctx, input) {
      return observe(deps, "verification.create", async () => {
        assertAnyPermission(ctx, [CREATE]);
        await assertSubjectExists(deps, ctx.tenantId, input.subject);

        const created = createVerification({
          id: nextVerificationId(deps),
          tenantId: ctx.tenantId,
          subject: input.subject,
          authority: input.authority,
          context: input.context,
          scope: input.scope,
          priority: input.priority,
          origin: input.origin,
          rationale: input.rationale,
          reason: input.reason,
          comment: input.comment,
          metadata: input.metadata,
          createdAt: nowIso(deps),
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
        });

        const stored = await runInTransaction(deps, async () => deps.verifications.create(created));
        await appendAudit(deps, ctx, stored.id, "qep.verification.created", {
          subjectKind: stored.subject.kind,
        });
        await emitEvents(deps, created);
        try {
          await deps.onVerificationUpserted?.(stored);
        } catch {
          // projection isolation
        }
        return stored;
      });
    },

    async requestVerification(ctx, id) {
      return observe(deps, "verification.request", async () => {
        assertAnyPermission(ctx, [REQUEST]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = requestVerification(existing, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.requested");
      });
    },

    async assignVerification(ctx, id, input) {
      return observe(deps, "verification.assign", async () => {
        assertAnyPermission(ctx, [ASSIGN]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = assignVerification(existing, input.assigneeId, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.assigned", {
          assigneeId: input.assigneeId,
        });
      });
    },

    async startVerification(ctx, id) {
      return observe(deps, "verification.start", async () => {
        assertAnyPermission(ctx, [START]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = startVerification(existing, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.started");
      });
    },

    async completeVerification(ctx, id, input) {
      return observe(deps, "verification.complete", async () => {
        assertAnyPermission(ctx, [COMPLETE]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = verifyVerification(existing, input, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.verified", {
          outcome: input.outcome,
        });
      });
    },

    async rejectVerification(ctx, id, input) {
      return observe(deps, "verification.reject", async () => {
        assertAnyPermission(ctx, [REJECT]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = rejectVerification(existing, input, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.rejected", {
          outcome: input.outcome,
        });
      });
    },

    async expireVerification(ctx, id) {
      return observe(deps, "verification.expire", async () => {
        assertAnyPermission(ctx, [EXPIRE]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = expireVerification(existing, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.expired");
      });
    },

    async withdrawVerification(ctx, id) {
      return observe(deps, "verification.withdraw", async () => {
        assertAnyPermission(ctx, [WITHDRAW]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = withdrawVerification(existing, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.withdrawn");
      });
    },

    async supersedeVerification(ctx, id, input) {
      return observe(deps, "verification.supersede", async () => {
        assertAnyPermission(ctx, [SUPERSEDE]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const successorExists = await deps.verifications.exists(
          ctx.tenantId,
          createVerificationId(input.successorVerificationId),
        );
        if (!successorExists) {
          throw new VerificationInvariantViolation(
            `Successor Verification does not exist: ${input.successorVerificationId}`,
          );
        }
        const mutated = supersedeVerification(
          existing,
          input.successorVerificationId,
          nowIso(deps),
          ctx.userId,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.superseded", {
          successorVerificationId: input.successorVerificationId,
        });
      });
    },

    async cancelVerification(ctx, id) {
      return observe(deps, "verification.cancel", async () => {
        assertAnyPermission(ctx, [CANCEL]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = cancelVerification(existing, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.cancelled");
      });
    },

    async retireVerification(ctx, id) {
      return observe(deps, "verification.retire", async () => {
        assertAnyPermission(ctx, [RETIRE]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = retireVerification(existing, nowIso(deps), ctx.userId);
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.verification.retired");
      });
    },

    async updateMetadata(ctx, id, patch) {
      return observe(deps, "verification.update_metadata", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = applyMetadataUpdate(existing, patch, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.verification.metadata_changed",
        );
      });
    },

    async updateRationale(ctx, id, rationale) {
      return observe(deps, "verification.update_rationale", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = applyRationaleUpdate(existing, rationale, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.verification.rationale_changed",
        );
      });
    },

    async updatePriority(ctx, id, priority) {
      return observe(deps, "verification.update_priority", async () => {
        assertAnyPermission(ctx, [MODIFY]);
        const existing = await requireVerification(deps, ctx.tenantId, id);
        const mutated = applyPriorityUpdate(existing, priority, nowIso(deps), ctx.userId);
        return persistMutation(
          deps,
          ctx,
          mutated,
          existing.revision,
          "qep.verification.priority_changed",
          { priority },
        );
      });
    },

    async getVerification(ctx, id) {
      return observe(deps, "verification.get", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.verifications.get(ctx.tenantId, createVerificationId(id));
      });
    },

    async listVerifications(ctx, query = {}) {
      return observe(deps, "verification.list", async () => {
        assertAnyPermission(ctx, [VIEW]);
        const items = await deps.verifications.list(ctx.tenantId, {
          ...(query.status ? { status: query.status as StoredVerification["status"] } : {}),
          ...(query.outcome ? { outcome: query.outcome as NonNullable<StoredVerification["outcome"]> } : {}),
          subjectKind: query.subjectKind,
          subjectArtefactId: query.subjectArtefactId,
          authorityActorId: query.authorityActorId,
        });
        return filterAndPaginate(items, query.limit ?? 50, query.offset ?? 0);
      });
    },

    async listBySubject(ctx, kind, artefactId) {
      return observe(deps, "verification.list_by_subject", async () => {
        assertAnyPermission(ctx, [VIEW]);
        return deps.verifications.list(ctx.tenantId, {
          subjectKind: kind,
          subjectArtefactId: artefactId,
        });
      });
    },

    async listHistory(ctx, id) {
      return observe(deps, "verification.history", async () => {
        assertAnyPermission(ctx, [VIEW, HISTORY_VIEW]);
        return deps.verifications.listHistory(ctx.tenantId, createVerificationId(id));
      });
    },

    async supersessionChain(ctx, verificationId) {
      return observe(deps, "verification.supersession_chain", async () => {
        assertAnyPermission(ctx, [VIEW]);
        const rows = await deps.verifications.list(ctx.tenantId, { status: "superseded" });
        if (!verificationId) return rows;
        return rows.filter(
          (row) => row.id === verificationId || row.successorVerificationId === verificationId,
        );
      });
    },
  };

  return service;
}
