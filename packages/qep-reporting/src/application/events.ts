import { QEP_REPORTING_EVENT_VERSION } from "../version";
import type { SavedReport } from "../domain/types";

export const QEP_REPORTING_EVENTS = {
  reportGenerated: "qep.reporting.report_generated",
  dashboardViewed: "qep.reporting.dashboard_viewed",
  savedReportUpdated: "qep.reporting.saved_report_updated",
  savedReportCreated: "qep.reporting.saved_report_created",
} as const;

export type QepReportingEventId =
  (typeof QEP_REPORTING_EVENTS)[keyof typeof QEP_REPORTING_EVENTS];

export type ReportingDomainEvent = {
  readonly eventId: QepReportingEventId;
  readonly eventVersion: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export function buildReportingDomainEvent(input: {
  readonly eventId: QepReportingEventId;
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly projectId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}): ReportingDomainEvent {
  return {
    eventId: input.eventId,
    eventVersion: QEP_REPORTING_EVENT_VERSION,
    tenantId: input.tenantId,
    ...(input.projectId ? { projectId: input.projectId } : {}),
    correlationId: input.correlationId,
    timestamp: input.timestamp,
    actorId: input.actorId,
    payload: input.payload,
  };
}

export function savedReportPayload(
  report: SavedReport,
): Readonly<Record<string, unknown>> {
  return {
    reportId: report.reportId,
    name: report.name,
    templateId: report.templateId,
    ownerId: report.ownerId,
    tenantId: report.tenantId,
    ...(report.projectId ? { projectId: report.projectId } : {}),
    revision: report.revision,
  };
}
