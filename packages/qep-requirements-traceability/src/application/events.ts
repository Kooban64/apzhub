import { QEP_REQUIREMENT_EVENT_VERSION } from "../version";
import type { CoverageSnapshot, RequirementNode } from "../domain/types";

export const QEP_REQUIREMENT_EVENTS = {
  created: "qep.requirement.created",
  updated: "qep.requirement.updated",
  approved: "qep.requirement.approved",
  linked: "qep.requirement.linked",
  coverageUpdated: "qep.requirement.coverage_updated",
  traceabilityChanged: "qep.requirement.traceability_changed",
  statusChanged: "qep.requirement.status_changed",
} as const;

export type QepRequirementEventId =
  (typeof QEP_REQUIREMENT_EVENTS)[keyof typeof QEP_REQUIREMENT_EVENTS];

export type RequirementDomainEvent = {
  readonly eventId: QepRequirementEventId;
  readonly eventVersion: string;
  readonly requirementId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export function requirementToEventPayload(
  requirement: RequirementNode,
  coverage?: CoverageSnapshot,
): Readonly<Record<string, unknown>> {
  return {
    requirementId: requirement.requirementId,
    tenantId: requirement.tenantId,
    ...(requirement.projectId ? { projectId: requirement.projectId } : {}),
    title: requirement.title,
    description: requirement.description,
    status: requirement.status,
    category: requirement.category,
    priority: requirement.priority,
    criticality: requirement.criticality,
    risk: requirement.risk,
    ownerId: requirement.ownerId,
    tags: requirement.tags,
    suiteIds: requirement.suiteLinks.map((l) => l.suiteId),
    revision: requirement.revision,
    ...(coverage
      ? {
          overallCoverage: coverage.overallCoverage,
          verificationStatus: coverage.verificationStatus,
          uncovered: coverage.uncovered,
          highRiskGap: coverage.highRiskGap,
        }
      : {}),
  };
}

export function buildRequirementDomainEvent(input: {
  readonly eventId: QepRequirementEventId;
  readonly requirement: RequirementNode;
  readonly actorId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly coverage?: CoverageSnapshot;
  readonly extra?: Readonly<Record<string, unknown>>;
}): RequirementDomainEvent {
  return {
    eventId: input.eventId,
    eventVersion: QEP_REQUIREMENT_EVENT_VERSION,
    requirementId: input.requirement.requirementId,
    tenantId: input.requirement.tenantId,
    ...(input.requirement.projectId ? { projectId: input.requirement.projectId } : {}),
    correlationId: input.correlationId,
    timestamp: input.timestamp,
    actorId: input.actorId,
    payload: {
      ...requirementToEventPayload(input.requirement, input.coverage),
      ...(input.extra ?? {}),
    },
  };
}
