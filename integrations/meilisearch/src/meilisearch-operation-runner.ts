import type { AdapterClock } from "@apzhub/integration-sdk/adapter";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { isIntegrationError } from "@apzhub/integration-sdk/errors";
import type {
  SearchFilter,
  SearchHit,
  SearchQuery,
  SearchRequestContext,
  SearchResultPage,
} from "@apzhub/search-contracts";
import {
  asSearchHitId,
  asSearchSourceId,
  isSearchProductId,
  type SearchProductId,
} from "@apzhub/search-contracts";

import type { MeilisearchRestClient } from "./internal/meilisearch-rest-client";
import type { MeilisearchIndexRecord } from "./internal/meilisearch-api-types";
import {
  mapMeilisearchUnknownError,
} from "./meilisearch-error-mapper";
import { MEILISEARCH_INTEGRATION_ID } from "./version";
import {
  createErrorResult,
  createNotSupportedResult,
  createOkResult,
  type SearchOperationResult,
} from "./results/search-operation-result";
import {
  MEILISEARCH_UNSUPPORTED_FEATURES,
  NOT_SUPPORTED,
} from "./results/unsupported";
import type { MeilisearchMetrics } from "./observability/meilisearch-observability";
import type { MeilisearchLogger } from "./observability/meilisearch-observability";
import type { MeilisearchHealthProvider } from "./health/meilisearch-health-provider";
import type { MeilisearchDiagnosticsProvider } from "./diagnostics/meilisearch-diagnostics-provider";
import type { MeilisearchCapabilityProvider } from "./capabilities/meilisearch-capability-provider";
import type { MeilisearchCompatibilityProvider } from "./capabilities/meilisearch-compatibility-provider";
import type { MeilisearchConfigurationValidator } from "./lifecycle/meilisearch-configuration-validator";
import type { MeilisearchConfiguration } from "./meilisearch-config";
import type { CircuitBreaker } from "@apzhub/integration-sdk/resilience";
import type { ErrorSummaryTracker } from "@apzhub/integration-sdk/observability";

export interface MeilisearchIndexActionInput {
  readonly uid: string;
  readonly primaryKey?: string;
}

export interface MeilisearchDocumentActionInput {
  readonly indexUid: string;
  readonly documentId?: string;
  readonly documents?: readonly Readonly<Record<string, unknown>>[];
}

export interface MeilisearchOperationRunnerDeps {
  readonly adapterId: string;
  readonly config: MeilisearchConfiguration;
  readonly client: MeilisearchRestClient;
  readonly circuitBreaker: CircuitBreaker;
  readonly metrics: MeilisearchMetrics;
  readonly logger: MeilisearchLogger;
  readonly errorSummary: ErrorSummaryTracker;
  readonly clock: AdapterClock;
  readonly health: MeilisearchHealthProvider;
  readonly diagnostics: MeilisearchDiagnosticsProvider;
  readonly capabilities: MeilisearchCapabilityProvider;
  readonly compatibility: MeilisearchCompatibilityProvider;
  readonly configurationValidator: MeilisearchConfigurationValidator;
}

function toIntegrationContext(context: SearchRequestContext): IntegrationRequestContext {
  return {
    correlationId: context.correlationId,
    tenantId: context.tenantId,
  };
}

function detectUnsupportedQueryFeature(query: SearchQuery): string | undefined {
  const custom = (query as SearchQuery & {
    readonly semantic?: boolean;
    readonly vector?: unknown;
    readonly fuzzy?: boolean;
    readonly ai?: boolean;
  });
  if (custom.semantic) return "semantic";
  if (custom.vector) return "vector";
  if (custom.fuzzy) return "fuzzy";
  if (custom.ai) return "ai";
  return undefined;
}

function mapFilter(filter: SearchFilter): string {
  switch (filter.op) {
    case "eq":
      return `${filter.field} = ${formatFilterValue(filter.value)}`;
    case "neq":
      return `${filter.field} != ${formatFilterValue(filter.value)}`;
    case "in": {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      return `${filter.field} IN [${values.map((v) => formatFilterValue(v)).join(", ")}]`;
    }
    case "nin": {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      return `${filter.field} NOT IN [${values.map((v) => formatFilterValue(v)).join(", ")}]`;
    }
    case "exists":
      return filter.value === false || filter.value === "false"
        ? `${filter.field} IS NULL`
        : `${filter.field} IS NOT NULL`;
    case "range": {
      const parts: string[] = [];
      if (filter.from !== undefined) parts.push(`${filter.field} >= ${formatFilterValue(filter.from)}`);
      if (filter.to !== undefined) parts.push(`${filter.field} <= ${formatFilterValue(filter.to)}`);
      return parts.join(" AND ");
    }
    default:
      return `${filter.field} = ${formatFilterValue(filter.value)}`;
  }
}

