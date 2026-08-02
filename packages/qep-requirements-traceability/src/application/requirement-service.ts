/**
 * Requirement Application Service — APZQEP-140-E.
 * Requirements independent of execution. Coverage derived only.
 */

import { assertTransition } from "../domain/lifecycle";
import type {
  CoverageSnapshot,
  RequirementAggregate,
  RequirementCategory,
  RequirementCriticality,
  RequirementHistoryEntry,
  RequirementLifecycleState,
  RequirementNode,
  RequirementPriority,
  RequirementRisk,
  RequirementSuiteLink,
  TraceabilityMatrixRow,
  TraceLink,
} from "../domain/types";
import {
  buildRequirementDomainEvent,
  QEP_REQUIREMENT_EVENTS,
  type QepRequirementEventId,
  type RequirementDomainEvent,
} from "./events";
import type { QualityArtefactPorts } from "./ports";
import type { RequirementListFilter, RequirementRepository } from "./repository";
import { buildMatrixRow, deriveTraceability } from "./traceability-engine";

export type RequirementActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions: readonly string[];
};

export type RequirementEventPublisher = {
  publish(event: RequirementDomainEvent): Promise<void>;
};

export type CreateRequirementInput = {
  readonly requirementId?: string;
  readonly title: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly category?: RequirementCategory;
  readonly priority?: RequirementPriority;
  readonly criticality?: RequirementCriticality;
  readonly risk?: RequirementRisk;
  readonly ownerId?: string;
  readonly releaseReference?: string;
  readonly component?: string;
  readonly application?: string;
  readonly tags?: readonly string[];
  readonly customMetadata?: Readonly<Record<string, unknown>>;
};

function requirePermission(actor: RequirementActor, permission: string): void {
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes("qep.enterprise_requirements.admin")
  ) {
    throw new Error(`requirement.permission.denied:${permission}`);
  }
}

