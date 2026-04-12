import { randomUUID } from "node:crypto";

import { adminAuditEventSchema, type AdminAuditEvent } from "@/lib/admin/contracts/audit";
import type { AdminPrivilegedActionTrace } from "@/lib/admin/contracts/privileged-action-trace";
import type { AdminTraceDomain, AuditOutcome } from "@/lib/admin/contracts/admin-trace-domain";
import {
  adminPrivilegedActionTraceSchema,
  type PrivilegedActionVerb,
} from "@/lib/admin/contracts/privileged-action-trace";
import type { AdminHomeData } from "@/lib/admin/mock-admin-home-data";
import { getMockAdminHomeData, getMockPrivilegedActionTraces } from "@/lib/admin/mock-admin-home-data";
import { mergeAdapterHealthIntoStrip } from "@/lib/adapters/health/merge-adapter-health-strip";
import { adminHealthStripSchema } from "@/lib/admin/contracts/health";

let homeCache: AdminHomeData | null = null;
let privilegedCache: AdminPrivilegedActionTrace[] | null = null;

function cloneHome(): AdminHomeData {
  return structuredClone(getMockAdminHomeData());
}

/** Raw cached home (no adapter health merge) — internal + audit facade snapshot base. */
export function getControlPlaneHomeDataInternal(): AdminHomeData {
  if (!homeCache) {
    homeCache = cloneHome();
  }
  return homeCache;
}

/** Public read for APIs — merges live adapter health into the strip. */
export function getControlPlaneHomeDataForApi(): AdminHomeData {
  const raw = getControlPlaneHomeDataInternal();
  const health = adminHealthStripSchema.parse(mergeAdapterHealthIntoStrip(raw.health));
  return { ...raw, health };
}

/** @deprecated Use getControlPlaneHomeDataForApi — kept name for minimal churn in callers. */
export function getControlPlaneHomeData(): AdminHomeData {
  return getControlPlaneHomeDataForApi();
}

export function getPrivilegedTracesData(): AdminPrivilegedActionTrace[] {
  if (!privilegedCache) {
    privilegedCache = [...getMockPrivilegedActionTraces()];
  }
  return privilegedCache;
}

export function appendPrivilegedTrace(input: {
  actor: string;
  verb: PrivilegedActionVerb;
  target: string;
  domain: AdminTraceDomain;
  outcome: AuditOutcome;
  correlationId?: string;
  contextSummary?: string;
}): AdminPrivilegedActionTrace {
  const base = privilegedCache ?? [...getMockPrivilegedActionTraces()];
  const row = adminPrivilegedActionTraceSchema.parse({
    id: `priv-launch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    correlationId: input.correlationId?.trim() || randomUUID(),
    actor: input.actor,
    verb: input.verb,
    target: input.target,
    domain: input.domain,
    at: new Date().toISOString(),
    outcome: input.outcome,
    contextSummary: input.contextSummary,
  });
  privilegedCache = [row, ...base].slice(0, 150);
  return row;
}

/** Append-only audit row (in-memory until real backing store). */
export function appendControlPlaneAuditEvent(input: unknown, meta?: { correlationId?: string }): AdminAuditEvent {
  const ev = adminAuditEventSchema.parse(input);
  const correlationId = meta?.correlationId?.trim();
  const contextSummary =
    correlationId != null && correlationId.length > 0
      ? [ev.contextSummary, `[correlationId=${correlationId}]`].filter(Boolean).join(" ")
      : ev.contextSummary;
  const next = adminAuditEventSchema.parse({ ...ev, contextSummary });
  getControlPlaneHomeDataInternal().audit.events.push(next);
  return next;
}

/** Test helper: reset in-memory control plane to mock defaults. */
export function resetControlPlaneAdapterCache(): void {
  homeCache = null;
  privilegedCache = null;
}

/** Test helper: clear privileged rows only (keep home cache). */
export function resetPrivilegedTracesCacheForTests(): void {
  privilegedCache = null;
}
