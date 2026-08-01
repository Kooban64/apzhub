/**
 * Evidence Query Builder — APZQEP-120-S02.
 *
 * Validates and merges structural filters, text search, sort, and pagination.
 * Operates on in-memory candidate sets today (ADR-0088 / S03 durable SoR later).
 * Does not embed ACL — Permission Engine owns visibility.
 */

import type {
  EvidenceListFilter,
  Page,
  PageRequest,
} from "../../domain/ports/repositories";
import { EvidenceApplicationValidationError } from "../../shared/errors";
import type { EvidenceDto } from "../dto/evidence-dto";

export const EVIDENCE_QUERY_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "id",
  "status",
] as const;

export type EvidenceQuerySortField = (typeof EVIDENCE_QUERY_SORT_FIELDS)[number];

/** Align with platform HTTP max page limit. */
export const EVIDENCE_QUERY_MAX_LIMIT = 100;
export const EVIDENCE_QUERY_MAX_OFFSET = 100_000;
export const EVIDENCE_QUERY_MAX_TEXT_LENGTH = 256;

export type EvidenceEnumerationQueryInput = {
  readonly filter?: EvidenceListFilter;
  readonly text?: string;
  readonly page?: PageRequest;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

export type EvidenceEnumerationQueryPlan = {
  readonly filter: EvidenceListFilter;
  readonly text?: string;
  readonly sort: EvidenceQuerySortField;
  readonly order: "asc" | "desc";
  readonly page: { readonly limit?: number; readonly offset: number };
};

export type EvidenceQueryBuilder = {
  readonly builderId: "EvidenceQueryBuilder";
  /**
   * Validate and normalise enumeration query. Throws validation on unsafe input.
   */
  buildEnumerationPlan(
    input: EvidenceEnumerationQueryInput,
  ): EvidenceEnumerationQueryPlan;
  /**
   * Apply free-text search over DTO fields (title, description, tags, id).
   */
  applyTextSearch(
    items: readonly EvidenceDto[],
    text: string | undefined,
  ): EvidenceDto[];
  /**
   * Apply structural filters that may not have been pushed to the repository.
   */
  applyStructuralFilters(
    items: readonly EvidenceDto[],
    filter: EvidenceListFilter,
  ): EvidenceDto[];
  sort(
    items: readonly EvidenceDto[],
    sort: EvidenceQuerySortField,
    order: "asc" | "desc",
  ): EvidenceDto[];
  paginate(
    items: readonly EvidenceDto[],
    page: PageRequest | undefined,
  ): Page<EvidenceDto>;
};

function assertSafeIdentifier(field: string, value: string | undefined): void {
  if (value === undefined) {
    return;
  }
  if (!value.trim()) {
    throw new EvidenceApplicationValidationError(`Invalid ${field}: empty`, {
      field,
      reason: "empty_identifier",
    });
  }
  if (value.length > 128) {
    throw new EvidenceApplicationValidationError(`Invalid ${field}: too long`, {
      field,
      reason: "identifier_too_long",
    });
  }
  // Block trivial injection / path metacharacters in filter identifiers.
  if (/[;'"\\]|--|\/\*|\*\//.test(value)) {
    throw new EvidenceApplicationValidationError(
      `Invalid ${field}: disallowed characters`,
      {
        field,
        reason: "unsafe_identifier",
      },
    );
  }
}

export function createEvidenceQueryBuilder(): EvidenceQueryBuilder {
  return {
    builderId: "EvidenceQueryBuilder",

    buildEnumerationPlan(input) {
      const filter = input.filter ?? {};
      assertSafeIdentifier("projectId", filter.projectId);
      assertSafeIdentifier("workspaceId", filter.workspaceId);
      assertSafeIdentifier("ownerId", filter.ownerId);
      assertSafeIdentifier("classification", filter.classification);

      if (input.text !== undefined) {
        const trimmed = input.text.trim();
        if (!trimmed) {
          throw new EvidenceApplicationValidationError("Invalid text: empty", {
            field: "text",
            reason: "empty_text",
          });
        }
        if (trimmed.length > EVIDENCE_QUERY_MAX_TEXT_LENGTH) {
          throw new EvidenceApplicationValidationError("Invalid text: too long", {
            field: "text",
            reason: "text_too_long",
          });
        }
      }

      if (input.sort !== undefined && input.sort !== "") {
        if (!(EVIDENCE_QUERY_SORT_FIELDS as readonly string[]).includes(input.sort)) {
          throw new EvidenceApplicationValidationError("Invalid sort field", {
            field: "sort",
            reason: "unknown_sort_field",
            allowed: EVIDENCE_QUERY_SORT_FIELDS,
          });
        }
      }

      if (
        input.order !== undefined &&
        input.order !== "asc" &&
        input.order !== "desc"
      ) {
        throw new EvidenceApplicationValidationError("Invalid order", {
          field: "order",
          reason: "invalid_order",
        });
      }

      const offset = input.page?.offset ?? 0;
      const limit = input.page?.limit;
      if (
        !Number.isInteger(offset) ||
        offset < 0 ||
        offset > EVIDENCE_QUERY_MAX_OFFSET
      ) {
        throw new EvidenceApplicationValidationError("Invalid pagination offset", {
          field: "offset",
          reason: "invalid_offset",
        });
      }
      if (limit !== undefined) {
        if (!Number.isInteger(limit) || limit < 1 || limit > EVIDENCE_QUERY_MAX_LIMIT) {
          throw new EvidenceApplicationValidationError("Invalid pagination limit", {
            field: "limit",
            reason: "invalid_limit",
            max: EVIDENCE_QUERY_MAX_LIMIT,
          });
        }
      }

      return {
        filter,
        text: input.text?.trim(),
        sort: (input.sort as EvidenceQuerySortField | undefined) ?? "createdAt",
        order: input.order ?? "desc",
        page: { limit, offset },
      };
    },

    applyTextSearch(items, text) {
      const needle = text?.trim().toLowerCase();
      if (!needle) {
        return [...items];
      }
      return items.filter((item) => {
        const haystack = [
          item.title ?? "",
          item.description ?? "",
          ...item.tags,
          item.id,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      });
    },

    applyStructuralFilters(items, filter) {
      let result = [...items];
      if (filter.projectId) {
        result = result.filter((item) => item.projectId === filter.projectId);
      }
      if (filter.workspaceId) {
        result = result.filter((item) => item.workspaceId === filter.workspaceId);
      }
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        result = result.filter((item) => statuses.includes(item.status));
      }
      if (filter.classification) {
        result = result.filter((item) => item.classification === filter.classification);
      }
      if (filter.ownerId) {
        result = result.filter((item) => item.ownerId === filter.ownerId);
      }
      if (filter.legalHold !== undefined) {
        result = result.filter((item) => item.legalHold === filter.legalHold);
      }
      return result;
    },

    sort(items, sort, order) {
      const direction = order === "desc" ? -1 : 1;
      return [...items].sort((a, b) => {
        const left = a[sort] ?? "";
        const right = b[sort] ?? "";
        if (left < right) {
          return -1 * direction;
        }
        if (left > right) {
          return 1 * direction;
        }
        return a.id < b.id ? -1 * direction : a.id > b.id ? 1 * direction : 0;
      });
    },

    paginate(items, page) {
      const offset = page?.offset ?? 0;
      const limit = page?.limit ?? items.length;
      return {
        items: items.slice(offset, offset + limit),
        total: items.length,
        limit,
        offset,
      };
    },
  };
}
