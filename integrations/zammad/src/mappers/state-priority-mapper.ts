import { createBidirectionalEnumMapper, createEnumMapper } from "@apzhub/integration-sdk/mapping";

import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "../models/canonical";

const statusMapper = createEnumMapper<SupportTicketStatus>({
  map: {
    new: "new",
    open: "open",
    "pending reminder": "pending",
    "pending close": "pending",
    pending: "pending",
    closed: "closed",
    merged: "merged",
  },
  unknownPolicy: "fallback",
  fallback: "unknown",
});

const statusToZammad = createBidirectionalEnumMapper<SupportTicketStatus>({
  toCanonical: {
    new: "new",
    open: "open",
    pending: "pending",
    closed: "closed",
    merged: "merged",
    unknown: "unknown",
  },
  toProvider: {
    new: "new",
    open: "open",
    pending: "pending reminder",
    closed: "closed",
    merged: "merged",
    unknown: "open",
  },
  unknownPolicy: "fallback",
  fallback: "unknown",
});

const priorityMapper = createEnumMapper<SupportTicketPriority>({
  map: {
    "1 low": "low",
    low: "low",
    "2 normal": "normal",
    normal: "normal",
    "3 high": "high",
    high: "high",
    "4 urgent": "urgent",
    urgent: "urgent",
  },
  unknownPolicy: "fallback",
  fallback: "normal",
});

const priorityToZammad = createBidirectionalEnumMapper<SupportTicketPriority>({
  toCanonical: {
    low: "low",
    normal: "normal",
    high: "high",
    urgent: "urgent",
  },
  toProvider: {
    low: "1 low",
    normal: "2 normal",
    high: "3 high",
    urgent: "4 urgent",
  },
  unknownPolicy: "fallback",
  fallback: "normal",
});

export function mapZammadStateToStatus(
  state: string | undefined,
  stateId?: number,
): SupportTicketStatus {
  if (state) {
    if (statusMapper.has(state)) {
      return statusMapper.map(state);
    }
  }

  // Default Zammad CE state_id catalogue (1=new, 2=open, 3=pending reminder, 4=closed)
  if (stateId === 1) return "new";
  if (stateId === 2) return "open";
  if (stateId === 3) return "pending";
  if (stateId === 4) return "closed";
  if (stateId === 5) return "merged";

  return "unknown";
}

export function mapStatusToZammadState(status: SupportTicketStatus): string {
  return statusToZammad.toProvider(status);
}

export function mapZammadPriorityToCanonical(
  priority: string | undefined,
  priorityId?: number,
): SupportTicketPriority {
  if (priority) {
    if (priorityMapper.has(priority)) {
      return priorityMapper.map(priority);
    }
  }

  if (priorityId === 1) return "low";
  if (priorityId === 2) return "normal";
  if (priorityId === 3) return "high";
  if (priorityId === 4) return "urgent";

  return "normal";
}

export function mapPriorityToZammad(priority: SupportTicketPriority): string {
  return priorityToZammad.toProvider(priority);
}
