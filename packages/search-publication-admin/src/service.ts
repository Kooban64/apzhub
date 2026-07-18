/**
 * Publication administration service — visibility & controlled ops (APZSEARCH-017).
 * Uses Search Orchestrator public APIs only. Does not alter retry algorithms or lifecycle rules.
 */

import type {
  PublicationJournalEntry,
  PublicationStatus,
  SearchOrchestrationRuntime,
} from "@apzhub/search-orchestrator";
import { PUBLICATION_STATUSES } from "@apzhub/search-orchestrator";

import type { PublicationAdminAuditStore } from "./audit/port";
import { assertSearchPublicationPermission } from "./authz";
import { SearchPublicationAdminError, SearchPublicationNotFoundError } from "./errors";
import type { PublicationAdminMarkerStore } from "./markers/port";
import type {
  PublicationAdminActor,
  PublicationAdminDiagnostics,
  PublicationListQuery,
  PublicationListResult,
  PublicationProductSummary,
  PublicationQueueSummary,
  RetryResult,
} from "./types";
import { SEARCH_PUBLICATION_ADMIN_VERSION } from "./version";

const PRODUCT_IDS = [
  "projects",
  "support",
  "documents",
  "testing",
  "reporting",
] as const;

export type SearchPublicationAdminService = {
  listPublications(
    actor: PublicationAdminActor,
    query?: PublicationListQuery,
  ): Promise<PublicationListResult>;
  getPublication(
    actor: PublicationAdminActor,
    id: string,
  ): Promise<PublicationJournalEntry>;
  getQueueSummary(actor: PublicationAdminActor): Promise<PublicationQueueSummary>;
  getProductSummaries(
    actor: PublicationAdminActor,
  ): Promise<readonly PublicationProductSummary[]>;
  getDiagnostics(actor: PublicationAdminActor): Promise<PublicationAdminDiagnostics>;
  retryPublication(actor: PublicationAdminActor, id: string): Promise<RetryResult>;
  retryPublications(
    actor: PublicationAdminActor,
    ids: readonly string[],
  ): Promise<readonly RetryResult[]>;
  retryFailedBatch(
    actor: PublicationAdminActor,
    limit?: number,
  ): Promise<readonly RetryResult[]>;
  clearCompletedRetries(actor: PublicationAdminActor): Promise<{
    readonly cleared: number;
  }>;
  acknowledgeDeadLetter(
    actor: PublicationAdminActor,
    id: string,
    reason?: string,
  ): Promise<{ readonly ok: true }>;
  archiveDeadLetter(
    actor: PublicationAdminActor,
    id: string,
    reason?: string,
  ): Promise<{ readonly ok: true }>;
  retryDeadLetter(actor: PublicationAdminActor, id: string): Promise<RetryResult>;
  drainBatch(actor: PublicationAdminActor): Promise<{
    readonly processed: number;
    readonly published: number;
    readonly failed: number;
    readonly deadLetter: number;
  }>;
  listAudit(
    actor: PublicationAdminActor,
    limit?: number,
  ): Promise<Awaited<ReturnType<PublicationAdminAuditStore["list"]>>>;
};

export type CreateSearchPublicationAdminServiceOptions = {
  readonly runtime: SearchOrchestrationRuntime;
  readonly audit: PublicationAdminAuditStore;
  readonly markers: PublicationAdminMarkerStore;
  readonly compositionRegistered?: boolean;
  readonly id?: () => string;
  readonly now?: () => string;
};

async function loadAllEntries(
  runtime: SearchOrchestrationRuntime,
): Promise<PublicationJournalEntry[]> {
  const chunks = await Promise.all(
    PUBLICATION_STATUSES.map((status) => runtime.journal.listByStatus(status, 500)),
  );
  return chunks.flat();
}

