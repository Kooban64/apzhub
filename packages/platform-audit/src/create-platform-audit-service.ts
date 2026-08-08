/**
 * APE-Audit — Platform Audit Service facade.
 * Domain tables remain SoR; this engine merges normalized events for cross-product query.
 */

import type {
  PlatformAuditEvent,
  PlatformAuditListQuery,
  PlatformAuditListResult,
  PlatformAuditSourceProvider,
} from "./types";

export type PlatformAuditService = {
  readonly engineId: "ape-audit";
  list(query: PlatformAuditListQuery): Promise<PlatformAuditListResult>;
  appendForTests?(event: PlatformAuditEvent): void;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function withinRange(iso: string, from?: string, to?: string): boolean {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

export function createPlatformAuditService(input: {
  readonly providers?: readonly PlatformAuditSourceProvider[];
}): PlatformAuditService {
  const providers = [...(input.providers ?? [])];
  const memory: PlatformAuditEvent[] = [];

  return {
    engineId: "ape-audit",
    appendForTests(event) {
      memory.push(event);
    },
    async list(query) {
      const limit = Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
      const batches = await Promise.all(
        providers.map(async (provider) => {
          if (query.source && provider.source !== query.source) return [];
          return provider.list(query);
        }),
      );
      const merged = [...memory, ...batches.flat()].filter((event) => {
        if (event.tenantId !== query.tenantId) return false;
        if (query.correlationId && event.correlationId !== query.correlationId) {
          return false;
        }
        if (query.product && event.product !== query.product) return false;
        if (query.source && event.source !== query.source) return false;
        return withinRange(event.occurredAt, query.from, query.to);
      });
      merged.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
      const truncated = merged.length > limit;
      return {
        items: merged.slice(0, limit),
        truncated,
      };
    },
  };
}

/** In-memory provider for isolation tests and non-prod demos. */
export function createMemoryAuditSourceProvider(
  source: PlatformAuditSourceProvider["source"] = "memory",
  seed: readonly PlatformAuditEvent[] = [],
): PlatformAuditSourceProvider {
  const items = [...seed];
  return {
    source,
    async list(query) {
      return items.filter((event) => event.tenantId === query.tenantId);
    },
  };
}
