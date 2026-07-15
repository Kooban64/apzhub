import { randomUUID } from "node:crypto";

import type { ReleaseGovernanceService } from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import { createReleaseGovernanceService } from "./release-governance-service";

export interface ReleaseGovernanceServices {
  readonly releaseGovernance: ReleaseGovernanceService;
}

export type ReleaseGovernanceServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: ReleaseGovernanceServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createReleaseGovernanceServices(
  deps: ReleaseGovernanceServiceDeps,
): ReleaseGovernanceServices {
  const rt = buildRuntime(deps);
  return {
    releaseGovernance: createReleaseGovernanceService(rt),
  };
}

export { createReleaseGovernanceService };
