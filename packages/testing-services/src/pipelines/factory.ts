import { randomUUID } from "node:crypto";

import type {
  PipelineAdapterRegistry,
  PipelineImportService,
  PipelineNormalizationService,
  PipelineValidationService,
} from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import {
  createGenericCiAdapter,
  createPipelineAdapterRegistry,
} from "./adapters/registry";
import { createPipelineImportService } from "./import-service";
import { createPipelineLinkService } from "./link-service";
import { createPipelineNormalizationService } from "./normalization";
import { createPipelineRegistryService } from "./pipeline-registry-service";
import { createPipelineValidationService } from "./validation";

export interface PipelineIngestionServices {
  readonly registry: PipelineAdapterRegistry;
  readonly normalization: PipelineNormalizationService;
  readonly validation: PipelineValidationService;
  readonly imports: PipelineImportService;
  readonly pipelineRegistry: ReturnType<typeof createPipelineRegistryService>;
  readonly links: ReturnType<typeof createPipelineLinkService>;
  readonly events: DomainEventCollector;
}

export type PipelineIngestionServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: PipelineIngestionServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createPipelineIngestionServices(
  deps: PipelineIngestionServiceDeps,
): PipelineIngestionServices {
  const rt = buildRuntime(deps);
  const registry = createPipelineAdapterRegistry(deps.pipelineAdapters);
  const normalization = createPipelineNormalizationService();
  const validation = createPipelineValidationService(rt);
  const imports = createPipelineImportService({
    runtime: rt,
    registry,
    normalization,
    validation,
  });

  return {
    registry,
    normalization,
    validation,
    imports,
    pipelineRegistry: createPipelineRegistryService(imports),
    links: createPipelineLinkService(imports),
    events: rt.events,
  };
}

export {
  createPipelineAdapterRegistry,
  createGenericCiAdapter,
  createPipelineNormalizationService,
  createPipelineValidationService,
  createPipelineImportService,
};
