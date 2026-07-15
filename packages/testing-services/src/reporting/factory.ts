import { randomUUID } from "node:crypto";

import type { ReportingService } from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import { createReportingService } from "./reporting-service";

export interface ReportingFrameworkServices {
  readonly reporting: ReportingService;
}

export type ReportingFrameworkServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: ReportingFrameworkServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createReportingFrameworkServices(
  deps: ReportingFrameworkServiceDeps,
): ReportingFrameworkServices {
  const rt = buildRuntime(deps);
  return {
    reporting: createReportingService(rt),
  };
}

export { createReportingService };
