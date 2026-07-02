import type { CapabilityKind } from "../manifest-engine/capability-kinds";
import type {
  CapabilityHealthState,
  CapabilityLifecycleState,
} from "../capability/types";
import type { CapabilityRegistry } from "./registry";
import type { RegisteredCapabilityRecord, RegistrySnapshot } from "./types";
import {
  extractWorkbenchNavigationContributions,
  type WorkbenchNavigationContribution,
  type WorkbenchNavigationExtractionDiagnostics,
  type WorkbenchNavigationExtractionResult,
} from "./workbench-navigation";
import {
  extractWorkbenchViewDescriptors,
  type WorkbenchViewExtractionResult,
} from "./workbench-view";

export interface CapabilityFilter {
  readonly category?: string;
}

export interface RegistryStateSummary {
  readonly platformVersion: string;
  readonly capabilityCount: number;
  readonly lifecycleState: CapabilityLifecycleState | "mixed";
}

export interface RegistryHealthSummary {
  readonly status: CapabilityHealthState | "mixed";
  readonly healthSummary: Readonly<Partial<Record<CapabilityHealthState, number>>>;
}

function filterRecords(
  records: readonly RegisteredCapabilityRecord[],
  filter?: CapabilityFilter,
): RegisteredCapabilityRecord[] {
  if (!filter?.category) {
    return [...records];
  }

  return records.filter((record) => record.metadata.category === filter.category);
}

function getRecordsByKind(
  registry: CapabilityRegistry,
  kind: CapabilityKind,
  filter?: CapabilityFilter,
): RegisteredCapabilityRecord[] {
  return filterRecords(registry.findByKind(kind), filter);
}

/**
 * Read-oriented Registry facade per platform-registry-api.md.
 * Wraps the internal CapabilityRegistry without duplicating storage.
 */
export class PlatformRegistry {
  constructor(private readonly registry: CapabilityRegistry) {}

  getState(): RegistryStateSummary {
    const snapshot = this.registry.snapshot();
    const lifecycleStates = Object.keys(snapshot.lifecycleSummary);

    return {
      platformVersion: snapshot.platformVersion,
      capabilityCount: snapshot.capabilityCount,
      lifecycleState:
        lifecycleStates.length === 1
          ? (lifecycleStates[0] as CapabilityLifecycleState)
          : "mixed",
    };
  }

  getHealth(): RegistryHealthSummary {
    const snapshot = this.registry.snapshot();
    const healthStates = Object.keys(snapshot.healthSummary).filter(
      (state) => (snapshot.healthSummary[state as CapabilityHealthState] ?? 0) > 0,
    );

    return {
      status:
        healthStates.length === 1
          ? (healthStates[0] as CapabilityHealthState)
          : "mixed",
      healthSummary: snapshot.healthSummary,
    };
  }

  getCapability(id: string): RegisteredCapabilityRecord | undefined {
    return this.registry.findById(id);
  }

  getModules(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "module", filter);
  }

  getServices(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "service", filter);
  }

  getIntegrations(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "integration", filter);
  }

  getComponents(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "component", filter);
  }

  getThemes(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "theme", filter);
  }

  getCommands(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "command", filter);
  }

  getSearchProviders(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "search-provider", filter);
  }

  getEvents(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "event", filter);
  }

  getWorkers(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "worker", filter);
  }

  getDashboards(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "dashboard", filter);
  }

  getWidgets(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "widget", filter);
  }

  getReports(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "report", filter);
  }

  getAiProviders(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "ai-provider", filter);
  }

  getFeatureFlags(filter?: CapabilityFilter): RegisteredCapabilityRecord[] {
    return getRecordsByKind(this.registry, "feature-flag", filter);
  }

  toJSON(): RegistrySnapshot {
    return this.registry.snapshot();
  }

  /** Returns registered capability count. */
  count(): number {
    return this.registry.count();
  }

  /** Returns a capability record by id. */
  findById(id: string): RegisteredCapabilityRecord | undefined {
    return this.registry.findById(id);
  }

  /** Returns all registered capabilities. */
  findAll(): RegisteredCapabilityRecord[] {
    return this.registry.findAll();
  }

  /**
   * Returns manifest-driven navigation contributions from registered capabilities.
   * Only active capabilities contribute by default.
   */
  getWorkbenchNavigationContributions(
    options: { activeOnly?: boolean } = {},
  ): WorkbenchNavigationExtractionResult {
    return extractWorkbenchNavigationContributions(this.registry.findAll(), options);
  }

  /** @deprecated alias — use getWorkbenchNavigationContributions */
  getWorkbenchNavItems(
    options: { activeOnly?: boolean } = {},
  ): readonly WorkbenchNavigationContribution[] {
    return this.getWorkbenchNavigationContributions(options).contributions;
  }

  getWorkbenchNavigationDiagnostics(
    options: { activeOnly?: boolean } = {},
  ): WorkbenchNavigationExtractionDiagnostics {
    return this.getWorkbenchNavigationContributions(options).diagnostics;
  }

  /** Returns manifest-driven view descriptors from registered capabilities. */
  getWorkbenchViewDescriptors(
    options: { activeOnly?: boolean } = {},
  ): WorkbenchViewExtractionResult {
    return extractWorkbenchViewDescriptors(this.registry.findAll(), options);
  }

  /** @internal Access underlying registry for subsystem integration. */
  getCapabilityRegistry(): CapabilityRegistry {
    return this.registry;
  }
}

export function createPlatformRegistry(registry: CapabilityRegistry): PlatformRegistry {
  return new PlatformRegistry(registry);
}
