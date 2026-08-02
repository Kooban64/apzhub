/**
 * Suite Application Service — business rules for Enterprise Test Suite Management.
 */

import { assertTransition } from "../domain/lifecycle";
import type {
  SuiteAggregate,
  SuiteHistoryEntry,
  SuiteKind,
  SuiteLifecycleState,
  SuiteNode,
  SuitePriority,
} from "../domain/types";
import {
  buildSuiteDomainEvent,
  QEP_SUITE_EVENTS,
  type QepSuiteEventId,
  type SuiteDomainEvent,
} from "./events";
import type { SuiteListFilter, SuiteRepository } from "./repository";

export type SuiteActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions: readonly string[];
  readonly roles?: readonly string[];
};

export type SuiteEventPublisher = {
  publish(event: SuiteDomainEvent): Promise<void>;
};

export type CreateSuiteInput = {
  readonly suiteId?: string;
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly parentSuiteId?: string;
  readonly folderPath?: string;
  readonly kind?: SuiteKind;
  readonly priority?: SuitePriority;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly risk?: string;
  readonly businessArea?: string;
  readonly application?: string;
  readonly component?: string;
  readonly classification?: string;
  readonly customMetadata?: Readonly<Record<string, unknown>>;
};

function requirePermission(actor: SuiteActor, permission: string): void {
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes("qep.suites.admin")
  ) {
    throw new Error(`suite.permission.denied:${permission}`);
  }
}

