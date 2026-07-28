import type { ExecutionDomainEvent } from "../../domain/test-execution/events";
import type { ExecutionHistoryEntry } from "../../domain/test-execution/history";
import type { ResolvedManifestInput } from "../../domain/test-execution/manifest";
import type { TestExecution } from "../../domain/test-execution/test-execution";
import {
  ExecutionConcurrencyError,
  ExecutionForbiddenError,
} from "../../shared/errors";
import type { ExecutionRequestContext } from "../context";
import { EXECUTION_PERMISSIONS } from "../permissions";
import type {
  AuditPort,
  ClockPort,
  EventOutboxPort,
  EvidenceAccessPort,
  ExecutionAuditEntry,
  ExecutionHistoryStore,
  IdPort,
  PermissionPort,
  SearchPublicationPort,
  SourceResolutionPort,
  StoredTestExecution,
  TestExecutionListQuery,
  TestExecutionRepository,
} from "../ports";

function asStored(execution: TestExecution): StoredTestExecution {
  return { ...execution, uncommittedEvents: [] };
}

export function createInMemoryTestExecutionRepository(): TestExecutionRepository & {
  readonly store: Map<string, StoredTestExecution>;
} {
  const store = new Map<string, StoredTestExecution>();
  const key = (tenantId: string, id: string) => `${tenantId}:${id}`;

  return {
    portId: "TestExecutionRepository",
    store,
    async create(execution) {
      const stored = asStored(execution);
      store.set(key(execution.tenantId, execution.id), stored);
      return stored;
    },
    async get(tenantId, id) {
      return store.get(key(tenantId, id)) ?? null;
    },
    async getByNumber(tenantId, number) {
      for (const item of store.values()) {
        if (item.tenantId === tenantId && item.executionNumber === number) {
          return item;
        }
      }
      return null;
    },
    async save(execution, expectedRevision) {
      const current = store.get(key(execution.tenantId, execution.id));
      if (!current) {
        throw new ExecutionConcurrencyError(execution.id, expectedRevision, -1);
      }
      if (current.revision !== expectedRevision) {
        throw new ExecutionConcurrencyError(
          execution.id,
          expectedRevision,
          current.revision,
        );
      }
      const stored = asStored(execution);
      store.set(key(execution.tenantId, execution.id), stored);
      return stored;
    },
    async list(tenantId, query: TestExecutionListQuery = {}) {
      let items = [...store.values()].filter((item) => item.tenantId === tenantId);
      if (query.status) {
        const statuses = Array.isArray(query.status) ? query.status : [query.status];
        items = items.filter((item) => statuses.includes(item.status));
      }
      if (query.assigneeId) {
        items = items.filter(
          (item) =>
            item.assignment.executorId === query.assigneeId ||
            item.assignment.ownerId === query.assigneeId,
        );
      }
      if (query.reviewerId) {
        items = items.filter((item) => item.assignment.reviewerId === query.reviewerId);
      }
      if (query.ownerId) {
        items = items.filter((item) => item.assignment.ownerId === query.ownerId);
      }
      if (query.planId) {
        items = items.filter((item) => item.sourceRefs.planRef?.id === query.planId);
      }
      if (query.specId) {
        items = items.filter((item) => item.sourceRefs.specRef?.id === query.specId);
      }
      if (query.projectId) {
        items = items.filter((item) => item.projectId === query.projectId);
      }
      if (query.workspaceId) {
        items = items.filter((item) => item.workspaceId === query.workspaceId);
      }
      if (query.reviewQueue) {
        items = items.filter((item) => item.status === "submitted_for_review");
      }
      const offset = query.offset ?? 0;
      const limit = query.limit ?? items.length;
      return items.slice(offset, offset + limit);
    },
    async findByIngestionKey(tenantId, sourceSystemId, idempotencyKey) {
      for (const item of store.values()) {
        if (item.tenantId !== tenantId) {
          continue;
        }
        if (
          item.externalSubmissions.some(
            (submission) =>
              submission.sourceSystemId === sourceSystemId &&
              submission.idempotencyKey === idempotencyKey,
          )
        ) {
          return item;
        }
      }
      return null;
    },
  };
}

