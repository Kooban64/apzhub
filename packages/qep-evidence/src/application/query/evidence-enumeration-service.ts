/**
 * Permission-aware Evidence enumeration — APZQEP-120-S02.
 *
 * Single orchestration path for list + search:
 *   authorize → load candidates → Permission Engine → Query Builder → page
 *
 * Controllers / platform services must not construct ACL filters themselves.
 */

import type { Page } from "../../domain/ports/repositories";
import type { EvidenceDto } from "../dto/evidence-dto";
import type { EvidenceRequestContext } from "../context";
import type { ListEvidenceQuery, SearchEvidenceQuery } from "../queries/types";
import type { EvidenceQueryService } from "../services/evidence-query-service";
import type { SecurityAuditService } from "../security/security-audit";
import { EvidenceApplicationValidationError } from "../../shared/errors";
import type { EvidencePermissionEngine } from "./permission-engine";
import type { EvidenceQueryBuilder } from "./query-builder";

export type EvidenceEnumerationService = {
  readonly serviceId: "EvidenceEnumerationService";
  list(
    ctx: EvidenceRequestContext,
    query: ListEvidenceQuery,
  ): Promise<Page<EvidenceDto>>;
  search(
    ctx: EvidenceRequestContext,
    query: SearchEvidenceQuery,
  ): Promise<Page<EvidenceDto>>;
};

export function createEvidenceEnumerationService(deps: {
  readonly inner: EvidenceQueryService;
  readonly permissions: EvidencePermissionEngine;
  readonly queryBuilder: EvidenceQueryBuilder;
  readonly securityAudit?: SecurityAuditService;
}): EvidenceEnumerationService {
  async function run(
    ctx: EvidenceRequestContext,
    operation: "listEvidence" | "searchEvidence",
    input: {
      readonly filter?: ListEvidenceQuery["filter"];
      readonly text?: string;
      readonly page?: ListEvidenceQuery["page"];
      readonly sort?: string;
      readonly order?: "asc" | "desc";
    },
  ): Promise<Page<EvidenceDto>> {
    await deps.permissions.authorizeEnumeration(ctx, operation);

    let plan;
    try {
      plan = deps.queryBuilder.buildEnumerationPlan({
        filter: input.filter,
        text: input.text,
        page: input.page,
        sort: input.sort,
        order: input.order,
      });
    } catch (error) {
      if (error instanceof EvidenceApplicationValidationError && deps.securityAudit) {
        await deps.securityAudit.recordSecurityEvent(ctx, {
          operation,
          outcome: "denied",
          reason: "invalid_query",
          details: {
            validation: error.details ?? { message: error.message },
          },
        });
      }
      throw error;
    }

    // Repository path: tenant-scoped structural filter; never page before ACL.
    const candidates =
      operation === "searchEvidence"
        ? await deps.inner.searchEvidence(ctx, {
            kind: "searchEvidence",
            filter: plan.filter,
            text: plan.text,
            page: undefined,
          })
        : await deps.inner.listEvidence(ctx, {
            kind: "listEvidence",
            filter: plan.filter,
            page: undefined,
          });

    // Defence: re-apply text/structural in builder (search already text-filters
    // in inner; list may rely on repo filters). Harmless idempotent pass.
    let working = deps.queryBuilder.applyStructuralFilters(
      candidates.items,
      plan.filter,
    );
    if (operation === "searchEvidence") {
      working = deps.queryBuilder.applyTextSearch(working, plan.text);
    }

    const visible = await deps.permissions.filterVisible(ctx, working);
    const sorted = deps.queryBuilder.sort(visible, plan.sort, plan.order);
    return deps.queryBuilder.paginate(sorted, plan.page);
  }

  return {
    serviceId: "EvidenceEnumerationService",
    list(ctx, query) {
      return run(ctx, "listEvidence", query);
    },
    search(ctx, query) {
      return run(ctx, "searchEvidence", query);
    },
  };
}