function history(
  actorId: string,
  at: string,
  action: string,
  from?: SuiteLifecycleState,
  to?: SuiteLifecycleState,
  detail?: string,
): SuiteHistoryEntry {
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
function nextId(): string {
  seq += 1;
  return `suite-${Date.now().toString(36)}-${seq}`;
}

export type SuiteApplicationService = {
  create(actor: SuiteActor, input: CreateSuiteInput, now: string): Promise<SuiteNode>;
  update(
    actor: SuiteActor,
    suiteId: string,
    patch: Partial<CreateSuiteInput> & {
      readonly ownerId?: string;
      readonly tags?: readonly string[];
    },
    now: string,
  ): Promise<SuiteNode>;
  transition(
    actor: SuiteActor,
    suiteId: string,
    to: SuiteLifecycleState,
    now: string,
  ): Promise<SuiteNode>;
  clone(
    actor: SuiteActor,
    suiteId: string,
    now: string,
    options?: { readonly name?: string },
  ): Promise<SuiteNode>;
  version(actor: SuiteActor, suiteId: string, now: string): Promise<SuiteNode>;
  move(
    actor: SuiteActor,
    suiteId: string,
    input: { readonly parentSuiteId?: string | null; readonly folderPath?: string },
    now: string,
  ): Promise<SuiteNode>;
  favourite(
    actor: SuiteActor,
    suiteId: string,
    on: boolean,
    now: string,
  ): Promise<SuiteNode>;
  pin(actor: SuiteActor, suiteId: string, on: boolean, now: string): Promise<SuiteNode>;
  get(actor: SuiteActor, suiteId: string): Promise<SuiteAggregate>;
  list(
    actor: SuiteActor,
    filter: Omit<SuiteListFilter, "tenantId">,
  ): Promise<readonly SuiteNode[]>;
  tree(actor: SuiteActor, projectId?: string): Promise<readonly SuiteNode[]>;
  history(actor: SuiteActor, suiteId: string): Promise<readonly SuiteHistoryEntry[]>;
  drainEvents(): readonly SuiteDomainEvent[];
};

export function createSuiteApplicationService(deps: {
  readonly repository: SuiteRepository;
  readonly publisher?: SuiteEventPublisher;
  /** When set (postgres), mutators run inside one DB transaction with outbox. */
  readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
}): SuiteApplicationService {
  const pending: SuiteDomainEvent[] = [];
  const run =
    deps.runInTransaction ?? (async <T>(fn: () => Promise<T>): Promise<T> => fn());

  async function emit(
    eventId: QepSuiteEventId,
    suite: SuiteNode,
    actorId: string,
    now: string,
    extra?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const event = buildSuiteDomainEvent({
      eventId,
      suite,
      actorId,
      correlationId: `corr-${suite.suiteId}-${suite.revision}`,
      timestamp: now,
      ...(extra ? { extra } : {}),
    });
    pending.push(event);
    await deps.publisher?.publish(event);
  }

  async function load(tenantId: string, suiteId: string): Promise<SuiteAggregate> {
    const agg = await deps.repository.get(tenantId, suiteId);
    if (!agg || agg.suite.status === "deleted") {
      throw new Error(`suite.not_found:${suiteId}`);
    }
    return agg;
  }

  const service: SuiteApplicationService = {
    drainEvents() {
      return [...pending];
    },

    async create(actor, input, now) {
      requirePermission(actor, "qep.suites.create");
      if (!input.name.trim()) throw new Error("suite.validation.name_required");

      if (input.parentSuiteId) {
        await load(actor.tenantId, input.parentSuiteId);
      }

      const suiteId = input.suiteId ?? nextId();
      const suite: SuiteNode = {
        suiteId,
        tenantId: actor.tenantId,
        ...(input.projectId ? { projectId: input.projectId } : {}),
        ...(input.parentSuiteId ? { parentSuiteId: input.parentSuiteId } : {}),
        folderPath: input.folderPath ?? "/",
        name: input.name.trim(),
        description: input.description?.trim() ?? "",
        ownerId: actor.userId,
        kind: input.kind ?? "standard",
        status: "draft",
        version: 1,
        priority: input.priority ?? "normal",
        ...(input.category ? { category: input.category } : {}),
        tags: input.tags ?? [],
        ...(input.risk ? { risk: input.risk } : {}),
        ...(input.businessArea ? { businessArea: input.businessArea } : {}),
        ...(input.application ? { application: input.application } : {}),
        ...(input.component ? { component: input.component } : {}),
        ...(input.classification ? { classification: input.classification } : {}),
        favouriteUserIds: [],
        pinnedUserIds: [],
        createdAt: now,
        updatedAt: now,
        customMetadata: input.customMetadata ?? {},
        revision: 1,
      };

      await deps.repository.save({
        suite,
        history: [history(actor.userId, now, "created", undefined, "draft")],
      });
      await emit(QEP_SUITE_EVENTS.created, suite, actor.userId, now);
      return suite;
    },

    async update(actor, suiteId, patch, now) {
      requirePermission(actor, "qep.suites.update");
      const agg = await load(actor.tenantId, suiteId);
      const s = agg.suite;
      const next: SuiteNode = {
        ...s,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() }
          : {}),
        ...(patch.ownerId !== undefined ? { ownerId: patch.ownerId } : {}),
        ...(patch.projectId !== undefined ? { projectId: patch.projectId } : {}),
        ...(patch.kind !== undefined ? { kind: patch.kind } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.risk !== undefined ? { risk: patch.risk } : {}),
        ...(patch.businessArea !== undefined
          ? { businessArea: patch.businessArea }
          : {}),
        ...(patch.application !== undefined ? { application: patch.application } : {}),
        ...(patch.component !== undefined ? { component: patch.component } : {}),
        ...(patch.classification !== undefined
          ? { classification: patch.classification }
          : {}),
        ...(patch.folderPath !== undefined ? { folderPath: patch.folderPath } : {}),
        ...(patch.customMetadata !== undefined
          ? { customMetadata: patch.customMetadata }
          : {}),
        updatedAt: now,
        revision: s.revision + 1,
      };
      await deps.repository.save({
        suite: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "updated", s.status, s.status),
        ],
      });
      await emit(QEP_SUITE_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async transition(actor, suiteId, to, now) {
      requirePermission(actor, "qep.suites.lifecycle");
      const agg = await load(actor.tenantId, suiteId);
      const from = agg.suite.status;
      assertTransition(from, to);

      const next: SuiteNode = {
        ...agg.suite,
        status: to,
        updatedAt: now,
        revision: agg.suite.revision + 1,
        ...(to === "published" ? { publishedAt: now } : {}),
        ...(to === "archived" ? { archivedAt: now } : {}),
        ...(to === "retired" ? { retiredAt: now } : {}),
        ...(to === "deleted" ? { deletedAt: now } : {}),
        ...(to === "draft" && from === "archived" ? { archivedAt: undefined } : {}),
      };

      await deps.repository.save({
        suite: next,
        history: [...agg.history, history(actor.userId, now, "lifecycle", from, to)],
      });

      let eventId: QepSuiteEventId = QEP_SUITE_EVENTS.lifecycleChanged;
      if (to === "published") eventId = QEP_SUITE_EVENTS.published;
      else if (to === "archived") eventId = QEP_SUITE_EVENTS.archived;
      else if (to === "retired") eventId = QEP_SUITE_EVENTS.retired;
      else if (to === "deleted") eventId = QEP_SUITE_EVENTS.deleted;
      else if (to === "draft" && from === "archived") {
        eventId = QEP_SUITE_EVENTS.restored;
      }

      await emit(eventId, next, actor.userId, now, { fromStatus: from, toStatus: to });
      return next;
    },

    async clone(actor, suiteId, now, options = {}) {
      requirePermission(actor, "qep.suites.create");
      const source = await load(actor.tenantId, suiteId);
      return this.create(
        actor,
        {
          name: options.name ?? `${source.suite.name} (Copy)`,
          description: source.suite.description,
          ...(source.suite.projectId ? { projectId: source.suite.projectId } : {}),
          ...(source.suite.parentSuiteId
            ? { parentSuiteId: source.suite.parentSuiteId }
            : {}),
          folderPath: source.suite.folderPath,
          kind: source.suite.kind,
          priority: source.suite.priority,
          ...(source.suite.category ? { category: source.suite.category } : {}),
          tags: [...source.suite.tags],
          customMetadata: { ...source.suite.customMetadata, clonedFrom: suiteId },
        },
        now,
      );
    },

    async version(actor, suiteId, now) {
      requirePermission(actor, "qep.suites.update");
      const agg = await load(actor.tenantId, suiteId);
      const next: SuiteNode = {
        ...agg.suite,
        version: agg.suite.version + 1,
        updatedAt: now,
        revision: agg.suite.revision + 1,
      };
      await deps.repository.save({
        suite: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "versioned",
            agg.suite.status,
            agg.suite.status,
            `v${next.version}`,
          ),
        ],
      });
      await emit(QEP_SUITE_EVENTS.versioned, next, actor.userId, now);
      return next;
    },

    async move(actor, suiteId, input, now) {
      requirePermission(actor, "qep.suites.update");
      const agg = await load(actor.tenantId, suiteId);
      if (input.parentSuiteId) {
        if (input.parentSuiteId === suiteId) {
          throw new Error("suite.validation.self_parent");
        }
        await load(actor.tenantId, input.parentSuiteId);
      }
      const next: SuiteNode = {
        ...agg.suite,
        ...(input.parentSuiteId === null
          ? { parentSuiteId: undefined }
          : input.parentSuiteId !== undefined
            ? { parentSuiteId: input.parentSuiteId }
            : {}),
        ...(input.folderPath !== undefined ? { folderPath: input.folderPath } : {}),
        updatedAt: now,
        revision: agg.suite.revision + 1,
      };
      await deps.repository.save({
        suite: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "moved", agg.suite.status, agg.suite.status),
        ],
      });
      await emit(QEP_SUITE_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async favourite(actor, suiteId, on, now) {
      requirePermission(actor, "qep.suites.read");
      const agg = await load(actor.tenantId, suiteId);
      const set = new Set(agg.suite.favouriteUserIds);
      if (on) set.add(actor.userId);
      else set.delete(actor.userId);
      const next: SuiteNode = {
        ...agg.suite,
        favouriteUserIds: [...set].sort(),
        updatedAt: now,
        revision: agg.suite.revision + 1,
      };
      await deps.repository.save({ suite: next, history: agg.history });
      return next;
    },

    async pin(actor, suiteId, on, now) {
      requirePermission(actor, "qep.suites.read");
      const agg = await load(actor.tenantId, suiteId);
      const set = new Set(agg.suite.pinnedUserIds);
      if (on) set.add(actor.userId);
      else set.delete(actor.userId);
      const next: SuiteNode = {
        ...agg.suite,
        pinnedUserIds: [...set].sort(),
        updatedAt: now,
        revision: agg.suite.revision + 1,
      };
      await deps.repository.save({ suite: next, history: agg.history });
      return next;
    },

    async get(actor, suiteId) {
      requirePermission(actor, "qep.suites.read");
      return load(actor.tenantId, suiteId);
    },

    async list(actor, filter) {
      requirePermission(actor, "qep.suites.read");
      return deps.repository.list({ ...filter, tenantId: actor.tenantId });
    },

    async tree(actor, projectId) {
      requirePermission(actor, "qep.suites.read");
      return deps.repository.list({
        tenantId: actor.tenantId,
        ...(projectId ? { projectId } : {}),
        sortBy: "name",
        sortDirection: "asc",
      });
    },

    async history(actor, suiteId) {
      requirePermission(actor, "qep.suites.read");
      const agg = await load(actor.tenantId, suiteId);
      return agg.history;
    },
  };

  const mutating = new Set([
    "create",
    "update",
    "transition",
    "clone",
    "version",
    "move",
    "favourite",
    "pin",
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
