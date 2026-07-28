import type { TestSpecification } from "../../domain/test-specification/test-specification";
import type {
  StoredTestSpecification,
  TestSpecificationListQuery,
} from "../../domain/test-specification/specification-repository";

export function toStoredTestSpecification(
  specification: TestSpecification,
): StoredTestSpecification {
  const { domainEvents: _events, ...rest } = specification;
  return {
    ...rest,
    domainEvents: [],
  };
}

function matchesQueryText(row: StoredTestSpecification, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [row.record.title, row.record.number, ...row.record.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

export function matchesListFilters(
  row: StoredTestSpecification,
  query: TestSpecificationListQuery,
): boolean {
  if (query.status && row.record.status !== query.status) return false;
  if (query.type && row.record.type !== query.type) return false;
  if (query.owner && row.record.owner !== query.owner) return false;
  if (query.classification && row.record.classification !== query.classification) {
    return false;
  }
  if (query.priority && row.record.priority !== query.priority) return false;
  if (query.number && row.record.number !== query.number) return false;
  if (
    query.isAuthoritative !== undefined &&
    row.record.isAuthoritative !== query.isAuthoritative
  ) {
    return false;
  }
  if (query.query && !matchesQueryText(row, query.query)) return false;
  return true;
}
