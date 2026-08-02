import { QEP_DEFECT_EVENT_VERSION } from "../version";
import type { DefectNode } from "../domain/types";

export const QEP_DEFECT_EVENTS = {
  created: "qep.defect.created",
  updated: "qep.defect.updated",
  assigned: "qep.defect.assigned",
  fixed: "qep.defect.fixed",
  verified: "qep.defect.verified",
  closed: "qep.defect.closed",
  reopened: "qep.defect.reopened",
  statusChanged: "qep.defect.status_changed",
} as const;

export type QepDefectEventId =
  (typeof QEP_DEFECT_EVENTS)[keyof typeof QEP_DEFECT_EVENTS];

export type DefectDomainEvent = {
  readonly eventId: QepDefectEventId;
  readonly eventVersion: string;
  readonly defectId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export function defectToEventPayload(
  defect: DefectNode,
): Readonly<Record<string, unknown>> {
  return {
    defectId: defect.defectId,
    tenantId: defect.tenantId,
    ...(defect.projectId ? { projectId: defect.projectId } : {}),
    title: defect.title,
    description: defect.description,
    status: defect.status,
    severity: defect.severity,
    priority: defect.priority,
    reporterId: defect.reporterId,
    ...(defect.assigneeId ? { assigneeId: defect.assigneeId } : {}),
    tags: defect.tags,
    ...(defect.executionOrigin
      ? {
          sessionId: defect.executionOrigin.sessionId,
          stepId: defect.executionOrigin.stepId,
          suiteId: defect.executionOrigin.suiteId,
        }
      : {}),
    evidenceIds: defect.evidenceRefs.map((e) => e.evidenceId),
    revision: defect.revision,
  };
}

export function buildDefectDomainEvent(input: {
  readonly eventId: QepDefectEventId;
  readonly defect: DefectNode;
  readonly actorId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly extra?: Readonly<Record<string, unknown>>;
}): DefectDomainEvent {
  return {
    eventId: input.eventId,
    eventVersion: QEP_DEFECT_EVENT_VERSION,
    defectId: input.defect.defectId,
    tenantId: input.defect.tenantId,
    ...(input.defect.projectId ? { projectId: input.defect.projectId } : {}),
    correlationId: input.correlationId,
    timestamp: input.timestamp,
    actorId: input.actorId,
    payload: {
      ...defectToEventPayload(input.defect),
      ...(input.extra ?? {}),
    },
  };
}
