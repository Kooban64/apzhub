/** Meilisearch REST API response shapes (internal). */

export interface MeilisearchHealthRecord {
  readonly status: string;
}

export interface MeilisearchVersionRecord {
  readonly commitSha?: string;
  readonly commitDate?: string;
  readonly pkgVersion: string;
}

export interface MeilisearchStatsRecord {
  readonly databaseSize?: number;
  readonly lastUpdate?: string;
  readonly indexes?: Readonly<
    Record<
      string,
      {
        readonly numberOfDocuments?: number;
        readonly isIndexing?: boolean;
        readonly fieldDistribution?: Readonly<Record<string, number>>;
      }
    >
  >;
}

export interface MeilisearchIndexRecord {
  readonly uid: string;
  readonly primaryKey?: string | null;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface MeilisearchIndexesListResponse {
  readonly results: readonly MeilisearchIndexRecord[];
  readonly offset?: number;
  readonly limit?: number;
  readonly total?: number;
}

export interface MeilisearchTaskRecord {
  readonly taskUid: number;
  readonly indexUid?: string | null;
  readonly status: string;
  readonly type: string;
  readonly enqueuedAt?: string;
}

export interface MeilisearchSearchHit {
  readonly id?: string | number;
  readonly [key: string]: unknown;
}

export interface MeilisearchSearchResponse {
  readonly hits: readonly MeilisearchSearchHit[];
  readonly query?: string;
  readonly processingTimeMs?: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly estimatedTotalHits?: number;
  readonly totalHits?: number;
  readonly facetDistribution?: Readonly<
    Record<string, Readonly<Record<string, number>>>
  >;
  readonly facetStats?: Readonly<Record<string, unknown>>;
}

export interface MeilisearchSearchRequestBody {
  readonly q?: string;
  readonly offset?: number;
  readonly limit?: number;
  readonly filter?: string | readonly string[];
  readonly sort?: readonly string[];
  readonly facets?: readonly string[];
  readonly attributesToHighlight?: readonly string[];
  readonly highlightPreTag?: string;
  readonly highlightPostTag?: string;
  readonly attributesToRetrieve?: readonly string[];
}

export interface MeilisearchErrorBody {
  readonly message?: string;
  readonly code?: string;
  readonly type?: string;
  readonly link?: string;
}
