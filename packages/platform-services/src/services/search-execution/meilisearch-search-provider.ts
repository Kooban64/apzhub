/**
 * MeilisearchSearchProvider — PlatformSearchExecutionProvider wrapping
 * @apzhub/integration-meilisearch public API only (APZSEARCH-006).
 */

import type {
  MeilisearchAdapter,
} from "@apzhub/integration-meilisearch";
import {
  MEILISEARCH_ADAPTER_VERSION,
  MEILISEARCH_PROVIDER_KIND,
  SEARCH_OPERATION_STATUS_OK,
} from "@apzhub/integration-meilisearch";
import type {
  PlatformSearchExecutionProvider,
  PlatformSearchExecutionProviderRegistration,
  SearchCapabilities,
  SearchDiagnostics,
  SearchDocumentDeleteInput,
  SearchDocumentGetInput,
  SearchDocumentUpsertInput,
  SearchHealth,
  SearchIndex,
  SearchIndexCreateInput,
  SearchIndexUpdateInput,
  SearchIndexedDocument,
  SearchQuery,
  SearchQueryValidationResult,
  SearchRequestContext,
  SearchResultPage,
  SearchStatistics,
} from "@apzhub/search-contracts";
import {
  PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID,
  asSearchIndexId,
  asSearchProviderId,
  searchCapabilityUnsupported,
  searchDocumentNotFound,
  searchEngineOperationFailed,
  searchIndexNotFound,
  validateSearchQuery,
} from "@apzhub/search-contracts";

import {
  toProviderDocumentId,
  toPublicIndexId,
} from "./search-index-naming";

export type MeilisearchSearchProviderOptions = {
  readonly adapter: MeilisearchAdapter;
  readonly registration?: Partial<PlatformSearchExecutionProviderRegistration>;
  readonly now?: () => string;
};

const MEILI_CAPABILITIES: SearchCapabilities = {
  keywords: true,
  phrases: true,
  filters: true,
  sorting: true,
  pagination: true,
  facets: true,
  highlighting: true,
  suggestions: false,
  semantic: false,
  vector: false,
  fuzzy: false,
};

function mapIndexRecord(
  record: unknown,
  now: string,
): SearchIndex {
  const row = record as Readonly<Record<string, unknown>>;
  const uid = String(row.uid ?? row.name ?? "unknown");
  return {
    id: asSearchIndexId(toPublicIndexId(uid)),
    name: uid,
    state: "ready",
    providerKind: "meilisearch",
    declaredAt: now,
    updatedAt: now,
  };
}

function detectUnsupported(query: SearchQuery): string | undefined {
  const extended = query as SearchQuery & {
    readonly semantic?: boolean;
    readonly vector?: unknown;
    readonly fuzzy?: boolean;
    readonly ai?: boolean;
  };
  if (extended.semantic) return "semantic";
  if (extended.vector) return "vector";
  if (extended.fuzzy) return "fuzzy";
  if (extended.ai) return "ai";
  return undefined;
}

export class MeilisearchSearchProvider implements PlatformSearchExecutionProvider {
  readonly capabilityId = PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID;
  readonly registration: PlatformSearchExecutionProviderRegistration;
  readonly descriptor: PlatformSearchExecutionProvider["descriptor"];

  private readonly adapter: MeilisearchAdapter;
  private readonly now: () => string;

  constructor(options: MeilisearchSearchProviderOptions) {
    this.adapter = options.adapter;
    this.now = options.now ?? (() => new Date().toISOString());
    const id = asSearchProviderId(
      options.registration?.id ?? "prov_meilisearch_platform",
    );
    this.registration = {
      id,
      kind: "meilisearch",
      label: options.registration?.label ?? "Meilisearch (platform)",
      enabled: options.registration?.enabled ?? true,
      healthy: options.registration?.healthy ?? true,
      status: options.registration?.status ?? "ready",
      visibleTenantIds: options.registration?.visibleTenantIds,
      priority: options.registration?.priority ?? 100,
      profileIds: options.registration?.profileIds,
      collectionIds: options.registration?.collectionIds,
      sourceIds: options.registration?.sourceIds,
      tenantActive: options.registration?.tenantActive ?? true,
      platformActive: options.registration?.platformActive ?? true,
      capabilities: options.registration?.capabilities ?? MEILI_CAPABILITIES,
    };
    this.descriptor = {
      id,
      kind: MEILISEARCH_PROVIDER_KIND as "meilisearch",
      label: this.registration.label,
      enabled: this.registration.enabled,
    };
  }

  async query(
    context: SearchRequestContext,
    query: SearchQuery,
    options?: { readonly indexUid?: string },
  ): Promise<SearchResultPage> {
    const unsupported = detectUnsupported(query);
    if (unsupported) {
      throw searchCapabilityUnsupported(unsupported);
    }

    const result = await this.adapter.search(context, query, options?.indexUid);
    if (result.status === SEARCH_OPERATION_STATUS_OK) {
      return result.data;
    }
    if (result.status === "NOT_SUPPORTED") {
      throw searchCapabilityUnsupported(result.feature);
    }
    throw searchEngineOperationFailed(result.message, {
      code: result.code,
      category: result.category,
    });
  }

  validateQuery(
    _context: SearchRequestContext,
    query: SearchQuery,
  ): SearchQueryValidationResult {
    const unsupported = detectUnsupported(query);
    if (unsupported) {
      return {
        valid: false,
        issues: [
          {
            code: "CAPABILITY_UNSUPPORTED",
            message: `${unsupported} is not supported`,
            field: unsupported,
          },
        ],
      };
    }
    return validateSearchQuery(query);
  }

