import { QEP_SUITE_EVENT_VERSION } from "../version";
import type { SuiteNode } from "../domain/types";

export const QEP_SUITE_EVENTS = {
  created: "qep.suite.created",
  updated: "qep.suite.updated",
  published: "qep.suite.published",
  archived: "qep.suite.archived",
  versioned: "qep.suite.versioned",
  deleted: "qep.suite.deleted",
  restored: "qep.suite.restored",
  retired: "qep.suite.retired",
  lifecycleChanged: "qep.suite.lifecycle_changed",
} as const;

export type QepSuiteEventId = (typeof QEP_SUITE_EVENTS)[keyof typeof QEP_SUITE_EVENTS];

export type SuiteDomainEvent = {
  readonly eventId: QepSuiteEventId;
  readonly eventVersion: string;
  readonly suiteId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export function suiteToEventPayload(
  suite: SuiteNode,
): Readonly<Record<string, unknown>> {
  return {
    suiteId: suite.suiteId,
    tenantId: suite.tenantId,
    ...(suite.projectId ? { projectId: suite.projectId } : {}),
    name: suite.name,
    description: suite.description,
    ownerId: suite.ownerId,
    status: suite.status,
    version: suite.version,
    kind: suite.kind,
    tags: suite.tags,
    priority: suite.priority,
    ...(suite.category ? { category: suite.category } : {}),
    ...(suite.parentSuiteId ? { parentSuiteId: suite.parentSuiteId } : {}),
    folderPath: suite.folderPath,
    revision: suite.revision,
  };
}

export function buildSuiteDomainEvent(input: {
  readonly eventId: QepSuiteEventId;
  readonly suite: SuiteNode;
  readonly actorId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly extra?: Readonly<Record<string, unknown>>;
}): SuiteDomainEvent {
  return {
    eventId: input.eventId,
    eventVersion: QEP_SUITE_EVENT_VERSION,
    suiteId: input.suite.suiteId,
    tenantId: input.suite.tenantId,
    ...(input.suite.projectId ? { projectId: input.suite.projectId } : {}),
    correlationId: input.correlationId,
    timestamp: input.timestamp,
    actorId: input.actorId,
    payload: {
      ...suiteToEventPayload(input.suite),
      ...(input.extra ?? {}),
    },
  };
}
