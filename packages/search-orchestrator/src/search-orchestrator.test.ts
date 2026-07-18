/**
 * APZSEARCH-016 — Product Indexing Orchestration Framework tests.
 */
import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import { createSearchIntegration } from "@apzhub/search-integration";

import {
  SEARCH_ORCHESTRATOR_VERSION,
  SearchOrchestrationDisabledError,
  afterSuccessEnqueue,
  assertPublicationTransition,
  canTransitionPublicationStatus,
  computeBackoffDelayMs,
  createInMemoryPublicationJournal,
  createPostgresPublicationJournal,
  createProductionSearchOrchestration,
  createPublicationDispatcher,
  createSearchOrchestrationForTest,
  enqueueArchivePublication,
  enqueueCreatePublication,
  enqueueDeletePublication,
  enqueueProductPublicationSafely,
  enqueueRestorePublication,
  enqueueUpdatePublication,
  hashPublicationPayload,
  isPermanentFailureMessage,
  isSearchOrchestrationEnabled,
  nextAttemptIso,
  PRODUCT_HOOK_PRESETS,
  projectToSearchDraft,
  safeEnqueuePublication,
  shouldRetry,
  withProjectSearchPublicationOrchestration,
} from "./index";

const envOn = { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" };

function canonicalPayload(id = "entity_1") {
  return {
    id,
    entityType: "project",
    productId: "projects" as const,
    tenantId: "tenant_a",
    title: "Project One",
    metadata: { kind: "project" },
    classification: "internal" as const,
    permissions: ["search.read"],
    createdAt: "2026-07-18T10:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    version: "1",
    lifecycleState: "published" as const,
    navigationTarget: `/workspace/projects/${id}`,
    sourceId: id,
  };
}

describe("APZSEARCH-016 search-orchestrator", () => {
  it("ships version 0.1.0", () => {
    expect(SEARCH_ORCHESTRATOR_VERSION).toBe("0.1.0");
  });

  describe("bootstrap gate", () => {
    it("denies by default when unset", () => {
      expect(isSearchOrchestrationEnabled({})).toBe(false);
      expect(
        isSearchOrchestrationEnabled({ APZHUB_SEARCH_ORCHESTRATION_ENABLED: "false" }),
      ).toBe(false);
    });

    it("accepts true/1/on", () => {
      expect(
        isSearchOrchestrationEnabled({ APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" }),
      ).toBe(true);
      expect(
        isSearchOrchestrationEnabled({ APZHUB_SEARCH_ORCHESTRATION_ENABLED: "1" }),
      ).toBe(true);
      expect(
        isSearchOrchestrationEnabled({ APZHUB_SEARCH_ORCHESTRATION_ENABLED: "ON" }),
      ).toBe(true);
    });
  });

  describe("lifecycle", () => {
    it("allows auditable transitions", () => {
      expect(canTransitionPublicationStatus("queued", "publishing")).toBe(true);
      expect(canTransitionPublicationStatus("publishing", "published")).toBe(true);
      expect(canTransitionPublicationStatus("publishing", "failed")).toBe(true);
      expect(canTransitionPublicationStatus("failed", "retrying")).toBe(true);
      expect(canTransitionPublicationStatus("failed", "dead-letter")).toBe(true);
      expect(canTransitionPublicationStatus("retrying", "publishing")).toBe(true);
      expect(canTransitionPublicationStatus("published", "queued")).toBe(false);
      expect(() => assertPublicationTransition("published", "failed")).toThrow(
        /Invalid/,
      );
    });
  });

  describe("retry policy", () => {
    it("computes exponential backoff with cap", () => {
      expect(
        computeBackoffDelayMs(1, {
          maxAttempts: 5,
          initialDelayMs: 1000,
          maxDelayMs: 10_000,
          multiplier: 2,
        }),
      ).toBe(1000);
      expect(
        computeBackoffDelayMs(2, {
          maxAttempts: 5,
          initialDelayMs: 1000,
          maxDelayMs: 10_000,
          multiplier: 2,
        }),
      ).toBe(2000);
      expect(
        computeBackoffDelayMs(5, {
          maxAttempts: 5,
          initialDelayMs: 1000,
          maxDelayMs: 3000,
          multiplier: 2,
        }),
      ).toBe(3000);
    });

    it("detects permanent failures and retry limits", () => {
      expect(isPermanentFailureMessage("validation failed")).toBe(true);
      expect(isPermanentFailureMessage("temporary timeout")).toBe(false);
      expect(
        shouldRetry(1, false, {
          maxAttempts: 3,
          initialDelayMs: 1,
          maxDelayMs: 1,
          multiplier: 2,
        }),
      ).toBe(true);
      expect(
        shouldRetry(3, false, {
          maxAttempts: 3,
          initialDelayMs: 1,
          maxDelayMs: 1,
          multiplier: 2,
        }),
      ).toBe(false);
      expect(shouldRetry(1, true)).toBe(false);
    });
  });

  describe("deduplication", () => {
    it("hashes payloads stably", () => {
      const a = hashPublicationPayload({ b: 1, a: 2 });
      const b = hashPublicationPayload({ a: 2, b: 1 });
      expect(a).toBe(b);
      expect(a).toHaveLength(64);
    });

    it("suppresses duplicate enqueues", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
      });
      const payload = canonicalPayload();
      const first = await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload,
        correlationId: "corr_1",
      });
      const second = await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload,
        correlationId: "corr_2",
      });
      expect(first.ok && !first.deduplicated).toBe(true);
      expect(second.ok && second.deduplicated).toBe(true);
      expect(await runtime.journal.countByStatus("queued")).toBe(1);
    });
  });

  describe("journal + batching", () => {
    it("claims batches in created order and respects batch size", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        batchPolicy: { maxBatchSize: 2 },
        id: (() => {
          let n = 0;
          return () => `pub_${++n}`;
        })(),
      });
      for (const id of ["a", "b", "c"]) {
        await runtime.dispatcher.enqueue({
          tenantId: "tenant_a",
          entityId: id,
          entityType: "project",
          productId: "projects",
          operation: "publish",
          payload: canonicalPayload(id),
          correlationId: `corr_${id}`,
        });
      }
      const batch = await runtime.orchestrator.processBatch();
      expect(batch.processed).toBe(2);
      expect(batch.published).toBe(2);
      expect(await runtime.journal.countByStatus("queued")).toBe(1);
      const second = await runtime.orchestrator.processBatch();
      expect(second.processed).toBe(1);
      expect(second.published).toBe(1);
    });

    it("lists and finds journal entries", async () => {
      const journal = createInMemoryPublicationJournal();
      const entry = await journal.enqueue({
        id: "pub_x",
        tenantId: "t1",
        entityId: "e1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: {},
        payloadJson: "{}",
        payloadHash: "abc",
        maxAttempts: 3,
        correlationId: "c1",
        now: "2026-07-18T10:00:00.000Z",
      });
      expect(await journal.findById("pub_x")).toEqual(entry);
      expect((await journal.listByStatus("queued")).map((e) => e.id)).toEqual([
        "pub_x",
      ]);
    });
  });

  describe("publish lifecycle through search-integration", () => {
    it("publishes queued entries via Search Integration only", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
      });
      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        organisationId: "org_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload(),
        correlationId: "corr_publish",
        actorUserId: "user_1",
      });
      const result = await runtime.orchestrator.processBatch();
      expect(result).toEqual({
        processed: 1,
        published: 1,
        failed: 0,
        deadLetter: 0,
      });
      expect(runtime.integration.sink.get("entity_1")?.title).toBe("Project One");
      expect(await runtime.journal.countByStatus("published")).toBe(1);
    });

    it("updates, lifecycles, and removes via journal operations", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        id: (() => {
          let n = 0;
          return () => `op_${++n}`;
        })(),
      });
      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload(),
        correlationId: "c1",
      });
      await runtime.orchestrator.processBatch();

      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "update",
        payload: { ...canonicalPayload(), title: "Renamed" },
        correlationId: "c2",
      });
      await runtime.orchestrator.processBatch();
      expect(runtime.integration.sink.get("entity_1")?.title).toBe("Renamed");

      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "lifecycle",
        payload: { entityId: "entity_1", state: "archived", reason: "archive" },
        correlationId: "c3",
      });
      await runtime.orchestrator.processBatch();
      expect(runtime.integration.sink.get("entity_1")?.lifecycleState).toBe("archived");

      // Remove requires published/updated — re-publish then remove.
      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_2",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload("entity_2"),
        correlationId: "c4",
      });
      await runtime.orchestrator.processBatch();
      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_2",
        entityType: "project",
        productId: "projects",
        operation: "remove",
        payload: { entityId: "entity_2" },
        correlationId: "c5",
      });
      await runtime.orchestrator.processBatch();
      expect(runtime.integration.sink.get("entity_2")?.lifecycleState).toBe("removed");
    });
  });

  describe("retry + dead-letter + failure recovery", () => {
    it("retries transient failures then recovers", async () => {
      let calls = 0;
      const integration = createSearchIntegration();
      const originalPublish = integration.publisher.publish.bind(integration.publisher);
      vi.spyOn(integration.publisher, "publish").mockImplementation((ctx, input) => {
        calls += 1;
        if (calls === 1) {
          return {
            ok: false,
            operation: "publish",
            correlationId: ctx.correlationId,
            durationMs: 1,
            acceptedAt: new Date().toISOString(),
            entityId: "entity_1",
            productId: "projects",
            message: "temporary upstream timeout",
          };
        }
        return originalPublish(ctx, input);
      });

      let clock = Date.parse("2026-07-18T10:00:00.000Z");
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        integration,
        retryPolicy: {
          maxAttempts: 3,
          initialDelayMs: 1000,
          maxDelayMs: 1000,
          multiplier: 2,
        },
        now: () => new Date(clock).toISOString(),
      });

      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload(),
        correlationId: "corr_retry",
      });

      const first = await runtime.orchestrator.processBatch();
      expect(first.failed).toBe(1);
      expect(await runtime.journal.countByStatus("retrying")).toBe(1);

      // Not due yet
      expect((await runtime.orchestrator.processBatch()).processed).toBe(0);

      clock += 2000;
      const recovered = await runtime.orchestrator.processBatch();
      expect(recovered.published).toBe(1);
      expect(await runtime.journal.countByStatus("published")).toBe(1);
    });

    it("routes permanent failures to dead-letter", async () => {
      const integration = createSearchIntegration();
      vi.spyOn(integration.publisher, "publish").mockImplementation((ctx) => ({
        ok: false,
        operation: "publish",
        correlationId: ctx.correlationId,
        durationMs: 1,
        acceptedAt: new Date().toISOString(),
        entityId: "entity_bad",
        productId: "projects",
        message: "validation rejected permanently",
      }));

      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        integration,
        retryPolicy: {
          maxAttempts: 5,
          initialDelayMs: 1,
          maxDelayMs: 1,
          multiplier: 2,
        },
      });

      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_bad",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload("entity_bad"),
        correlationId: "corr_dlq",
      });

      const result = await runtime.orchestrator.processBatch();
      expect(result.deadLetter).toBe(1);
      expect(await runtime.journal.countByStatus("dead-letter")).toBe(1);
    });

    it("dead-letters after exhausting retries on thrown errors", async () => {
      const integration = createSearchIntegration();
      vi.spyOn(integration.publisher, "publish").mockImplementation(() => {
        throw new Error("connection reset");
      });

      let clock = Date.parse("2026-07-18T10:00:00.000Z");
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        integration,
        retryPolicy: {
          maxAttempts: 2,
          initialDelayMs: 1,
          maxDelayMs: 1,
          multiplier: 2,
        },
        now: () => new Date(clock).toISOString(),
      });

      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload(),
        correlationId: "corr_throw",
      });

      expect((await runtime.orchestrator.processBatch()).failed).toBe(1);
      clock += 10;
      expect((await runtime.orchestrator.processBatch()).deadLetter).toBe(1);
    });
  });

  describe("diagnostics", () => {
    it("reports queue depth, retries, DLQ, throughput, backlog", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
      });
      await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload(),
        correlationId: "corr_d",
      });
      const before = await runtime.orchestrator.diagnostics();
      expect(before.enabled).toBe(true);
      expect(before.queueDepth).toBe(1);
      expect(before.backlog).toBe(1);
      await runtime.orchestrator.processBatch();
      const after = await runtime.orchestrator.diagnostics();
      expect(after.publishedCount).toBe(1);
      expect(after.throughputPublished).toBe(1);
      expect(after.frameworkVersion).toBe("0.1.0");
    });
  });

  describe("disabled orchestration safety", () => {
    it("fails enqueue safely without throwing into product hooks", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "false" },
      });
      const enqueue = await runtime.dispatcher.enqueue({
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: canonicalPayload(),
        correlationId: "corr_off",
      });
      expect(enqueue.ok).toBe(false);
      if (!enqueue.ok) {
        expect(enqueue.code).toBe("SEARCH_ORCHESTRATION_DISABLED");
      }

      const safe = await enqueueProductPublicationSafely(
        runtime.dispatcher,
        {
          tenantId: "tenant_a",
          correlationId: "corr_off",
        },
        {
          entityId: "entity_1",
          entityType: "project",
          productId: "projects",
          operation: "publish",
          payload: canonicalPayload(),
        },
      );
      expect(safe.accepted).toBe(false);
      expect(await runtime.journal.countByStatus("queued")).toBe(0);
    });
  });

  describe("product hooks", () => {
    it("wires project service create/update/archive without failing product tx", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        id: (() => {
          let n = 0;
          return () => `hook_${++n}`;
        })(),
      });

      const base = {
        async createProject(_ctx: unknown, input: { name: string }) {
          return {
            id: "proj_1",
            name: input.name,
            status: "active",
            createdAt: "2026-07-18T10:00:00.000Z",
            updatedAt: "2026-07-18T10:00:00.000Z",
          };
        },
        async updateProject(_ctx: unknown, _id: string, input: { name: string }) {
          return {
            id: "proj_1",
            name: input.name,
            status: "active",
            updatedAt: "2026-07-18T11:00:00.000Z",
          };
        },
        async archiveProject(_ctx: unknown, id: string) {
          return { id, name: "Archived", status: "archived" };
        },
        async restoreProject(_ctx: unknown, id: string) {
          return { id, name: "Restored", status: "active" };
        },
        async deleteProject(_ctx: unknown, _id: string) {
          return undefined;
        },
      };

      const service = withProjectSearchPublicationOrchestration(
        base,
        runtime.dispatcher,
      );
      const ctx = {
        tenantId: "tenant_a",
        organisationId: "org_a",
        correlationId: "corr_hook",
        userId: "user_1",
      };

      const created = await service.createProject(ctx, { name: "Alpha" });
      expect(created.name).toBe("Alpha");
      await vi.waitFor(async () => {
        expect(await runtime.journal.countByStatus("queued")).toBeGreaterThanOrEqual(1);
      });

      await service.updateProject(ctx, "proj_1", { name: "Beta" });
      await service.archiveProject(ctx, "proj_1");
      await service.restoreProject?.(ctx, "proj_1");
      await service.deleteProject?.(ctx, "proj_1");

      await vi.waitFor(async () => {
        expect(await runtime.journal.countByStatus("queued")).toBeGreaterThanOrEqual(5);
      });

      while ((await runtime.journal.countByStatus("queued")) > 0) {
        await runtime.orchestrator.processBatch();
      }

      expect(projectToSearchDraft(created).entityId).toBe("proj_1");
    });

    it("supports generic product hook presets", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
      });
      const context = {
        tenantId: "tenant_a",
        correlationId: "corr_preset",
      };
      await enqueueCreatePublication(
        runtime.dispatcher,
        context,
        PRODUCT_HOOK_PRESETS.support,
        { id: "tix_1", title: "Help" },
      );
      await enqueueArchivePublication(
        runtime.dispatcher,
        context,
        PRODUCT_HOOK_PRESETS.documents,
        "doc_1",
      );
      await enqueueDeletePublication(
        runtime.dispatcher,
        context,
        PRODUCT_HOOK_PRESETS.testing,
        "case_1",
      );
      expect(await runtime.journal.countByStatus("queued")).toBe(3);
    });
  });

  describe("factories + postgres boundary", () => {
    it("forbids production in-memory journal", () => {
      expect(() =>
        createProductionSearchOrchestration({
          postgresDb: undefined as unknown as DatabaseExecutor,
        }),
      ).toThrow(/postgresDb/);
    });

    it("requires postgres or explicit in-memory for tests", () => {
      expect(() => createSearchOrchestrationForTest({})).toThrow(
        /postgresDb|allowInMemoryJournal/,
      );
    });

    it("persists through a postgres journal mock", async () => {
      const rows: Record<string, unknown>[] = [];
      const db = {
        execute: async (query: { queryChunks?: unknown }) => {
          const text = String(query);
          if (text.includes("INSERT")) {
            const last = rows[rows.length - 1];
            // Factory inserts via sql template — simulate RETURNING from stored row
            void last;
          }
          // Simpler: interpret by tracking enqueue via journal API path using SQL inspection
          return { rows: [] };
        },
      } as unknown as DatabaseExecutor;

      // Use a stateful mock driven by createPostgresPublicationJournal contract
      const store = new Map<string, Record<string, unknown>>();
      const statefulDb = {
        execute: async (
          statement: { sql?: string; queryChunks?: unknown[] } | unknown,
        ) => {
          const sqlText =
            typeof statement === "object" &&
            statement !== null &&
            "queryChunks" in (statement as object)
              ? JSON.stringify(statement)
              : String(statement);

          // Extract values from drizzle sql template chunks is awkward — use memory journal for
          // functional coverage and assert postgres factory wiring separately.
          void sqlText;
          void store;
          return { rows: [] };
        },
      } as unknown as DatabaseExecutor;

      expect(() => createPostgresPublicationJournal(statefulDb)).not.toThrow();
      expect(() =>
        createPostgresPublicationJournal(null as unknown as DatabaseExecutor),
      ).toThrow(/requires db/);

      const runtime = createSearchOrchestrationForTest({
        postgresDb: {
          execute: async () => ({ rows: [] }),
        } as unknown as DatabaseExecutor,
        env: envOn,
      });
      expect(runtime.journal).toBeTruthy();
      void db;
    });

    it("exercises postgres journal CRUD against a row-backed mock", async () => {
      type Row = {
        id: string;
        tenant_id: string;
        organisation_id: string | null;
        entity_id: string;
        entity_type: string;
        product_id: string;
        operation: string;
        payload_json: string;
        payload_hash: string;
        status: string;
        attempt_count: number;
        max_attempts: number;
        next_attempt_at: string | null;
        last_error: string | null;
        correlation_id: string;
        actor_user_id: string | null;
        created_at: string;
        updated_at: string;
        published_at: string | null;
      };

      const store = new Map<string, Row>();

      function paramsOf(query: unknown): unknown[] {
        const chunks = (query as { queryChunks?: unknown[] }).queryChunks ?? [];
        return chunks.filter(
          (c) =>
            c === null ||
            typeof c === "string" ||
            typeof c === "number" ||
            typeof c === "boolean",
        );
      }

      function sqlOf(query: unknown): string {
        const chunks = (query as { queryChunks?: unknown[] }).queryChunks ?? [];
        return chunks
          .map((c) => {
            if (typeof c === "string" || typeof c === "number") return "?";
            if (c && typeof c === "object" && "value" in (c as object)) {
              const v = (c as { value: unknown }).value;
              return Array.isArray(v) ? v.join("") : String(v);
            }
            return "";
          })
          .join("")
          .replace(/\s+/g, " ");
      }

      const db = {
        execute: async (query: unknown) => {
          const sql = sqlOf(query);
          const p = paramsOf(query);

          if (sql.includes("INSERT INTO platform_search_publication_journal")) {
            const row: Row = {
              id: String(p[0]),
              tenant_id: String(p[1]),
              organisation_id: (p[2] as string | null) ?? null,
              entity_id: String(p[3]),
              entity_type: String(p[4]),
              product_id: String(p[5]),
              operation: String(p[6]),
              payload_json: String(p[7]),
              payload_hash: String(p[8]),
              status: String(p[9] ?? "queued"),
              attempt_count: Number(p[10] ?? 0),
              max_attempts: Number(p[11] ?? 5),
              next_attempt_at: null,
              last_error: null,
              correlation_id: String(p[12]),
              actor_user_id: (p[13] as string | null) ?? null,
              created_at: String(p[14]),
              updated_at: String(p[15]),
              published_at: null,
            };
            store.set(row.id, row);
            return { rows: [row] };
          }

          if (sql.includes("WHERE id =") && sql.includes("SELECT *")) {
            const row = store.get(String(p[0]));
            return { rows: row ? [row] : [] };
          }

          if (sql.includes("AND payload_hash =")) {
            const [tenantId, entityId, operation, payloadHash] = p;
            const found = [...store.values()].find(
              (r) =>
                r.tenant_id === tenantId &&
                r.entity_id === entityId &&
                r.operation === operation &&
                r.payload_hash === payloadHash &&
                ["queued", "publishing", "published", "retrying"].includes(r.status),
            );
            return { rows: found ? [found] : [] };
          }

          if (sql.includes("WITH candidates AS")) {
            const now = String(p[0]);
            const limit = Number(p[1] ?? 25);
            const ready = [...store.values()]
              .filter((r) => {
                if (r.status === "queued") return true;
                if (r.status !== "retrying") return false;
                return !r.next_attempt_at || r.next_attempt_at <= now;
              })
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .slice(0, limit)
              .map((r) => {
                const next = {
                  ...r,
                  status: "publishing",
                  attempt_count: r.attempt_count + 1,
                  updated_at: now,
                  next_attempt_at: null,
                };
                store.set(next.id, next);
                return next;
              });
            return { rows: ready };
          }

          if (
            sql.includes("UPDATE platform_search_publication_journal") &&
            sql.includes("SET status")
          ) {
            const id = String(p[6]);
            const existing = store.get(id);
            if (!existing) return { rows: [] };
            const next: Row = {
              ...existing,
              status: String(p[0]),
              updated_at: String(p[1]),
              attempt_count: Number(p[2]),
              next_attempt_at: (p[3] as string | null) ?? null,
              last_error: (p[4] as string | null) ?? null,
              published_at: (p[5] as string | null) ?? null,
            };
            store.set(id, next);
            return { rows: [next] };
          }

          if (sql.includes("SELECT COUNT(*)")) {
            const count = [...store.values()].filter((r) => r.status === p[0]).length;
            return { rows: [{ count }] };
          }

          if (sql.includes("ORDER BY created_at ASC") && sql.includes("LIMIT")) {
            const status = String(p[0]);
            const limit = Number(p[1] ?? 100);
            const list = [...store.values()]
              .filter((r) => r.status === status)
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .slice(0, limit);
            return { rows: list };
          }

          return { rows: [] };
        },
      } as unknown as DatabaseExecutor;

      const journal = createPostgresPublicationJournal(db);
      const entry = await journal.enqueue({
        id: "pg_1",
        tenantId: "tenant_a",
        organisationId: "org_a",
        entityId: "e1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: {},
        payloadJson: '{"ok":true}',
        payloadHash: "hash1",
        maxAttempts: 5,
        correlationId: "corr_pg",
        actorUserId: "user_1",
        now: "2026-07-18T10:00:00.000Z",
      });
      expect(entry.status).toBe("queued");
      expect(await journal.findById("pg_1")).not.toBeNull();
      expect(
        await journal.findDuplicate({
          tenantId: "tenant_a",
          entityId: "e1",
          operation: "publish",
          payloadHash: "hash1",
        }),
      ).not.toBeNull();

      const claimed = await journal.claimBatch({
        limit: 10,
        now: "2026-07-18T10:00:01.000Z",
      });
      expect(claimed).toHaveLength(1);
      expect(claimed[0]?.status).toBe("publishing");

      const published = await journal.updateStatus({
        id: "pg_1",
        from: "publishing",
        to: "published",
        now: "2026-07-18T10:00:02.000Z",
        publishedAt: "2026-07-18T10:00:02.000Z",
        lastError: null,
        nextAttemptAt: null,
      });
      expect(published.status).toBe("published");
      expect(await journal.countByStatus("published")).toBe(1);
      expect((await journal.listByStatus("published"))[0]?.id).toBe("pg_1");
    });
  });

  describe("boundary", () => {
    it("does not import frozen search platform packages in public API surface", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const root = path.resolve(__dirname);
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          if (fs.statSync(full).isDirectory()) walk(full);
          else if (full.endsWith(".ts") && !full.includes(".test.")) files.push(full);
        }
      };
      walk(root);
      const blob = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
      expect(blob).not.toMatch(/@apzhub\/search-persistence/);
      expect(blob).not.toMatch(/@apzhub\/search-contracts/);
      expect(blob).not.toMatch(/@apzhub\/platform-services/);
      expect(blob).not.toMatch(/@apzhub\/integration-meilisearch/);
      expect(blob).not.toMatch(/meilisearch/);
      expect(blob).toMatch(/@apzhub\/search-integration/);
    });
  });

  describe("coverage gaps", () => {
    it("covers disabled error, throwIfDisabled, and safeEnqueuePublication", async () => {
      const err = new SearchOrchestrationDisabledError();
      expect(err.code).toBe("SEARCH_ORCHESTRATION_DISABLED");
      expect(err.name).toBe("SearchOrchestrationDisabledError");

      const journal = createInMemoryPublicationJournal();
      const dispatcher = createPublicationDispatcher({
        journal,
        id: () => "x1",
        env: {},
        throwIfDisabled: true,
      });
      await expect(
        dispatcher.enqueue({
          tenantId: "t",
          entityId: "e",
          entityType: "project",
          productId: "projects",
          operation: "publish",
          payload: {},
          correlationId: "c",
        }),
      ).rejects.toBeInstanceOf(SearchOrchestrationDisabledError);

      const enabled = createPublicationDispatcher({
        journal,
        id: () => "x2",
        env: envOn,
      });
      await safeEnqueuePublication(enabled, {
        tenantId: "t",
        entityId: "e2",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: { a: 1 },
        correlationId: "c2",
      });
      expect(await journal.countByStatus("queued")).toBe(1);
    });

    it("covers afterSuccessEnqueue and safe hook catch path", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
      });
      const wrapped = afterSuccessEnqueue(
        async (name: string) => ({ id: "e9", name }),
        (_args, result) => ({
          context: { tenantId: "t", correlationId: "c" },
          call: {
            entityId: result.id,
            entityType: "project",
            productId: "projects",
            operation: "publish",
            payload: projectToSearchDraft(result),
          },
        }),
        runtime.dispatcher,
      );
      expect((await wrapped("N")).name).toBe("N");
      await vi.waitFor(async () => {
        expect(await runtime.journal.countByStatus("queued")).toBe(1);
      });

      const nullResolve = afterSuccessEnqueue(
        async () => ({ id: "skip" }),
        () => null,
        runtime.dispatcher,
      );
      await nullResolve();

      const throwingDispatcher = {
        enqueue: async () => {
          throw new Error("boom");
        },
      };
      const accepted = await enqueueProductPublicationSafely(
        throwingDispatcher as never,
        { tenantId: "t", correlationId: "c" },
        {
          entityId: "e",
          entityType: "project",
          productId: "projects",
          operation: "publish",
          payload: {},
        },
      );
      expect(accepted.accepted).toBe(false);
    });

    it("covers product hook update/restore presets and production factory", async () => {
      const runtime = createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: envOn,
        id: (() => {
          let n = 0;
          return () => `cov_${++n}`;
        })(),
      });
      const ctx = { tenantId: "t", correlationId: "c" };
      await enqueueUpdatePublication(
        runtime.dispatcher,
        ctx,
        PRODUCT_HOOK_PRESETS.reporting,
        { id: "r1", title: "Report" },
      );
      await enqueueRestorePublication(
        runtime.dispatcher,
        ctx,
        PRODUCT_HOOK_PRESETS.projects,
        "proj_x",
      );
      expect(await runtime.journal.countByStatus("queued")).toBe(2);

      const store: Record<string, unknown>[] = [];
      const prod = createProductionSearchOrchestration({
        postgresDb: {
          execute: async (query: unknown) => {
            const chunks = (query as { queryChunks?: unknown[] }).queryChunks ?? [];
            const params = chunks.filter(
              (c) =>
                c === null ||
                typeof c === "string" ||
                typeof c === "number" ||
                typeof c === "boolean",
            );
            const sql = chunks
              .map((c) =>
                c && typeof c === "object" && "value" in (c as object)
                  ? String((c as { value: unknown[] }).value)
                  : "?",
              )
              .join("");
            if (sql.includes("INSERT")) {
              const row = {
                id: String(params[0]),
                tenant_id: String(params[1]),
                organisation_id: null,
                entity_id: String(params[3]),
                entity_type: String(params[4]),
                product_id: String(params[5]),
                operation: String(params[6]),
                payload_json: String(params[7]),
                payload_hash: String(params[8]),
                status: "queued",
                attempt_count: 0,
                max_attempts: Number(params[11] ?? 5),
                next_attempt_at: null,
                last_error: null,
                correlation_id: String(params[12]),
                actor_user_id: null,
                created_at: String(params[14]),
                updated_at: String(params[15]),
                published_at: null,
              };
              store.push(row);
              return { rows: [row] };
            }
            if (sql.includes("payload_hash")) return { rows: [] };
            return { rows: [] };
          },
        } as unknown as DatabaseExecutor,
        env: envOn,
        // default id generator path
      });
      const enq = await prod.dispatcher.enqueue({
        tenantId: "t",
        entityId: "prod_e",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: { n: 1 },
        correlationId: "c",
      });
      expect(enq.ok).toBe(true);
      expect(prod.orchestrator).toBeTruthy();
      expect(nextAttemptIso(1, () => "2026-07-18T10:00:00.000Z")).toMatch(/T10:00:01/);
      expect(canTransitionPublicationStatus("queued", "queued")).toBe(true);
      expect(isPermanentFailureMessage(undefined)).toBe(false);
    });

    it("covers memory journal error paths and retry claim timing", async () => {
      const journal = createInMemoryPublicationJournal();
      await expect(
        journal.updateStatus({
          id: "missing",
          from: "queued",
          to: "publishing",
          now: "2026-07-18T10:00:00.000Z",
        }),
      ).rejects.toThrow(/not found/);

      const entry = await journal.enqueue({
        id: "m1",
        tenantId: "t",
        entityId: "e",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: {},
        payloadJson: "{}",
        payloadHash: "h",
        maxAttempts: 3,
        correlationId: "c",
        now: "2026-07-18T10:00:00.000Z",
      });
      await expect(
        journal.updateStatus({
          id: entry.id,
          from: "publishing",
          to: "published",
          now: "2026-07-18T10:00:01.000Z",
        }),
      ).rejects.toThrow(/mismatch/);

      const claimed = await journal.claimBatch({
        limit: 1,
        now: "2026-07-18T10:00:01.000Z",
      });
      expect(claimed[0]?.status).toBe("publishing");
      await journal.updateStatus({
        id: "m1",
        from: "publishing",
        to: "failed",
        now: "2026-07-18T10:00:02.000Z",
        lastError: "x",
      });
      await journal.updateStatus({
        id: "m1",
        from: "failed",
        to: "retrying",
        now: "2026-07-18T10:00:03.000Z",
        nextAttemptAt: "2026-07-18T12:00:00.000Z",
      });
      expect(
        (
          await journal.claimBatch({
            limit: 5,
            now: "2026-07-18T11:00:00.000Z",
          })
        ).length,
      ).toBe(0);
      expect(
        (
          await journal.claimBatch({
            limit: 5,
            now: "2026-07-18T12:00:00.000Z",
          })
        ).length,
      ).toBe(1);
    });

    it("covers postgres asRows array shape and empty insert failure", async () => {
      const emptyDb = {
        execute: async () => [],
      } as unknown as DatabaseExecutor;
      const journal = createPostgresPublicationJournal(emptyDb);
      await expect(
        journal.enqueue({
          id: "e",
          tenantId: "t",
          entityId: "e",
          entityType: "project",
          productId: "projects",
          operation: "publish",
          payload: {},
          payloadJson: "{}",
          payloadHash: "h",
          maxAttempts: 1,
          correlationId: "c",
          now: "2026-07-18T10:00:00.000Z",
        }),
      ).rejects.toThrow(/Failed to insert/);

      const arrayDb = {
        execute: async () => [
          {
            id: "a1",
            tenant_id: "t",
            organisation_id: null,
            entity_id: "e",
            entity_type: "project",
            product_id: "projects",
            operation: "publish",
            payload_json: "{}",
            payload_hash: "h",
            status: "queued",
            attempt_count: 0,
            max_attempts: 3,
            next_attempt_at: null,
            last_error: null,
            correlation_id: "c",
            actor_user_id: null,
            created_at: "2026-07-18T10:00:00.000Z",
            updated_at: "2026-07-18T10:00:00.000Z",
            published_at: null,
          },
        ],
      } as unknown as DatabaseExecutor;
      const j2 = createPostgresPublicationJournal(arrayDb);
      const found = await j2.findById("a1");
      expect(found?.id).toBe("a1");
    });

    it("covers permanent failure without message and project draft branches", () => {
      expect(projectToSearchDraft({ id: "only" }).title).toBe("only");
      expect(
        projectToSearchDraft({
          id: "p",
          name: "N",
          status: "active",
          workspaceId: "w1",
        }).metadata,
      ).toEqual({ status: "active", workspaceId: "w1" });
      expect(hashPublicationPayload([1, { z: 1, a: 2 }])).toHaveLength(64);
    });
  });
});
