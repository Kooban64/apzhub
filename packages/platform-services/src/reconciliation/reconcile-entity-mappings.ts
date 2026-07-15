import type { EntityMappingStore } from "../mapping/entity-mapping-store";
import type { CanonicalEntityType, EntityMappingRecord } from "../mapping/types";

export type ReconciliationIssueKind =
  | "provider_entity_missing_mapping"
  | "mapping_missing_provider_entity"
  | "duplicate_provider_mapping"
  | "inactive_provider_with_active_mapping"
  | "entity_type_mismatch";

export interface ReconciliationIssue {
  readonly kind: ReconciliationIssueKind;
  readonly severity: "warning" | "error";
  readonly message: string;
  readonly platformId?: string;
  readonly providerNativeId?: string;
  readonly entityType?: CanonicalEntityType;
  readonly providerId?: string;
  readonly integrationId?: string;
  readonly details?: Readonly<Record<string, string>>;
}

export interface ReconciliationReport {
  readonly generatedAt: string;
  readonly tenantId?: string;
  readonly issueCount: number;
  readonly issues: readonly ReconciliationIssue[];
}

export interface ProviderEntitySnapshot {
  readonly entityType: CanonicalEntityType;
  readonly providerId: string;
  readonly integrationId: string;
  readonly providerNativeId: string;
  readonly tenantId: string;
}

export interface ReconciliationInput {
  readonly store: EntityMappingStore;
  readonly tenantId?: string;
  /** Known provider entities (from a provider inventory snapshot). */
  readonly providerEntities?: readonly ProviderEntitySnapshot[];
  /** Provider IDs considered inactive / disabled. */
  readonly inactiveProviderIds?: readonly string[];
}

/**
 * Lightweight reconciliation detector — no scheduler or automated repair.
 * Produces an in-memory report of mapping inconsistencies.
 */
export async function reconcileEntityMappings(
  input: ReconciliationInput,
): Promise<ReconciliationReport> {
  const issues: ReconciliationIssue[] = [];
  const mappings = await input.store.list(
    input.tenantId ? { tenantId: input.tenantId } : undefined,
  );

  detectDuplicateProviderMappings(mappings, issues);
  detectInactiveProviderMappings(mappings, input.inactiveProviderIds ?? [], issues);

  if (input.providerEntities) {
    detectMissingMappings(input.providerEntities, mappings, issues);
    detectOrphanMappings(input.providerEntities, mappings, issues);
  }

  return {
    generatedAt: new Date().toISOString(),
    tenantId: input.tenantId,
    issueCount: issues.length,
    issues,
  };
}

function detectDuplicateProviderMappings(
  mappings: readonly EntityMappingRecord[],
  issues: ReconciliationIssue[],
): void {
  const seen = new Map<string, EntityMappingRecord>();

  for (const mapping of mappings) {
    if (mapping.status !== "active" && mapping.status !== "pending") {
      continue;
    }

    const key = `${mapping.tenantId}|${mapping.entityType}|${mapping.providerId}|${mapping.providerNativeId}`;
    const prior = seen.get(key);
    if (prior) {
      issues.push({
        kind: "duplicate_provider_mapping",
        severity: "error",
        message: "Duplicate active mappings for the same provider-native ID",
        platformId: mapping.platformId,
        providerNativeId: mapping.providerNativeId,
        entityType: mapping.entityType,
        providerId: mapping.providerId,
        details: { otherPlatformId: prior.platformId },
      });
    } else {
      seen.set(key, mapping);
    }
  }
}

function detectInactiveProviderMappings(
  mappings: readonly EntityMappingRecord[],
  inactiveProviderIds: readonly string[],
  issues: ReconciliationIssue[],
): void {
  if (inactiveProviderIds.length === 0) {
    return;
  }

  const inactive = new Set(inactiveProviderIds);
  for (const mapping of mappings) {
    if (mapping.status === "active" && inactive.has(mapping.providerId)) {
      issues.push({
        kind: "inactive_provider_with_active_mapping",
        severity: "warning",
        message: "Active mapping references an inactive provider",
        platformId: mapping.platformId,
        providerId: mapping.providerId,
        entityType: mapping.entityType,
        providerNativeId: mapping.providerNativeId,
      });
    }
  }
}

function detectMissingMappings(
  providerEntities: readonly ProviderEntitySnapshot[],
  mappings: readonly EntityMappingRecord[],
  issues: ReconciliationIssue[],
): void {
  const mapped = new Set(
    mappings
      .filter((m) => m.status === "active" || m.status === "pending")
      .map(
        (m) =>
          `${m.tenantId}|${m.entityType}|${m.providerId}|${m.providerNativeId}`,
      ),
  );

  for (const entity of providerEntities) {
    const key = `${entity.tenantId}|${entity.entityType}|${entity.providerId}|${entity.providerNativeId}`;
    if (!mapped.has(key)) {
      issues.push({
        kind: "provider_entity_missing_mapping",
        severity: "warning",
        message: "Provider entity exists without a platform mapping",
        providerNativeId: entity.providerNativeId,
        entityType: entity.entityType,
        providerId: entity.providerId,
        integrationId: entity.integrationId,
      });
    }
  }
}

function detectOrphanMappings(
  providerEntities: readonly ProviderEntitySnapshot[],
  mappings: readonly EntityMappingRecord[],
  issues: ReconciliationIssue[],
): void {
  const known = new Set(
    providerEntities.map(
      (e) => `${e.tenantId}|${e.entityType}|${e.providerId}|${e.providerNativeId}`,
    ),
  );

  for (const mapping of mappings) {
    if (mapping.status !== "active") {
      continue;
    }
    const key = `${mapping.tenantId}|${mapping.entityType}|${mapping.providerId}|${mapping.providerNativeId}`;
    if (!known.has(key)) {
      issues.push({
        kind: "mapping_missing_provider_entity",
        severity: "warning",
        message: "Active mapping has no matching provider entity in the inventory snapshot",
        platformId: mapping.platformId,
        providerNativeId: mapping.providerNativeId,
        entityType: mapping.entityType,
        providerId: mapping.providerId,
      });
    }
  }
}
