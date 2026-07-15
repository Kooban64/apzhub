import type {
  CertificationEvidenceLinks,
  CertificationStatus,
} from "@apzhub/testing-contracts";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";
import { assertCertificationTransition } from "./state-machine";

export function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new DomainRuleError("validation_error", `${field} is required`, { field });
  }
}

export function assertHasPermission(
  ctx: ServiceRequestContext,
  permission: string,
): void {
  const perms = ctx.permissions ?? [];
  const ok = perms.some(
    (p) =>
      p === permission ||
      p === "certification.admin" ||
      p === "certification.*" ||
      (p.endsWith(".*") && permission.startsWith(p.slice(0, -1))),
  );
  if (!ok) {
    throw new DomainRuleError(
      "permission_denied",
      `Missing permission ${permission}`,
      { permission },
    );
  }
}

export function assertTenantOrganisationMatch(
  ctx: ServiceRequestContext,
  record: { readonly tenantId: string; readonly organisationId?: string },
): void {
  if (record.tenantId !== ctx.tenantId) {
    throw new DomainRuleError("tenant_mismatch", "Tenant mismatch", {
      expected: ctx.tenantId,
      actual: record.tenantId,
    });
  }
  if (
    ctx.organisationId &&
    record.organisationId &&
    record.organisationId !== ctx.organisationId
  ) {
    throw new DomainRuleError("organisation_mismatch", "Organisation mismatch", {
      expected: ctx.organisationId,
      actual: record.organisationId,
    });
  }
}

export function assertTransitionValidated(
  from: CertificationStatus,
  to: CertificationStatus,
  options?: { readonly allowOverride?: boolean },
): void {
  assertCertificationTransition(from, to, options);
}

export function emptyEvidenceLinks(): CertificationEvidenceLinks {
  return {
    requirementIds: [],
    planIds: [],
    suiteIds: [],
    caseIds: [],
    executionIds: [],
    evidenceIds: [],
    coverageIds: [],
    defectIds: [],
    riskIds: [],
    readinessSummaryIds: [],
    qualitySummaryIds: [],
  };
}

export function mergeEvidenceLinks(
  base: CertificationEvidenceLinks | undefined,
  patch: Partial<CertificationEvidenceLinks>,
  mode: "link" | "unlink",
): CertificationEvidenceLinks {
  const current = base ?? emptyEvidenceLinks();
  const keys = Object.keys(emptyEvidenceLinks()) as (keyof CertificationEvidenceLinks)[];
  const next = { ...current };
  for (const key of keys) {
    const incoming = patch[key];
    if (!incoming) continue;
    if (mode === "link") {
      next[key] = [...new Set([...current[key], ...incoming])];
    } else {
      const remove = new Set(incoming);
      next[key] = current[key].filter((id) => !remove.has(id));
    }
  }
  return next;
}

export function evidenceLinksFromJson(
  json: Readonly<Record<string, unknown>> | undefined,
): CertificationEvidenceLinks {
  const empty = emptyEvidenceLinks();
  if (!json) return empty;
  const asIds = (value: unknown): readonly string[] =>
    Array.isArray(value) ? value.map(String) : [];
  return {
    requirementIds: asIds(json.requirementIds),
    planIds: asIds(json.planIds),
    suiteIds: asIds(json.suiteIds),
    caseIds: asIds(json.caseIds),
    executionIds: asIds(json.executionIds),
    evidenceIds: asIds(json.evidenceIds),
    coverageIds: asIds(json.coverageIds),
    defectIds: asIds(json.defectIds),
    riskIds: asIds(json.riskIds),
    readinessSummaryIds: asIds(json.readinessSummaryIds),
    qualitySummaryIds: asIds(json.qualitySummaryIds),
  };
}

/** Boundary tokens that must never appear as auto-approve / AI decision paths. */
export const FORBIDDEN_CERTIFICATION_AUTOMATION_TOKENS = [
  "autoApprove",
  "auto_approve",
  "aiApprove",
  "ai_decide",
  "automaticApproval",
] as const;