function formatFilterValue(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `"${String(value ?? "").replace(/"/g, '\\"')}"`;
}

function mapHits(
  hits: readonly Readonly<Record<string, unknown>>[],
  includeHighlights: boolean | undefined,
): readonly SearchHit[] {
  return hits.map((hit, index) => {
    const id = String(hit.id ?? hit.uid ?? `hit_${index}`);
    const formatted = hit._formatted as Record<string, unknown> | undefined;
    const highlights =
      includeHighlights && formatted
        ? Object.entries(formatted)
            .filter(([, v]) => typeof v === "string" && String(v).includes("<em>"))
            .map(([field, snippet]) => ({
              field,
              snippets: [String(snippet)],
            }))
        : undefined;

    return {
      id: asSearchHitId(id),
      score: typeof hit._rankingScore === "number" ? hit._rankingScore : undefined,
      metadata: {
        entityType: String(hit.entityType ?? "document"),
        entityId: id,
        title: String(hit.title ?? hit.name ?? id),
        description: hit.description !== undefined ? String(hit.description) : undefined,
        productId: resolveProductId(hit.productId),
        sourceId: asSearchSourceId(
          typeof hit.sourceId === "string" && hit.sourceId.length > 0
            ? hit.sourceId
            : "src_meili",
        ),
        tenantId: String(hit.tenantId ?? "unknown"),
        organisationId:
          hit.organisationId !== undefined ? String(hit.organisationId) : undefined,
        custom: Object.fromEntries(
          Object.entries(hit)
            .filter(
              ([k]) =>
                ![
                  "id",
                  "uid",
                  "title",
                  "name",
                  "description",
                  "entityType",
                  "productId",
                  "sourceId",
                  "tenantId",
                  "organisationId",
                  "_formatted",
                  "_rankingScore",
                ].includes(k),
            )
            .map(([k, v]) => [k, String(v)]),
        ),
      },
      highlights,
    };
  });
}

function resolveProductId(value: unknown): SearchProductId {
  if (typeof value === "string" && isSearchProductId(value)) return value;
  return "documents";
}

export class MeilisearchOperationRunner {
  constructor(private readonly deps: MeilisearchOperationRunnerDeps) {}

  async run<T>(
    context: IntegrationRequestContext,
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.deps.circuitBreaker.allowRequest()) {
      throw Object.assign(new Error("Circuit breaker open — Meilisearch operation rejected"), {
        vendorCode: "vendor_unavailable",
        statusCode: 503,
      });
    }

