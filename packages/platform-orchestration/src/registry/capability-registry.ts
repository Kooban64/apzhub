import {
  QUALITY_FLOW_STAGES,
  type CapabilityCatalogueQuery,
  type CapabilityCatalogueRecord,
  type CapabilityHealthStatus,
  type CapabilityRegistrationInput,
  type CapabilityRegistrationLifecycle,
  type QualityFlowStage,
} from "../contracts/capability-catalogue";
import { OrchestrationError } from "../contracts/errors";

const LIFECYCLE_TRANSITIONS: Readonly<
  Record<CapabilityRegistrationLifecycle, readonly CapabilityRegistrationLifecycle[]>
> = {
  declared: ["registered", "retired"],
  registered: ["active", "deprecated", "retired"],
  active: ["deprecated", "retired"],
  deprecated: ["retired", "active"],
  retired: [],
};

/**
 * Capability Registry — catalogue only (QO-002).
 *
 * Answers: what is registered, contracts, versions, flow stages, triggers, health.
 * Does NOT execute capabilities, resolve services, or own orchestration decisions.
 * Not a service locator. Not a DI container (see OrchestrationContainer).
 */
export class CapabilityRegistry {
  private readonly records = new Map<string, CapabilityCatalogueRecord>();

  /**
   * Register a capability into the catalogue.
   * Validates required metadata; does not invoke the capability.
   */
  register(input: CapabilityRegistrationInput): CapabilityCatalogueRecord {
    const id = input.capabilityId.trim();
    this.assertRequiredMetadata(input, id);
    if (this.records.has(id)) {
      throw new OrchestrationError(
        "registry",
        "CAPABILITY_ALREADY_REGISTERED",
        `Capability already registered: ${id}`,
        { capabilityId: id },
      );
    }

    const now = new Date().toISOString();
    const record: CapabilityCatalogueRecord = {
      capabilityId: id,
      name: input.name.trim(),
      version: input.version.trim(),
      provider: input.provider.trim(),
      supportedContractVersions: [...input.supportedContractVersions],
      triggerTypes: [...(input.triggerTypes ?? [])],
      supportedQualityFlowStages: [...(input.supportedQualityFlowStages ?? [])],
      healthStatus: input.healthStatus ?? "unknown",
      requiredPermissions: [...(input.requiredPermissions ?? [])],
      dependencies: [...(input.dependencies ?? [])],
      featureFlags: { ...(input.featureFlags ?? {}) },
      lifecycle: input.lifecycle ?? "declared",
      documentationRef: input.documentationRef.trim(),
      contractIds: [...(input.contractIds ?? [])],
      registeredAt: now,
      updatedAt: now,
      labels: input.labels ? { ...input.labels } : undefined,
    };

    this.assertFlowStages(record.supportedQualityFlowStages);
    this.records.set(id, record);
    return record;
  }

  get(capabilityId: string): CapabilityCatalogueRecord | undefined {
    return this.records.get(capabilityId);
  }

  list(): readonly CapabilityCatalogueRecord[] {
    return [...this.records.values()];
  }

  count(): number {
    return this.records.size;
  }

  /** Query catalogue entries by metadata filters (AND semantics). */
  query(filter: CapabilityCatalogueQuery = {}): readonly CapabilityCatalogueRecord[] {
    return this.list().filter((record) => this.matches(record, filter));
  }

  listByProvider(provider: string): readonly CapabilityCatalogueRecord[] {
    return this.query({ provider });
  }

  listByTriggerType(triggerType: string): readonly CapabilityCatalogueRecord[] {
    return this.query({ triggerType });
  }

  listByQualityFlowStage(
    stage: QualityFlowStage,
  ): readonly CapabilityCatalogueRecord[] {
    return this.query({ qualityFlowStage: stage });
  }

  listByContractId(contractId: string): readonly CapabilityCatalogueRecord[] {
    return this.query({ contractId });
  }

  listByLifecycle(
    lifecycle: CapabilityRegistrationLifecycle,
  ): readonly CapabilityCatalogueRecord[] {
    return this.query({ lifecycle });
  }

  /** Stored health status only — registry does not probe live endpoints. */
  getHealthStatus(capabilityId: string): CapabilityHealthStatus | undefined {
    return this.records.get(capabilityId)?.healthStatus;
  }