export function createInMemoryHistoryStore(): ExecutionHistoryStore & {
  readonly entries: ExecutionHistoryEntry[];
} {
  const entries: ExecutionHistoryEntry[] = [];
  const byExecution = new Map<string, ExecutionHistoryEntry[]>();
  return {
    portId: "ExecutionHistoryStore",
    entries,
    async append(tenantId, executionId, next) {
      const key = `${tenantId}:${executionId}`;
      const current = byExecution.get(key) ?? [];
      const merged = [...current, ...next];
      byExecution.set(key, merged);
      entries.push(...next);
    },
    async list(tenantId, executionId) {
      return byExecution.get(`${tenantId}:${executionId}`) ?? [];
    },
  };
}

export function createStaticSourceResolutionPort(
  resolved: ResolvedManifestInput = {
    steps: [
      {
        order: 1,
        instruction: "Open application",
        expectedResult: "Application loads",
      },
      {
        order: 2,
        instruction: "Verify dashboard",
        expectedResult: "Dashboard visible",
      },
    ],
  },
): SourceResolutionPort {
  return {
    portId: "SourceResolutionPort",
    async resolveForSeal() {
      return resolved;
    },
  };
}

export function createPermissionPort(): PermissionPort {
  return {
    portId: "PermissionPort",
    assertAny(ctx, requiredOneOf) {
      const granted = ctx.permissions;
      if (!granted || granted.length === 0) {
        return;
      }
      if (
        granted.includes(EXECUTION_PERMISSIONS.WILDCARD) ||
        granted.includes(EXECUTION_PERMISSIONS.ADMIN)
      ) {
        return;
      }
      if (requiredOneOf.some((permission) => granted.includes(permission))) {
        return;
      }
      throw new ExecutionForbiddenError(
        `Missing permission: ${requiredOneOf[0] ?? "unknown"}`,
        { requiredOneOf },
      );
    },
    has(ctx, permission) {
      const granted = ctx.permissions;
      if (!granted || granted.length === 0) {
        return true;
      }
      return (
        granted.includes(permission) ||
        granted.includes(EXECUTION_PERMISSIONS.WILDCARD) ||
        granted.includes(EXECUTION_PERMISSIONS.ADMIN)
      );
    },
  };
}

export function createInMemoryAuditPort(): AuditPort & {
  readonly entries: ExecutionAuditEntry[];
} {
  const entries: ExecutionAuditEntry[] = [];
  return {
    portId: "AuditPort",
    entries,
    async append(entry) {
      entries.push(entry);
    },
  };
}

export function createInMemoryOutboxPort(): EventOutboxPort & {
  readonly events: ExecutionDomainEvent[];
} {
  const events: ExecutionDomainEvent[] = [];
  return {
    portId: "EventOutboxPort",
    events,
    async enqueue(next) {
      events.push(...next);
    },
  };
}

export function createNoopSearchPort(): SearchPublicationPort {
  return {
    portId: "SearchPublicationPort",
    async publish() {
      /* no-op for Application Wave */
    },
  };
}

export function createAllowEvidencePort(): EvidenceAccessPort {
  return {
    portId: "EvidenceAccessPort",
    async assertAccessible(_ctx: ExecutionRequestContext, _uri: string) {
      /* Application Wave: accessibility enforced in ENG-100D adapters */
    },
  };
}

export function createFixedClockPort(now = "2026-07-29T12:00:00.000Z"): ClockPort {
  return {
    portId: "ClockPort",
    now: () => now,
  };
}

export function createSequenceIdPort(prefix = "id"): IdPort {
  let counter = 0;
  return {
    portId: "IdPort",
    nextId(requestedPrefix) {
      counter += 1;
      return `${requestedPrefix ?? prefix}_${String(counter).padStart(4, "0")}`;
    },
  };
}
