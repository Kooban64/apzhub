import type { EventEnvelope } from "../event/event-envelope";
import type { NotificationItem } from "./notification-item";

export type NotificationMappingIssueCode =
  "NO_MATCH" | "TEMPLATE_ERROR" | "ROUTE_SKIPPED";

export interface NotificationMappingIssue {
  readonly code: NotificationMappingIssueCode;
  readonly routeId?: string;
  readonly message: string;
}

export interface NotificationMapperResult {
  readonly ok: boolean;
  readonly createdCount: number;
  readonly matchedRouteCount: number;
  readonly items: readonly NotificationItem[];
  readonly issues: readonly NotificationMappingIssue[];
  readonly errorCode?: "NOT_IMPLEMENTED" | "MAPPING_FAILED";
}

/** Maps platform events to notification items — never publishes events or delivers notifications. */
export interface NotificationMapper {
  map(envelope: EventEnvelope): NotificationMapperResult;
  getDiagnostics(): import("../types/diagnostics").NotificationMapperDiagnostics;
}