    const startedAt = this.deps.clock.nowMs();
    try {
      const result = await fn();
      const durationMs = this.deps.clock.nowMs() - startedAt;
      this.deps.metrics.recordRequest({ durationMs, success: true, operation });
      this.deps.circuitBreaker.recordSuccess();
      this.deps.logger.info("Meilisearch operation succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation,
        durationMs,
        result: "success",
      });
      return result;
    } catch (error) {
      const durationMs = this.deps.clock.nowMs() - startedAt;
      const translated = isIntegrationError(error)
        ? { error }
        : mapMeilisearchUnknownError(error, {
            correlationId: context.correlationId,
            integrationId: MEILISEARCH_INTEGRATION_ID,
            adapterId: this.deps.adapterId,
            operation,
            tenantId: context.tenantId,
          });
      this.deps.errorSummary.record(translated.error);
      this.deps.circuitBreaker.recordFailure(translated.error);
      this.deps.metrics.recordRequest({ durationMs, success: false, operation });
      this.deps.logger.error("Meilisearch operation failed", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation,
        durationMs,
        result: "failure",
        errorCode: translated.error.code,
        errorCategory: translated.error.category,
      });
      throw translated.error;
    }
  }

  async executeQuery(
    context: SearchRequestContext,
    query: SearchQuery,
    indexUid?: string,
  ): Promise<SearchOperationResult<"query", SearchResultPage>> {
    const unsupported = detectUnsupportedQueryFeature(query);
    if (unsupported) {
      this.deps.metrics.recordNotSupported(unsupported);
      return createNotSupportedResult("query", unsupported);
    }

    const uid = indexUid ?? this.deps.config.defaultIndexUid;
    if (!uid) {
      return createErrorResult(
        "query",
        "indexUid is required (pass argument or set defaultIndexUid)",
        "meilisearch.query.index_required",
        "validation",
      );
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;
    const offset = (page - 1) * pageSize;
    const q =
      query.phrase !== undefined && query.phrase.length > 0
        ? `"${query.phrase}"`
        : (query.keywords ?? "");

    const filter =
      query.filters && query.filters.length > 0
        ? query.filters.map(mapFilter).filter(Boolean).join(" AND ")
        : undefined;
    const sort =
      query.sorts && query.sorts.length > 0
        ? query.sorts.map((s) => `${s.field}:${s.direction === "desc" ? "desc" : "asc"}`)
        : undefined;

    try {
      const response = await this.run(toIntegrationContext(context), "query", () =>
        this.deps.client.search(toIntegrationContext(context), uid, {
          q,
          offset,
          limit: pageSize,
          ...(filter ? { filter } : {}),
          ...(sort ? { sort } : {}),
          ...(query.includeFacets ? { facets: ["*"] } : {}),
          ...(query.includeHighlights
            ? {
                attributesToHighlight: ["*"],
                highlightPreTag: "<em>",
                highlightPostTag: "</em>",
              }
            : {}),
        }),
      );

      const total = response.estimatedTotalHits ?? response.totalHits ?? response.hits.length;
      const facets = response.facetDistribution
        ? Object.entries(response.facetDistribution).map(([field, buckets]) => ({
            field,
            buckets: Object.entries(buckets).map(([value, count]) => ({ value, count })),
          }))
        : undefined;

      const pageResult: SearchResultPage = {
        hits: mapHits(response.hits as Readonly<Record<string, unknown>>[], query.includeHighlights),
        page,
        pageSize,
        totalEstimated: total,
        hasMore: offset + response.hits.length < total,
        facets,
        tookMs: response.processingTimeMs,
      };

      return createOkResult("query", pageResult, response.processingTimeMs);
    } catch (error) {
      const translated = mapMeilisearchUnknownError(error, {
        correlationId: context.correlationId,
        integrationId: MEILISEARCH_INTEGRATION_ID,
        adapterId: this.deps.adapterId,
        operation: "query",
        tenantId: context.tenantId,
      });
      return createErrorResult(
        "query",
        translated.error.message,
        translated.error.code,
        translated.error.category,
      );
    }
  }

  async manageIndex(
    context: SearchRequestContext,
    action: "create" | "delete" | "get" | "list" | "update",
    input?: MeilisearchIndexActionInput,
  ): Promise<SearchOperationResult<"index", MeilisearchIndexRecord | readonly MeilisearchIndexRecord[]>> {
    const ctx = toIntegrationContext(context);
    try {
      switch (action) {
        case "list": {
          const listed = await this.run(ctx, "index.list", () => this.deps.client.listIndexes(ctx));
          return createOkResult("index", listed.results);
        }
        case "get": {
          if (!input?.uid) {
            return createErrorResult("index", "uid is required for get", "validation");
          }
          const index = await this.run(ctx, "index.get", () =>
            this.deps.client.getIndex(ctx, input.uid),
          );
          return createOkResult("index", index);
        }
        case "create": {
          if (!input?.uid) {
            return createErrorResult("index", "uid is required for create", "validation");
          }
          await this.run(ctx, "index.create", () =>
            this.deps.client.createIndex(ctx, input.uid, input.primaryKey),
          );
          const created = await this.deps.client.getIndex(ctx, input.uid);
          return createOkResult("index", created);
        }
        case "update": {
          if (!input?.uid || !input.primaryKey) {
            return createErrorResult(
              "index",
              "uid and primaryKey are required for update",
              "validation",
            );
          }
          await this.run(ctx, "index.update", () =>
            this.deps.client.updateIndex(ctx, input.uid, input.primaryKey!),
          );
          const updated = await this.deps.client.getIndex(ctx, input.uid);
          return createOkResult("index", updated);
        }
        case "delete": {
          if (!input?.uid) {
            return createErrorResult("index", "uid is required for delete", "validation");
          }
          await this.run(ctx, "index.delete", () => this.deps.client.deleteIndex(ctx, input.uid));
          return createOkResult("index", { uid: input.uid });
        }
        default:
          return createNotSupportedResult("index", String(action));
      }
    } catch (error) {
      const translated = mapMeilisearchUnknownError(error, {
        correlationId: context.correlationId,
        integrationId: MEILISEARCH_INTEGRATION_ID,
        adapterId: this.deps.adapterId,
        operation: `index.${action}`,
        tenantId: context.tenantId,
      });
      return createErrorResult(
        "index",
        translated.error.message,
        translated.error.code,
        translated.error.category,
      );
    }
  }

  async manageDocument(
    context: SearchRequestContext,
    action: "upsert" | "delete" | "get",
    input: MeilisearchDocumentActionInput,
  ): Promise<
    SearchOperationResult<"document", Readonly<Record<string, unknown>> | { readonly taskUid?: number }>
  > {
    const ctx = toIntegrationContext(context);
    try {
      switch (action) {
        case "get": {
          if (!input.documentId) {
            return createErrorResult("document", "documentId is required for get", "validation");
          }
          const doc = await this.run(ctx, "document.get", () =>
            this.deps.client.getDocument(ctx, input.indexUid, input.documentId!),
          );
          return createOkResult("document", doc);
        }
        case "upsert": {
          if (!input.documents || input.documents.length === 0) {
            return createErrorResult(
              "document",
              "documents are required for upsert",
              "validation",
            );
          }
          const task = await this.run(ctx, "document.upsert", () =>
            this.deps.client.upsertDocuments(ctx, input.indexUid, input.documents!),
          );
          return createOkResult("document", { taskUid: task.taskUid });
        }
        case "delete": {
          if (!input.documentId) {
            return createErrorResult("document", "documentId is required for delete", "validation");
          }
          const task = await this.run(ctx, "document.delete", () =>
            this.deps.client.deleteDocument(ctx, input.indexUid, input.documentId!),
          );
          return createOkResult("document", { taskUid: task.taskUid });
        }
        default:
          return createNotSupportedResult("document", String(action));
      }
    } catch (error) {
      const translated = mapMeilisearchUnknownError(error, {
        correlationId: context.correlationId,
        integrationId: MEILISEARCH_INTEGRATION_ID,
        adapterId: this.deps.adapterId,
        operation: `document.${action}`,
        tenantId: context.tenantId,
      });
      return createErrorResult(
        "document",
        translated.error.message,
        translated.error.code,
        translated.error.category,
      );
    }
  }

  async probeHealth(context: SearchRequestContext) {
    return this.deps.health.probe(toIntegrationContext(context));
  }

  async collectDiagnostics(context: SearchRequestContext) {
    return this.deps.diagnostics.collect(toIntegrationContext(context));
  }

  async readStatistics(context: SearchRequestContext) {
    const diag = await this.collectDiagnostics(context);
    if (diag.status !== "OK") {
      return createErrorResult(
        "statistics",
        diag.message,
        "code" in diag ? diag.code : undefined,
        "category" in diag ? diag.category : undefined,
      );
    }
    return createOkResult("statistics", diag.data.statistics ?? {
      declaredIndexCount: 0,
      declaredProviderCount: 1,
      declaredCollectionCount: 0,
      declaredSourceCount: 0,
    });
  }

  readCapabilities() {
    return createOkResult("capabilities", this.deps.capabilities.toContractCapabilities());
  }

  evaluateCompatibility() {
    return createOkResult("capabilities", this.deps.compatibility.evaluate());
  }

  validateConfiguration(input: Parameters<MeilisearchConfigurationValidator["validate"]>[0]) {
    const result = this.deps.configurationValidator.validate(input);
    if (!result.ok) {
      return createErrorResult("validation", result.issues.join("; "), "validation");
    }
    return createOkResult("validation", result);
  }

  notSupported(feature: string, operation: "query" | "index" | "document" = "query") {
    if (!(MEILISEARCH_UNSUPPORTED_FEATURES as readonly string[]).includes(feature)) {
      this.deps.metrics.recordNotSupported(feature);
    } else {
      this.deps.metrics.recordNotSupported(feature);
    }
    this.deps.logger.warn(`Meilisearch feature ${feature} is ${NOT_SUPPORTED}`, {
      operation,
      result: "failure",
    });
    return createNotSupportedResult(operation, feature);
  }
}