function matchesQuery(
  entry: PublicationJournalEntry,
  filter: PublicationListQuery["filter"],
  markers: Map<string, { kind: string }>,
): boolean {
  if (!filter) return true;
  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    if (!statuses.includes(entry.status)) return false;
  }
  if (filter.productId && entry.productId !== filter.productId) return false;
  if (filter.entityType && entry.entityType !== filter.entityType) return false;
  if (filter.entityId && entry.entityId !== filter.entityId) return false;
  if (filter.operation && entry.operation !== filter.operation) return false;
  if (filter.correlationId && entry.correlationId !== filter.correlationId) {
    return false;
  }
  if (filter.q) {
    const q = filter.q.toLowerCase();
    const hay = [
      entry.id,
      entry.entityId,
      entry.entityType,
      entry.productId,
      entry.correlationId,
      entry.lastError ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const marker = markers.get(entry.id);
  if (marker?.kind === "archived" && !filter.includeArchived) return false;
  if (marker?.kind === "acknowledged" && !filter.includeAcknowledged) {
    if (entry.status === "dead-letter") return false;
  }
  return true;
}

function sortEntries(
  items: PublicationJournalEntry[],
  sortBy: NonNullable<PublicationListQuery["sortBy"]>,
  sortDir: "asc" | "desc",
): PublicationJournalEntry[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (av === bv) return a.createdAt.localeCompare(b.createdAt) * dir;
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * dir;
    }
    return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
  });
}

