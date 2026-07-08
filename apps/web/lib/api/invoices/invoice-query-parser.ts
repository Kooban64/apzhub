import type { InvoiceListCriteria } from "@apzhub/law-platform/api";

import {
  compareStrings,
  getEnumFilter,
  paginateItems,
  parseFiltering,
  parsePagination,
  parseSorting,
  sortItems,
} from "../framework";

export interface InvoiceListQuery {
  readonly criteria: InvoiceListCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

/** Parse list query parameters for GET /invoices (LAW-014-06). */
export function parseInvoiceListQuery(searchParams: URLSearchParams): InvoiceListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, {
    queryParam: "query",
    enumParams: ["invoiceStatus"],
  });

  return {
    criteria: {
      query: filters.query,
      clientId: searchParams.get("clientId")?.trim() || undefined,
      matterId: searchParams.get("matterId")?.trim() || undefined,
      invoiceStatus: getEnumFilter(
        filters,
        "invoiceStatus",
      ) as InvoiceListCriteria["invoiceStatus"],
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["issueDate"] }),
  };
}

export function sortInvoicesForApi<
  T extends {
    issueDate: string;
    invoiceReference: string;
    invoiceStatus: string;
    createdAt?: string;
  },
>(invoices: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    invoices,
    sortFields,
    {
      issueDate: (left, right) => compareStrings(left.issueDate, right.issueDate),
      invoiceReference: (left, right) =>
        compareStrings(left.invoiceReference, right.invoiceReference),
      invoiceStatus: (left, right) =>
        compareStrings(left.invoiceStatus, right.invoiceStatus),
    },
    ["issueDate"],
  );
}

export function paginateInvoiceSummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
