/**
 * Evidence Processor Registry — product layer registration onto platform registry.
 * No hard-coded routing / switch statements in the engine.
 */

import type { ProcessorRegistry } from "@apzhub/platform-processing";

import { createAllEvidenceProcessors } from "./evidence-processors";
import type {
  EvidenceBusinessActionPort,
  EvidenceProcessorMetadata,
  EvidenceProcessorRegistration,
  ProductProcessorBundle,
} from "./types";
import { EVIDENCE_PROCESSOR_BUNDLE_ID } from "./types";

export type EvidenceProcessorRegistry = {
  readonly bundle: ProductProcessorBundle;
  /** Register all Evidence processors onto a platform ProcessorRegistry. */
  registerOnto(platformRegistry: ProcessorRegistry): void;
  list(): readonly EvidenceProcessorRegistration[];
  metadata(): readonly EvidenceProcessorMetadata[];
  discover(eventType: string): EvidenceProcessorRegistration | undefined;
  getById(processorId: string): EvidenceProcessorRegistration | undefined;
  diagnostics(): EvidenceProcessorDiagnostics;
};

export type EvidenceProcessorDiagnostics = {
  readonly bundleId: string;
  readonly product: string;
  readonly version: string;
  readonly registeredCount: number;
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly unavailableCount: number;
  readonly eventCoverage: readonly string[];
  readonly processors: ReadonlyArray<{
    readonly processorId: string;
    readonly version: string;
    readonly health: string;
    readonly eventTypes: readonly string[];
    readonly available: boolean;
  }>;
};

export type CreateEvidenceProcessorRegistryOptions = {
  readonly business: EvidenceBusinessActionPort;
  readonly bundleVersion?: string;
};

/**
 * Deterministic Evidence processor registration.
 * Future Search/Notification bundles can mirror this shape without changing platform.
 */
export function createEvidenceProcessorRegistry(
  options: CreateEvidenceProcessorRegistryOptions,
): EvidenceProcessorRegistry {
  const registrations = createAllEvidenceProcessors(options.business);
  const byId = new Map(registrations.map((r) => [r.metadata.processorId, r] as const));

  const bundle: ProductProcessorBundle = {
    bundleId: EVIDENCE_PROCESSOR_BUNDLE_ID,
    product: "APZQEP Evidence",
    version: options.bundleVersion ?? "1.0.0",
    registrations,
  };

  return {
    bundle,

    registerOnto(platformRegistry) {
      for (const registration of registrations) {
        platformRegistry.register(registration.processor);
      }
    },

    list() {
      return registrations;
    },

    metadata() {
      return registrations.map((r) => r.metadata);
    },

    discover(eventType) {
      return registrations.find((r) =>
        r.metadata.eventTypes.includes(
          eventType as (typeof r.metadata.eventTypes)[number],
        ),
      );
    },

    getById(processorId) {
      return byId.get(processorId);
    },

    diagnostics() {
      const processors = registrations.map((r) => ({
        processorId: r.metadata.processorId,
        version: r.metadata.version,
        health: r.metadata.health,
        eventTypes: r.metadata.eventTypes,
        available: r.metadata.health !== "unavailable",
      }));
      return {
        bundleId: bundle.bundleId,
        product: bundle.product,
        version: bundle.version,
        registeredCount: registrations.length,
        healthyCount: processors.filter((p) => p.health === "healthy").length,
        degradedCount: processors.filter((p) => p.health === "degraded").length,
        unavailableCount: processors.filter((p) => p.health === "unavailable").length,
        eventCoverage: [
          ...new Set(registrations.flatMap((r) => [...r.metadata.eventTypes])),
        ].sort(),
        processors,
      };
    },
  };
}

/**
 * Compose multiple product bundles onto one platform registry (Evidence + future).
 */
export function registerProductProcessorBundles(
  platformRegistry: ProcessorRegistry,
  bundles: ReadonlyArray<{ registerOnto(r: ProcessorRegistry): void }>,
): void {
  for (const bundle of bundles) {
    bundle.registerOnto(platformRegistry);
  }
}