  async createIndex(
    context: SearchRequestContext,
    input: SearchIndexCreateInput & { readonly indexUid: string },
  ): Promise<SearchIndex> {
    const result = await this.adapter.operations.manageIndex(context, "create", {
      uid: input.indexUid,
      primaryKey: input.primaryKey ?? "id",
    });
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      throw searchEngineOperationFailed(result.message);
    }
    return mapIndexRecord(result.data, this.now());
  }

  async deleteIndex(
    context: SearchRequestContext,
    indexUid: string,
  ): Promise<void> {
    const result = await this.adapter.operations.manageIndex(context, "delete", {
      uid: indexUid,
    });
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      throw searchEngineOperationFailed(result.message);
    }
  }

  async getIndex(
    context: SearchRequestContext,
    indexUid: string,
  ): Promise<SearchIndex | null> {
    const result = await this.adapter.operations.manageIndex(context, "get", {
      uid: indexUid,
    });
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "ERROR") return null;
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      return null;
    }
    return mapIndexRecord(result.data, this.now());
  }

  async listIndexes(
    context: SearchRequestContext,
  ): Promise<readonly SearchIndex[]> {
    const result = await this.adapter.operations.manageIndex(context, "list");
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      throw searchEngineOperationFailed(result.message);
    }
    const rows = Array.isArray(result.data) ? result.data : [result.data];
    return rows.map((r) => mapIndexRecord(r, this.now()));
  }

  async updateIndex(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchIndexUpdateInput,
  ): Promise<SearchIndex> {
    const result = await this.adapter.operations.manageIndex(context, "update", {
      uid: indexUid,
      primaryKey: input.primaryKey ?? "id",
    });
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      if (result.status === "ERROR") {
        throw searchIndexNotFound(indexUid);
      }
      throw searchEngineOperationFailed("index update failed");
    }
    return mapIndexRecord(result.data, this.now());
  }

  async upsertDocuments(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentUpsertInput,
  ): Promise<{ readonly accepted: number; readonly taskRef?: string }> {
    const documents = input.documents.map((doc) => ({
      id: toProviderDocumentId(doc.id),
      tenantId: context.tenantId,
      ...(context.organisationId
        ? { organisationId: context.organisationId }
        : {}),
      ...doc.fields,
    }));
    const result = await this.adapter.operations.manageDocument(
      context,
      "upsert",
      { indexUid, documents },
    );
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      throw searchEngineOperationFailed(result.message);
    }
    const data = result.data as { readonly taskUid?: number };
    return {
      accepted: documents.length,
      taskRef: data.taskUid !== undefined ? String(data.taskUid) : undefined,
    };
  }

  async deleteDocument(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentDeleteInput,
  ): Promise<void> {
    const result = await this.adapter.operations.manageDocument(
      context,
      "delete",
      {
        indexUid,
        documentId: toProviderDocumentId(input.documentId),
      },
    );
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      throw searchEngineOperationFailed(result.message);
    }
  }

  async getDocument(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentGetInput,
  ): Promise<SearchIndexedDocument | null> {
    const result = await this.adapter.operations.manageDocument(context, "get", {
      indexUid,
      documentId: toProviderDocumentId(input.documentId),
    });
    if (result.status !== SEARCH_OPERATION_STATUS_OK) {
      if (result.status === "ERROR") {
        throw searchDocumentNotFound(input.documentId);
      }
      if (result.status === "NOT_SUPPORTED") {
        throw searchCapabilityUnsupported(result.feature);
      }
      return null;
    }
    const fields = result.data as Readonly<Record<string, unknown>>;
    return {
      id: String(fields.id ?? input.documentId),
      indexId: toPublicIndexId(String(input.collectionId)),
      fields,
    };
  }

  async getHealth(context: SearchRequestContext): Promise<SearchHealth> {
    const probe = await this.adapter.operations.probeHealth(context);
    if (probe.status === SEARCH_OPERATION_STATUS_OK) {
      return probe.data.search;
    }
    return {
      status: "unavailable",
      message: "message" in probe ? probe.message : "Meilisearch health probe failed",
      checkedAt: this.now(),
    };
  }

  async getDiagnostics(context: SearchRequestContext): Promise<SearchDiagnostics> {
    const [health, capabilities, statistics] = await Promise.all([
      this.getHealth(context),
      Promise.resolve(this.getCapabilities(context)),
      this.getStatistics(context),
    ]);
    const diag = await this.adapter.operations.collectDiagnostics(context);
    const notes: string[] = [
      `adapterVersion=${MEILISEARCH_ADAPTER_VERSION}`,
      `capability=${PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID}`,
    ];
    if (diag.status === SEARCH_OPERATION_STATUS_OK) {
      const engineVersion = diag.data.statistics?.engineVersion;
      if (engineVersion) notes.push(`engineVersion=${engineVersion}`);
      notes.push(...diag.data.notes);
    }
    return {
      health,
      capabilities,
      statistics,
      configurationSummary: {
        defaultPageSize: 20,
        maxPageSize: 100,
        enforceTenantIsolation: true,
        enforcePermissionFilter: true,
      },
      notes,
    };
  }

  async getStatistics(context: SearchRequestContext): Promise<SearchStatistics> {
    const result = await this.adapter.operations.readStatistics(context);
    if (result.status === SEARCH_OPERATION_STATUS_OK) {
      return result.data as SearchStatistics;
    }
    return {
      declaredIndexCount: 0,
      declaredProviderCount: 1,
      declaredCollectionCount: 0,
      declaredSourceCount: 0,
    };
  }

  getCapabilities(_context: SearchRequestContext): SearchCapabilities {
    return this.registration.capabilities;
  }

  async dispose(): Promise<void> {
    await this.adapter.dispose("shutdown");
  }
}