export function createSearchPublicationAdminService(
  options: CreateSearchPublicationAdminServiceOptions,
): SearchPublicationAdminService {
  const now = options.now ?? (() => new Date().toISOString());
  let seq = 0;
  const id =
    options.id ??
    (() => {
      seq += 1;
      return `padmin_${seq}`;
    });

  async function audit(
    actor: PublicationAdminActor,
    action: Parameters<PublicationAdminAuditStore["append"]>[0]["action"],
    partial?: { readonly publicationId?: string; readonly detail?: string },
  ) {
    await options.audit.append({
      id: id(),
      action,
      actorUserId: actor.userId,
      tenantId: actor.tenantId,
      publicationId: partial?.publicationId,
      detail: partial?.detail,
      correlationId: actor.correlationId,
      createdAt: now(),
    });
  }

  async function markerMap() {
    const list = await options.markers.list();
    return new Map(list.map((m) => [m.publicationId, m]));
  }

  async function retryOne(
    actor: PublicationAdminActor,
    entry: PublicationJournalEntry,
  ): Promise<RetryResult> {
    if (entry.status === "failed" || entry.status === "retrying") {
      if (entry.status === "failed") {
        await options.runtime.journal.updateStatus({
          id: entry.id,
          from: "failed",
          to: "retrying",
          now: now(),
          nextAttemptAt: now(),
          lastError: entry.lastError ?? null,
        });
      } else {
        await options.runtime.journal.updateStatus({
          id: entry.id,
          from: "retrying",
          to: "retrying",
          now: now(),
          nextAttemptAt: now(),
        });
      }
      return { publicationId: entry.id, ok: true, mode: "status" };
    }

    if (entry.status === "dead-letter") {
      let payload: unknown = {};
      try {
        payload = JSON.parse(entry.payloadJson) as unknown;
      } catch {
        payload = { entityId: entry.entityId };
      }
      const enqueued = await options.runtime.dispatcher.enqueue({
        tenantId: entry.tenantId,
        organisationId: entry.organisationId,
        entityId: entry.entityId,
        entityType: entry.entityType,
        productId: entry.productId,
        operation: entry.operation,
        payload,
        correlationId: actor.correlationId,
        actorUserId: actor.userId,
      });
      if (!enqueued.ok) {
        return {
          publicationId: entry.id,
          ok: false,
          message: enqueued.message,
        };
      }
      return {
        publicationId: entry.id,
        ok: true,
        mode: "reenqueue",
        newPublicationId: enqueued.entry.id,
      };
    }

    return {
      publicationId: entry.id,
      ok: false,
      message: `Cannot retry publication in status ${entry.status}`,
    };
  }

  return {
    async listPublications(actor, query = {}) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.read");
      const markers = await markerMap();
      const all = (await loadAllEntries(options.runtime)).filter(
        (e) => e.tenantId === actor.tenantId,
      );
      const filtered = all.filter((e) => matchesQuery(e, query.filter, markers));
      const sorted = sortEntries(
        filtered,
        query.sortBy ?? "createdAt",
        query.sortDir ?? "desc",
      );
      const offset = Math.max(0, query.offset ?? 0);
      const limit = Math.min(200, Math.max(1, query.limit ?? 50));
      const items = sorted.slice(offset, offset + limit);
      await audit(actor, "publication.list", {
        detail: `total=${filtered.length}`,
      });
      return { items, total: filtered.length, offset, limit };
    },

    async getPublication(actor, publicationId) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.read");
      const entry = await options.runtime.journal.findById(publicationId);
      if (!entry || entry.tenantId !== actor.tenantId) {
        throw new SearchPublicationNotFoundError(publicationId);
      }
      await audit(actor, "publication.get", { publicationId });
      return entry;
    },

    async getQueueSummary(actor) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.read");
      const diag = await options.runtime.orchestrator.diagnostics();
      const queued = (await options.runtime.journal.listByStatus("queued", 500)).filter(
        (e) => e.tenantId === actor.tenantId,
      );
      const oldest = [...queued].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      )[0];
      const all = (await loadAllEntries(options.runtime)).filter(
        (e) => e.tenantId === actor.tenantId,
      );
      const averageAttempts =
        all.length === 0
          ? 0
          : all.reduce((sum, e) => sum + e.attemptCount, 0) / all.length;
      return {
        queueDepth: queued.length,
        retryingCount: diag.retryingCount,
        failedCount: diag.failedCount,
        deadLetterCount: diag.deadLetterCount,
        publishedCount: diag.publishedCount,
        backlog: diag.backlog,
        throughputPublished: diag.throughputPublished,
        oldestQueuedAt: oldest?.createdAt,
        averageAttempts: Number(averageAttempts.toFixed(2)),
      };
    },

    async getProductSummaries(actor) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.read");
      const all = (await loadAllEntries(options.runtime)).filter(
        (e) => e.tenantId === actor.tenantId,
      );
      return PRODUCT_IDS.map((productId) => {
        const rows = all.filter((e) => e.productId === productId);
        const count = (status: PublicationStatus) =>
          rows.filter((e) => e.status === status).length;
        return {
          productId,
          queued: count("queued"),
          publishing: count("publishing"),
          published: count("published"),
          failed: count("failed"),
          retrying: count("retrying"),
          deadLetter: count("dead-letter"),
          total: rows.length,
        };
      });
    },

    async getDiagnostics(actor) {
      assertSearchPublicationPermission(
        actor.permissions,
        "search.publication.diagnostics",
      );
      const orchestrator = await options.runtime.orchestrator.diagnostics();
      const journalReady = true;
      const retryEngineReady = orchestrator.enabled;
      const bootstrapEnabled = orchestrator.enabled;
      const compositionRegistered = options.compositionRegistered ?? true;
      let publicationHealth: PublicationAdminDiagnostics["publicationHealth"] =
        "healthy";
      if (!bootstrapEnabled) publicationHealth = "unavailable";
      else if (
        orchestrator.deadLetterCount > 0 ||
        orchestrator.failedCount > 0 ||
        orchestrator.backlog > 100
      ) {
        publicationHealth = "degraded";
      }
      await audit(actor, "publication.diagnostics");
      return {
        adminVersion: SEARCH_PUBLICATION_ADMIN_VERSION,
        orchestrator,
        journalReady,
        retryEngineReady,
        bootstrapEnabled,
        compositionRegistered,
        publicationHealth,
      };
    },

    async retryPublication(actor, publicationId) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.retry");
      const entry = await options.runtime.journal.findById(publicationId);
      if (!entry || entry.tenantId !== actor.tenantId) {
        throw new SearchPublicationNotFoundError(publicationId);
      }
      const result = await retryOne(actor, entry);
      await audit(actor, "publication.retry", {
        publicationId,
        detail: result.ok ? result.mode : result.message,
      });
      return result;
    },

    async retryPublications(actor, ids) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.retry");
      const results: RetryResult[] = [];
      for (const publicationId of ids) {
        try {
          results.push(await this.retryPublication(actor, publicationId));
        } catch (error) {
          results.push({
            publicationId,
            ok: false,
            message: error instanceof Error ? error.message : "Retry failed",
          });
        }
      }
      await audit(actor, "publication.retry_batch", {
        detail: `count=${ids.length}`,
      });
      return results;
    },

    async retryFailedBatch(actor, limit = 25) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.retry");
      const failed = (
        await options.runtime.journal.listByStatus("failed", limit)
      ).filter((e) => e.tenantId === actor.tenantId);
      const results: RetryResult[] = [];
      for (const entry of failed) {
        results.push(await retryOne(actor, entry));
      }
      await audit(actor, "publication.retry_batch", {
        detail: `failed_batch=${results.length}`,
      });
      return results;
    },

    async clearCompletedRetries(actor) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.retry");
      // Operational: acknowledge published entries so retry history views can hide them.
      const published = (
        await options.runtime.journal.listByStatus("published", 200)
      ).filter((e) => e.tenantId === actor.tenantId && e.attemptCount > 1);
      let cleared = 0;
      for (const entry of published) {
        await options.markers.mark({
          publicationId: entry.id,
          kind: "acknowledged",
          actorUserId: actor.userId,
          reason: "clear_completed_retries",
          now: now(),
        });
        cleared += 1;
      }
      await audit(actor, "publication.clear_completed_retries", {
        detail: `cleared=${cleared}`,
      });
      return { cleared };
    },

    async acknowledgeDeadLetter(actor, publicationId, reason) {
      assertSearchPublicationPermission(
        actor.permissions,
        "search.publication.deadletter",
      );
      const entry = await options.runtime.journal.findById(publicationId);
      if (!entry || entry.tenantId !== actor.tenantId) {
        throw new SearchPublicationNotFoundError(publicationId);
      }
      if (entry.status !== "dead-letter") {
        throw new SearchPublicationAdminError(
          "SEARCH_PUBLICATION_INVALID_STATUS",
          "Only dead-letter publications can be acknowledged",
        );
      }
      await options.markers.mark({
        publicationId,
        kind: "acknowledged",
        actorUserId: actor.userId,
        reason,
        now: now(),
      });
      await audit(actor, "publication.deadletter.acknowledge", {
        publicationId,
        detail: reason,
      });
      return { ok: true as const };
    },

    async archiveDeadLetter(actor, publicationId, reason) {
      assertSearchPublicationPermission(
        actor.permissions,
        "search.publication.deadletter",
      );
      const entry = await options.runtime.journal.findById(publicationId);
      if (!entry || entry.tenantId !== actor.tenantId) {
        throw new SearchPublicationNotFoundError(publicationId);
      }
      if (entry.status !== "dead-letter") {
        throw new SearchPublicationAdminError(
          "SEARCH_PUBLICATION_INVALID_STATUS",
          "Only dead-letter publications can be archived",
        );
      }
      await options.markers.mark({
        publicationId,
        kind: "archived",
        actorUserId: actor.userId,
        reason,
        now: now(),
      });
      await audit(actor, "publication.deadletter.archive", {
        publicationId,
        detail: reason,
      });
      return { ok: true as const };
    },

    async retryDeadLetter(actor, publicationId) {
      assertSearchPublicationPermission(
        actor.permissions,
        "search.publication.deadletter",
      );
      const entry = await options.runtime.journal.findById(publicationId);
      if (!entry || entry.tenantId !== actor.tenantId) {
        throw new SearchPublicationNotFoundError(publicationId);
      }
      if (entry.status !== "dead-letter") {
        throw new SearchPublicationAdminError(
          "SEARCH_PUBLICATION_INVALID_STATUS",
          "Only dead-letter publications can be retried via dead-letter admin",
        );
      }
      const result = await retryOne(actor, entry);
      await audit(actor, "publication.deadletter.retry", {
        publicationId,
        detail: result.newPublicationId,
      });
      return result;
    },

    async drainBatch(actor) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.admin");
      const result = await options.runtime.orchestrator.processBatch();
      await audit(actor, "publication.drain", {
        detail: JSON.stringify(result),
      });
      return result;
    },

    async listAudit(actor, limit = 100) {
      assertSearchPublicationPermission(actor.permissions, "search.publication.read");
      return options.audit.list({ tenantId: actor.tenantId, limit });
    },
  };
}