function history(
  actorId: string,
  at: string,
  action: string,
  from?: RequirementLifecycleState,
  to?: RequirementLifecycleState,
  detail?: string,
): RequirementHistoryEntry {
  return {
    at,
    actorId,
    action,
    ...(from ? { fromStatus: from } : {}),
    ...(to ? { toStatus: to } : {}),
    ...(detail ? { detail } : {}),
  };
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export type RequirementApplicationService = {
  create(
    actor: RequirementActor,
    input: CreateRequirementInput,
    now: string,
  ): Promise<RequirementNode>;
  update(
    actor: RequirementActor,
    requirementId: string,
    patch: Partial<CreateRequirementInput> & {
      readonly expectedRevision?: number;
    },
    now: string,
  ): Promise<RequirementNode>;
  transition(
    actor: RequirementActor,
    requirementId: string,
    to: RequirementLifecycleState,
    now: string,
    options?: { readonly reason?: string },
  ): Promise<RequirementNode>;
  linkSuite(
    actor: RequirementActor,
    requirementId: string,
    suiteId: string,
    now: string,
    suiteName?: string,
  ): Promise<RequirementNode>;
  unlinkSuite(
    actor: RequirementActor,
    requirementId: string,
    suiteId: string,
    now: string,
  ): Promise<RequirementNode>;
  get(actor: RequirementActor, requirementId: string): Promise<RequirementAggregate>;
  list(
    actor: RequirementActor,
    filter: Omit<RequirementListFilter, "tenantId">,
  ): Promise<readonly RequirementNode[]>;
  history(
    actor: RequirementActor,
    requirementId: string,
  ): Promise<readonly RequirementHistoryEntry[]>;
  coverage(
    actor: RequirementActor,
    requirementId: string,
    now: string,
  ): Promise<CoverageSnapshot>;
  coverageDashboard(
    actor: RequirementActor,
    now: string,
    filter?: Omit<RequirementListFilter, "tenantId">,
  ): Promise<{
    readonly items: readonly CoverageSnapshot[];
    readonly summary: {
      readonly total: number;
      readonly uncovered: number;
      readonly highRiskGaps: number;
      readonly averageCoverage: number;
    };
  }>;
  traceability(
    actor: RequirementActor,
    requirementId: string,
    now: string,
  ): Promise<{
    readonly links: readonly TraceLink[];
    readonly coverage: CoverageSnapshot;
  }>;
  matrix(
    actor: RequirementActor,
    now: string,
    filter?: Omit<RequirementListFilter, "tenantId">,
  ): Promise<readonly TraceabilityMatrixRow[]>;
  drainEvents(): readonly RequirementDomainEvent[];
};

export function createRequirementApplicationService(deps: {
  readonly repository: RequirementRepository;
  readonly ports?: QualityArtefactPorts;
  readonly publisher?: RequirementEventPublisher;
  /** When set (postgres), mutators run inside one DB transaction with outbox. */
  readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
}): RequirementApplicationService {
  const pending: RequirementDomainEvent[] = [];
  const ports = deps.ports ?? {};
  const run =
    deps.runInTransaction ?? (async <T>(fn: () => Promise<T>): Promise<T> => fn());

  async function emit(
    eventId: QepRequirementEventId,
    requirement: RequirementNode,
    actorId: string,
    now: string,
    coverage?: CoverageSnapshot,
    extra?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const event = buildRequirementDomainEvent({
      eventId,
      requirement,
      actorId,
      correlationId: `corr-${requirement.requirementId}-${requirement.revision}`,
      timestamp: now,
      ...(coverage ? { coverage } : {}),
      ...(extra ? { extra } : {}),
    });
    pending.push(event);
    await deps.publisher?.publish(event);
  }

  async function load(
    tenantId: string,
    requirementId: string,
  ): Promise<RequirementAggregate> {
    const agg = await deps.repository.get(tenantId, requirementId);
    if (!agg) throw new Error(`requirement.not_found:${requirementId}`);
    return agg;
  }

  const service: RequirementApplicationService = {
    drainEvents() {
      return [...pending];
    },

    async create(actor, input, now) {
      requirePermission(actor, "qep.enterprise_requirements.create");
      if (!input.title.trim()) {
        throw new Error("requirement.validation.title_required");
      }
      const requirementId = input.requirementId ?? nextId("req");
      const requirement: RequirementNode = {
        requirementId,
        tenantId: actor.tenantId,
        ...(input.projectId ? { projectId: input.projectId } : {}),
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        category: input.category ?? "functional",
        status: "draft",
        priority: input.priority ?? "p2",
        criticality: input.criticality ?? "medium",
        risk: input.risk ?? "medium",
        ownerId: input.ownerId ?? actor.userId,
        version: 1,
        ...(input.releaseReference ? { releaseReference: input.releaseReference } : {}),
        ...(input.component ? { component: input.component } : {}),
        ...(input.application ? { application: input.application } : {}),
        tags: input.tags ?? [],
        suiteLinks: [],
        createdAt: now,
        createdBy: actor.userId,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: 1,
        customMetadata: input.customMetadata ?? {},
      };
      await deps.repository.save({
        requirement,
        history: [history(actor.userId, now, "created", undefined, "draft")],
      });
      const coverage = (await deriveTraceability(requirement, ports, now)).coverage;
      await emit(
        QEP_REQUIREMENT_EVENTS.created,
        requirement,
        actor.userId,
        now,
        coverage,
      );
      await emit(
        QEP_REQUIREMENT_EVENTS.coverageUpdated,
        requirement,
        actor.userId,
        now,
        coverage,
      );
      return requirement;
    },

    async update(actor, requirementId, patch, now) {
      requirePermission(actor, "qep.enterprise_requirements.update");
      const agg = await load(actor.tenantId, requirementId);
      const d = agg.requirement;
      if (d.status === "retired") {
        throw new Error("requirement.validation.retired");
      }
      if (patch.expectedRevision != null && patch.expectedRevision !== d.revision) {
        throw new Error("requirement.concurrency.stale_revision");
      }
      const next: RequirementNode = {
        ...d,
        ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() }
          : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.criticality !== undefined ? { criticality: patch.criticality } : {}),
        ...(patch.risk !== undefined ? { risk: patch.risk } : {}),
        ...(patch.ownerId !== undefined ? { ownerId: patch.ownerId } : {}),
        ...(patch.releaseReference !== undefined
          ? { releaseReference: patch.releaseReference }
          : {}),
        ...(patch.component !== undefined ? { component: patch.component } : {}),
        ...(patch.application !== undefined ? { application: patch.application } : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.projectId !== undefined ? { projectId: patch.projectId } : {}),
        ...(patch.customMetadata !== undefined
          ? { customMetadata: patch.customMetadata }
          : {}),
        version: d.version + (patch.title !== undefined ? 1 : 0),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: d.revision + 1,
      };
      await deps.repository.save({
        requirement: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "updated", d.status, d.status),
        ],
      });
      await emit(QEP_REQUIREMENT_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async transition(actor, requirementId, to, now, options = {}) {
      requirePermission(actor, "qep.enterprise_requirements.lifecycle");
      const agg = await load(actor.tenantId, requirementId);
      const from = agg.requirement.status;
      assertTransition(from, to);
      const next: RequirementNode = {
        ...agg.requirement,
        status: to,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.requirement.revision + 1,
        ...(to === "approved" ? { approvedAt: now, approvedBy: actor.userId } : {}),
        ...(to === "archived" ? { archivedAt: now } : {}),
      };
      await deps.repository.save({
        requirement: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "lifecycle", from, to, options.reason),
        ],
      });
      const eventId =
        to === "approved"
          ? QEP_REQUIREMENT_EVENTS.approved
          : QEP_REQUIREMENT_EVENTS.statusChanged;
      await emit(eventId, next, actor.userId, now, undefined, {
        fromStatus: from,
        toStatus: to,
      });
      return next;
    },

    async linkSuite(actor, requirementId, suiteId, now, suiteName) {
      requirePermission(actor, "qep.enterprise_requirements.update");
      if (!suiteId.trim()) {
        throw new Error("requirement.suite.id_required");
      }
      if (ports.getSuite) {
        const suite = await ports.getSuite(actor.tenantId, suiteId);
        if (!suite) {
          throw new Error(`requirement.suite.not_found:${suiteId}`);
        }
        if (suite.tenantId !== actor.tenantId) {
          throw new Error("requirement.suite.cross_tenant");
        }
      }
      const agg = await load(actor.tenantId, requirementId);
      if (agg.requirement.suiteLinks.some((l) => l.suiteId === suiteId)) {
        return agg.requirement;
      }
      const link: RequirementSuiteLink = {
        linkId: nextId("rsl"),
        suiteId,
        ...(suiteName ? { suiteName } : {}),
        createdAt: now,
        createdBy: actor.userId,
      };
      const next: RequirementNode = {
        ...agg.requirement,
        suiteLinks: [...agg.requirement.suiteLinks, link],
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.requirement.revision + 1,
      };
      await deps.repository.save({
        requirement: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "suite_linked", next.status, next.status, suiteId),
        ],
      });
      const derived = await deriveTraceability(next, ports, now);
      await emit(
        QEP_REQUIREMENT_EVENTS.linked,
        next,
        actor.userId,
        now,
        derived.coverage,
        { suiteId },
      );
      await emit(
        QEP_REQUIREMENT_EVENTS.traceabilityChanged,
        next,
        actor.userId,
        now,
        derived.coverage,
      );
      await emit(
        QEP_REQUIREMENT_EVENTS.coverageUpdated,
        next,
        actor.userId,
        now,
        derived.coverage,
      );
      return next;
    },

    async unlinkSuite(actor, requirementId, suiteId, now) {
      requirePermission(actor, "qep.enterprise_requirements.update");
      const agg = await load(actor.tenantId, requirementId);
      const next: RequirementNode = {
        ...agg.requirement,
        suiteLinks: agg.requirement.suiteLinks.filter((l) => l.suiteId !== suiteId),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.requirement.revision + 1,
      };
      await deps.repository.save({
        requirement: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "suite_unlinked",
            next.status,
            next.status,
            suiteId,
          ),
        ],
      });
      const derived = await deriveTraceability(next, ports, now);
      await emit(
        QEP_REQUIREMENT_EVENTS.traceabilityChanged,
        next,
        actor.userId,
        now,
        derived.coverage,
      );
      await emit(
        QEP_REQUIREMENT_EVENTS.coverageUpdated,
        next,
        actor.userId,
        now,
        derived.coverage,
      );
      return next;
    },

    async get(actor, requirementId) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      return load(actor.tenantId, requirementId);
    },

    async list(actor, filter) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      return deps.repository.list({ ...filter, tenantId: actor.tenantId });
    },

    async history(actor, requirementId) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      const agg = await load(actor.tenantId, requirementId);
      return agg.history;
    },

    async coverage(actor, requirementId, now) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      const agg = await load(actor.tenantId, requirementId);
      return (await deriveTraceability(agg.requirement, ports, now)).coverage;
    },

    async coverageDashboard(actor, now, filter = {}) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      const items = await deps.repository.list({
        ...filter,
        tenantId: actor.tenantId,
      });
      const snapshots: CoverageSnapshot[] = [];
      for (const req of items) {
        snapshots.push((await deriveTraceability(req, ports, now)).coverage);
      }
      const uncovered = snapshots.filter((s) => s.uncovered).length;
      const highRiskGaps = snapshots.filter((s) => s.highRiskGap).length;
      const averageCoverage =
        snapshots.length === 0
          ? 0
          : Math.round(
              snapshots.reduce((sum, s) => sum + s.overallCoverage, 0) /
                snapshots.length,
            );
      return {
        items: snapshots,
        summary: {
          total: snapshots.length,
          uncovered,
          highRiskGaps,
          averageCoverage,
        },
      };
    },

    async traceability(actor, requirementId, now) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      const agg = await load(actor.tenantId, requirementId);
      const derived = await deriveTraceability(agg.requirement, ports, now);
      return { links: derived.links, coverage: derived.coverage };
    },

    async matrix(actor, now, filter = {}) {
      requirePermission(actor, "qep.enterprise_requirements.read");
      const items = await deps.repository.list({
        ...filter,
        tenantId: actor.tenantId,
      });
      const rows: TraceabilityMatrixRow[] = [];
      for (const req of items) {
        rows.push(await buildMatrixRow(req, ports, now));
      }
      return rows;
    },
  };

  const mutating = new Set([
    "create",
    "update",
    "transition",
    "linkSuite",
    "unlinkSuite",
  ]);

  return new Proxy(service, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (
        typeof prop === "string" &&
        mutating.has(prop) &&
        typeof value === "function"
      ) {
        return (...args: unknown[]) =>
          run(() =>
            (value as (...a: unknown[]) => Promise<unknown>).apply(target, args),
          );
      }
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