  reportHealth(
    capabilityId: string,
    healthStatus: CapabilityHealthStatus,
  ): CapabilityCatalogueRecord {
    const existing = this.require(capabilityId);
    const updated: CapabilityCatalogueRecord = {
      ...existing,
      healthStatus,
      updatedAt: new Date().toISOString(),
    };
    this.records.set(capabilityId, updated);
    return updated;
  }

  transitionLifecycle(
    capabilityId: string,
    to: CapabilityRegistrationLifecycle,
  ): CapabilityCatalogueRecord {
    const existing = this.require(capabilityId);
    const allowed = LIFECYCLE_TRANSITIONS[existing.lifecycle];
    if (!allowed.includes(to)) {
      throw new OrchestrationError(
        "lifecycle",
        "INVALID_CAPABILITY_LIFECYCLE",
        `Invalid capability lifecycle transition: ${existing.lifecycle} → ${to}`,
        { capabilityId, from: existing.lifecycle, to },
      );
    }
    const updated: CapabilityCatalogueRecord = {
      ...existing,
      lifecycle: to,
      updatedAt: new Date().toISOString(),
    };
    this.records.set(capabilityId, updated);
    return updated;
  }

  clear(): void {
    this.records.clear();
  }

  /**
   * Guardrail: catalogue APIs only.
   * Intentionally no invoke/execute/resolve/getInstance methods.
   */
  get catalogueMode(): "catalogue-only" {
    return "catalogue-only";
  }

  private require(capabilityId: string): CapabilityCatalogueRecord {
    const existing = this.records.get(capabilityId);
    if (!existing) {
      throw new OrchestrationError(
        "registry",
        "CAPABILITY_NOT_FOUND",
        `Capability not registered: ${capabilityId}`,
        { capabilityId },
      );
    }
    return existing;
  }

  private matches(
    record: CapabilityCatalogueRecord,
    filter: CapabilityCatalogueQuery,
  ): boolean {
    if (filter.lifecycle && record.lifecycle !== filter.lifecycle) return false;
    if (filter.provider && record.provider !== filter.provider) return false;
    if (filter.healthStatus && record.healthStatus !== filter.healthStatus) {
      return false;
    }
    if (filter.triggerType && !record.triggerTypes.includes(filter.triggerType)) {
      return false;
    }
    if (
      filter.qualityFlowStage &&
      !record.supportedQualityFlowStages.includes(filter.qualityFlowStage)
    ) {
      return false;
    }
    if (filter.contractId && !record.contractIds.includes(filter.contractId)) {
      return false;
    }
    if (
      filter.supportsContractVersion &&
      !record.supportedContractVersions.includes(filter.supportsContractVersion)
    ) {
      return false;
    }
    return true;
  }

  private assertRequiredMetadata(input: CapabilityRegistrationInput, id: string): void {
    if (!id) {
      throw new OrchestrationError(
        "registry",
        "INVALID_CAPABILITY_ID",
        "capabilityId is required",
      );
    }
    if (!input.name?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_CAPABILITY_NAME",
        "name is required",
        { capabilityId: id },
      );
    }
    if (!input.version?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_CAPABILITY_VERSION",
        "version is required",
        { capabilityId: id },
      );
    }
    if (!input.provider?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_CAPABILITY_PROVIDER",
        "provider is required",
        { capabilityId: id },
      );
    }
    if (
      !input.supportedContractVersions ||
      input.supportedContractVersions.length === 0
    ) {
      throw new OrchestrationError(
        "validation",
        "MISSING_CONTRACT_VERSIONS",
        "supportedContractVersions must contain at least one version",
        { capabilityId: id },
      );
    }
    if (!input.documentationRef?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_DOCUMENTATION_REF",
        "documentationRef is required",
        { capabilityId: id },
      );
    }
  }

  private assertFlowStages(stages: readonly QualityFlowStage[]): void {
    for (const stage of stages) {
      if (!(QUALITY_FLOW_STAGES as readonly string[]).includes(stage)) {
        throw new OrchestrationError(
          "validation",
          "INVALID_FLOW_STAGE",
          `Unsupported Quality Flow stage: ${stage}`,
          { stage },
        );
      }
    }
  }
}
