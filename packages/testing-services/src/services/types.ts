import type { TestingPersistence } from "@apzhub/testing-persistence";
import type {
  ApzTcmsConfiguration,
  EvidenceStorageProvider,
  PipelineResultAdapter,
} from "@apzhub/testing-contracts";

import type { DomainEventCollector } from "../events/domain-event-collector";

export type Clock = () => string;
export type IdGenerator = () => string;

export interface ManualTestingServiceDeps {
  readonly persistence: TestingPersistence;
  readonly events?: DomainEventCollector;
  readonly now?: Clock;
  readonly id?: IdGenerator;
  readonly storage?: EvidenceStorageProvider;
  readonly configuration?: ApzTcmsConfiguration;
  /**
   * Optional pipeline result adapters for SoR ingestion.
   * When omitted, the pipeline registry defaults to generic_ci only.
   * Platform composition injects github_actions (and others) without coupling
   * testing-services to integration packages.
   */
  readonly pipelineAdapters?: readonly PipelineResultAdapter[];
}

export interface ServiceRuntime {
  readonly persistence: TestingPersistence;
  readonly events: DomainEventCollector;
  readonly now: Clock;
  readonly id: IdGenerator;
  readonly storage: EvidenceStorageProvider;
  readonly configuration?: ApzTcmsConfiguration;
}
