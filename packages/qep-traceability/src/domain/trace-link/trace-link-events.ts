import { randomUUID } from "node:crypto";

import type { TraceAuthority } from "./trace-authority";
import type { TraceConfidence } from "./trace-confidence";
import type { TraceEndpointReference } from "./trace-endpoint";
import type { TraceId } from "./trace-id";
import type { TraceLifecycleState } from "./trace-lifecycle-state";
import type { TraceOrigin } from "./trace-origin";
import type { TraceScope } from "./trace-scope";
import type { TraceType } from "./trace-type";

export type TraceEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly traceId: TraceId;
};

export type TraceCreated = TraceEventBase & {
  readonly type: "qep.trace_link.created";
  readonly traceType: TraceType;
  readonly lifecycleState: TraceLifecycleState;
};

export type TraceValidated = TraceEventBase & {
  readonly type: "qep.trace_link.validated";
};

export type TraceApproved = TraceEventBase & {
  readonly type: "qep.trace_link.approved";
};

export type TraceRetired = TraceEventBase & {
  readonly type: "qep.trace_link.retired";
};

export type TraceSuperseded = TraceEventBase & {
  readonly type: "qep.trace_link.superseded";
  readonly successorTraceId: TraceId;
};

export type TraceOriginChanged = TraceEventBase & {
  readonly type: "qep.trace_link.origin_changed";
  readonly origin: TraceOrigin;
};

export type TraceConfidenceChanged = TraceEventBase & {
  readonly type: "qep.trace_link.confidence_changed";
  readonly confidence: TraceConfidence;
};

export type TraceAuthorityChanged = TraceEventBase & {
  readonly type: "qep.trace_link.authority_changed";
  readonly authority: TraceAuthority;
};

export type TraceScopeChanged = TraceEventBase & {
  readonly type: "qep.trace_link.scope_changed";
  readonly scope: TraceScope;
};

export type TraceEndpointChanged = TraceEventBase & {
  readonly type: "qep.trace_link.endpoint_changed";
  readonly role: "source" | "target";
  readonly endpoint: TraceEndpointReference;
};

export type TraceLinkDomainEvent =
  | TraceCreated
  | TraceValidated
  | TraceApproved
  | TraceRetired
  | TraceSuperseded
  | TraceOriginChanged
  | TraceConfidenceChanged
  | TraceAuthorityChanged
  | TraceScopeChanged
  | TraceEndpointChanged;

export const TRACE_DOMAIN_EVENT_TYPES = [
  "qep.trace_link.created",
  "qep.trace_link.validated",
  "qep.trace_link.approved",
  "qep.trace_link.retired",
  "qep.trace_link.superseded",
  "qep.trace_link.origin_changed",
  "qep.trace_link.confidence_changed",
  "qep.trace_link.authority_changed",
  "qep.trace_link.scope_changed",
  "qep.trace_link.endpoint_changed",
] as const;

type TraceEventInput = {
  readonly tenantId: string;
  readonly traceId: TraceId;
  readonly correlationId: string;
  readonly eventId?: string;
  readonly occurredAt?: string;
};

function baseEvent(input: TraceEventInput): TraceEventBase {
  return {
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    tenantId: input.tenantId,
    traceId: input.traceId,
  };
}

export function buildTraceCreatedEvent(
  input: TraceEventInput & {
    readonly traceType: TraceType;
    readonly lifecycleState: TraceLifecycleState;
  },
): TraceCreated {
  return {
    ...baseEvent(input),
    type: "qep.trace_link.created",
    traceType: input.traceType,
    lifecycleState: input.lifecycleState,
  };
}

export function buildTraceValidatedEvent(input: TraceEventInput): TraceValidated {
  return { ...baseEvent(input), type: "qep.trace_link.validated" };
}

export function buildTraceApprovedEvent(input: TraceEventInput): TraceApproved {
  return { ...baseEvent(input), type: "qep.trace_link.approved" };
}

export function buildTraceRetiredEvent(input: TraceEventInput): TraceRetired {
  return { ...baseEvent(input), type: "qep.trace_link.retired" };
}

export function buildTraceSupersededEvent(
  input: TraceEventInput & { readonly successorTraceId: TraceId },
): TraceSuperseded {
  return {
    ...baseEvent(input),
    type: "qep.trace_link.superseded",
    successorTraceId: input.successorTraceId,
  };
}

export function buildTraceOriginChangedEvent(
  input: TraceEventInput & { readonly origin: TraceOrigin },
): TraceOriginChanged {
  return { ...baseEvent(input), type: "qep.trace_link.origin_changed", origin: input.origin };
}

export function buildTraceConfidenceChangedEvent(
  input: TraceEventInput & { readonly confidence: TraceConfidence },
): TraceConfidenceChanged {
  return {
    ...baseEvent(input),
    type: "qep.trace_link.confidence_changed",
    confidence: input.confidence,
  };
}

export function buildTraceAuthorityChangedEvent(
  input: TraceEventInput & { readonly authority: TraceAuthority },
): TraceAuthorityChanged {
  return {
    ...baseEvent(input),
    type: "qep.trace_link.authority_changed",
    authority: input.authority,
  };
}

export function buildTraceScopeChangedEvent(
  input: TraceEventInput & { readonly scope: TraceScope },
): TraceScopeChanged {
  return { ...baseEvent(input), type: "qep.trace_link.scope_changed", scope: input.scope };
}

export function buildTraceEndpointChangedEvent(
  input: TraceEventInput & {
    readonly role: "source" | "target";
    readonly endpoint: TraceEndpointReference;
  },
): TraceEndpointChanged {
  return {
    ...baseEvent(input),
    type: "qep.trace_link.endpoint_changed",
    role: input.role,
    endpoint: input.endpoint,
  };
}
