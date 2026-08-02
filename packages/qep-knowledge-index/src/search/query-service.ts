/**
 * Search Query Service — consumes projections only (never business services).
 */

import type { KnowledgeEntityKind, KnowledgeIndexDocument } from "../domain/types";
import type { ProjectionRepository } from "../projection/repository";

export type SearchSortField = "updatedAt" | "title" | "relevance";
export type SearchSortDirection = "asc" | "desc";

export type KnowledgeSearchRequest = {
  readonly query?: string;
  readonly tenantId: string;
  readonly entityKinds?: readonly KnowledgeEntityKind[];
  readonly tags?: readonly string[];
  readonly classification?: string;
  readonly lifecycleState?: string;
  readonly integrityState?: string;
  readonly status?: KnowledgeIndexDocument["status"];
  readonly sortBy?: SearchSortField;
  readonly sortDirection?: SearchSortDirection;
  readonly page?: number;
  readonly pageSize?: number;
};

export type KnowledgeSearchHit = {
  readonly document: KnowledgeIndexDocument;
  readonly score: number;
  readonly highlights: readonly string[];
};

export type KnowledgeSearchResponse = {
  readonly hits: readonly KnowledgeSearchHit[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly projectionOnly: true;
};

export type KnowledgeSearchService = {
  search(request: KnowledgeSearchRequest): Promise<KnowledgeSearchResponse>;
  getProjection(options: {
    readonly tenantId: string;
    readonly entityKind: KnowledgeEntityKind;
    readonly entityId: string;
  }): Promise<KnowledgeIndexDocument | undefined>;
};

function rankDocument(
  doc: KnowledgeIndexDocument,
  query: string | undefined,
): { readonly score: number; readonly highlights: string[] } {
  if (!query || query.trim().length === 0) {
    return { score: 1, highlights: [] };
  }
  const q = query.toLowerCase();
  const highlights: string[] = [];
  let score = 0;
  const fields: Array<[string, string]> = [
    ["title", doc.title],
    ["summary", doc.summary],
    ["entityId", doc.entityId],
    ...doc.keywords.map((k) => ["keyword", k] as [string, string]),
    ...doc.tags.map((t) => ["tag", t] as [string, string]),
  ];
  for (const [field, value] of fields) {
    const lower = value.toLowerCase();
    if (lower === q) {
      score += 10;
      highlights.push(field);
    } else if (lower.includes(q)) {
      score += 5;
      highlights.push(field);
    }
  }
  return { score, highlights: [...new Set(highlights)] };
}

export function createKnowledgeSearchService(
  repository: ProjectionRepository,
): KnowledgeSearchService {
  return {
    async search(request) {
      const page = Math.max(1, request.page ?? 1);
      const pageSize = Math.min(100, Math.max(1, request.pageSize ?? 20));
      let docs = await repository.list({ tenantId: request.tenantId });

      if (request.entityKinds?.length) {
        const set = new Set(request.entityKinds);
        docs = docs.filter((d) => set.has(d.entityKind));
      }
      if (request.tags?.length) {
        docs = docs.filter((d) => request.tags!.every((t) => d.tags.includes(t)));
      }
      if (request.classification) {
        docs = docs.filter((d) => d.classification === request.classification);
      }
      if (request.lifecycleState) {
        docs = docs.filter((d) => d.lifecycleState === request.lifecycleState);
      }
      if (request.integrityState) {
        docs = docs.filter((d) => d.integrityState === request.integrityState);
      }
      if (request.status) {
        docs = docs.filter((d) => d.status === request.status);
      }

      let hits: KnowledgeSearchHit[] = docs.map((document) => {
        const ranked = rankDocument(document, request.query);
        return {
          document,
          score: ranked.score,
          highlights: ranked.highlights,
        };
      });

      if (request.query?.trim()) {
        hits = hits.filter((h) => h.score > 0);
      }

      const sortBy = request.sortBy ?? (request.query ? "relevance" : "updatedAt");
      const dir = request.sortDirection === "asc" ? 1 : -1;
      hits = [...hits].sort((a, b) => {
        if (sortBy === "relevance") return (b.score - a.score) * (dir === -1 ? 1 : -1);
        if (sortBy === "title") {
          return a.document.title.localeCompare(b.document.title) * dir;
        }
        return a.document.updatedAt.localeCompare(b.document.updatedAt) * dir;
      });

      const total = hits.length;
      const start = (page - 1) * pageSize;
      return {
        hits: hits.slice(start, start + pageSize),
        total,
        page,
        pageSize,
        projectionOnly: true,
      };
    },

    async getProjection(options) {
      return repository.get(options);
    },
  };
}
