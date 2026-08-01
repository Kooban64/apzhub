/**
 * Evidence list/search enumeration ACL — APZQEP-120-S01 / L-EM-01.
 *
 * S02: thin compatibility layer over EvidencePermissionEngine + EvidenceQueryBuilder.
 * Prefer EvidenceEnumerationService for new call sites.
 */

import type { Page, PageRequest } from "../../domain/ports/repositories";
import type { EvidenceDto } from "../dto/evidence-dto";
import type { EvidenceRequestContext } from "../context";
import {
  createEvidencePermissionEngine,
  createEvidenceQueryBuilder,
  EVIDENCE_QUERY_SORT_FIELDS,
} from "../query";
import type { EvidenceSecurityGate } from "./security-gate";

export const EVIDENCE_ENUMERATION_SORT_FIELDS = EVIDENCE_QUERY_SORT_FIELDS;

export type EvidenceEnumerationSortField =
  (typeof EVIDENCE_ENUMERATION_SORT_FIELDS)[number];

export type EvidenceEnumerationSort = {
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

const queryBuilder = createEvidenceQueryBuilder();

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
  const engine = createEvidencePermissionEngine(gate);
  return engine.filterVisible(ctx, items);
}

export function sortEvidenceEnumeration(
  items: readonly EvidenceDto[],
  options: EvidenceEnumerationSort = {},
): EvidenceDto[] {
  const plan = queryBuilder.buildEnumerationPlan({
    sort: options.sort,
    order: options.order,
  });
  return queryBuilder.sort(items, plan.sort, plan.order);
}

export function paginateEvidenceEnumeration(
  items: readonly EvidenceDto[],
  page?: PageRequest,
): Page<EvidenceDto> {
  return queryBuilder.paginate(items, page);
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
