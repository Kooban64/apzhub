/**
 * Evidence list/search enumeration ACL — APZQEP-120-S01 / L-EM-01.
 *
 * Operation-level authorize still gates list/search (qep.evidence.read).
 * This module applies the same per-item visibility rules as getEvidence
 * before results are returned, then sorts and paginates the visible set
 * so totals/pages cannot leak unauthorized rows.
 */

import type { Page, PageRequest } from "../../domain/ports/repositories";
import type { EvidenceDto } from "../dto/evidence-dto";
import type { EvidenceRequestContext } from "../context";
import type { EvidenceSecurityGate } from "./security-gate";
import { decisionGrantsAccess } from "./types";

export const EVIDENCE_ENUMERATION_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "id",
  "status",
] as const;

export type EvidenceEnumerationSortField =
  (typeof EVIDENCE_ENUMERATION_SORT_FIELDS)[number];

export type EvidenceEnumerationSort = {
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

function isAdmin(ctx: EvidenceRequestContext): boolean {
  return (ctx.permissions ?? []).includes("qep.evidence.admin");
}

function normalizeSortField(sort?: string): EvidenceEnumerationSortField {
  if (sort && (EVIDENCE_ENUMERATION_SORT_FIELDS as readonly string[]).includes(sort)) {
    return sort as EvidenceEnumerationSortField;
  }
  return "createdAt";
}

function compareEvidence(
  a: EvidenceDto,
  b: EvidenceDto,
  field: EvidenceEnumerationSortField,
  order: "asc" | "desc",
): number {
  const direction = order === "desc" ? -1 : 1;
  const left = a[field] ?? "";
  const right = b[field] ?? "";
  if (left < right) {
    return -1 * direction;
  }
  if (left > right) {
    return 1 * direction;
  }
  return a.id < b.id ? -1 * direction : a.id > b.id ? 1 * direction : 0;
}

/**
 * Filter evidence rows to those the principal may getEvidence.
 * Admin short-circuits (tenant scope already applied by repository).
 * Fail-closed: unavailable/indeterminate/denied ⇒ omit from results.
 */
export async function filterEvidenceByReadAcl(
  ctx: EvidenceRequestContext,
  gate: EvidenceSecurityGate,
  items: readonly EvidenceDto[],
): Promise<EvidenceDto[]> {
  // Defence in depth: never return rows outside the caller's tenant.
  const tenantScoped = items.filter((item) => item.tenantId === ctx.tenantId);

  if (isAdmin(ctx)) {
    return tenantScoped;
  }

  const visible: EvidenceDto[] = [];
  for (const item of tenantScoped) {
    const decision = await gate.evaluate(ctx, "getEvidence", {
      evidenceId: item.id,
    });
    if (decisionGrantsAccess(decision)) {
      visible.push(item);
    }
  }
  return visible;
}

export function sortEvidenceEnumeration(
  items: readonly EvidenceDto[],
  options: EvidenceEnumerationSort = {},
): EvidenceDto[] {
  const field = normalizeSortField(options.sort);
  const order = options.order ?? "desc";
  return [...items].sort((a, b) => compareEvidence(a, b, field, order));
}

export function paginateEvidenceEnumeration(
  items: readonly EvidenceDto[],
  page?: PageRequest,
): Page<EvidenceDto> {
  const offset = page?.offset ?? 0;
  const limit = page?.limit ?? items.length;
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}

export async function applyEnumerationAcl(
  ctx: EvidenceRequestContext,
  gate: EvidenceSecurityGate,
  items: readonly EvidenceDto[],
  page: PageRequest | undefined,
  sort: EvidenceEnumerationSort = {},
): Promise<Page<EvidenceDto>> {
  const visible = await filterEvidenceByReadAcl(ctx, gate, items);
  const sorted = sortEvidenceEnumeration(visible, sort);
  return paginateEvidenceEnumeration(sorted, page);
}
