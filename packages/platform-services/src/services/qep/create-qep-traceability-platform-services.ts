/**
 * Platform QEP Traceability Services factory (APZQEP-ENG-030A Part 2).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createInMemoryTraceEndpointResolver,
  createQepTraceabilityPersistenceForProduction,
  createQepTraceabilityPersistenceForTest,
  createTraceLinkApplicationService,
  type QepTraceabilityRepositories,
  type StoredTraceLink,
  type TraceEndpointResolver,
} from "@apzhub/qep-traceability";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepTraceabilityPlatformService,
  type QepTraceabilityPlatformService,
} from "./qep-traceability-service-impl";

export type QepTraceabilityPlatformServicesBundle = {
  readonly persistence: QepTraceabilityRepositories;
  readonly service: QepTraceabilityPlatformService;
  readonly readiness: {
    readonly traceabilityEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepTraceabilityPlatformService;
};

type CommonInput = {
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onTraceLinkUpserted?: (trace: StoredTraceLink) => void | Promise<void>;
  readonly endpointResolver?: TraceEndpointResolver;
};

export type CreateQepTraceabilityPlatformServicesInput = CommonInput & {
  readonly persistence: QepTraceabilityRepositories;
  readonly persistenceMode?: "postgres" | "memory";
};

export type CreateQepTraceabilityPlatformServicesForProductionInput = CommonInput & {
  readonly postgresDb: DatabaseExecutor;
};

export type CreateQepTraceabilityPlatformServicesForTestInput = CommonInput & {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
};

export function wrapQepTraceabilityPlatformServiceWithPipeline(
  service: QepTraceabilityPlatformService,
  pipeline: RequestPipeline,
): QepTraceabilityPlatformService {
  return wrapServiceWithPipeline(
    service,
    pipeline,
    "qepTraceability",
  ) as QepTraceabilityPlatformService;
}

function buildBundle(input: {
  readonly persistence: QepTraceabilityRepositories;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onTraceLinkUpserted?: (trace: StoredTraceLink) => void | Promise<void>;
  readonly endpointResolver?: TraceEndpointResolver;
}): QepTraceabilityPlatformServicesBundle {
  // Cross-bounded-context endpoint existence checks (verification, evidence,
  // execution, defects, risk, certification, documents) are a documented
  // follow-up (ARCH-008 Service Connector integration); until wired, endpoints
  // resolve permissively so Trace Link creation is not blocked on those
  // domains landing. Requirements-backed resolvers can be supplied via
  // `endpointResolver` once the caller has requirements persistence in scope.
  const endpointResolver =
    input.endpointResolver ?? createInMemoryTraceEndpointResolver();

  const application = createTraceLinkApplicationService({
    traceLinks: input.persistence.traceLinks,
    traceTaxonomy: input.persistence.traceTaxonomy,
    endpointResolver,
    now: input.now,
    id: input.id,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
  });
  const service = createQepTraceabilityPlatformService(application);

  return {
    persistence: input.persistence,
    service,
    readiness: {
      traceabilityEnabled: true,
      persistenceMode: input.persistenceMode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepTraceabilityPlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepTraceabilityPlatformServices(
  input: CreateQepTraceabilityPlatformServicesInput,
): QepTraceabilityPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
    endpointResolver: input.endpointResolver,
  });
}

export function createQepTraceabilityPlatformServicesForProduction(
  input: CreateQepTraceabilityPlatformServicesForProductionInput,
): QepTraceabilityPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createQepTraceabilityPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createQepTraceabilityPersistenceForProduction({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
    endpointResolver: input.endpointResolver,
  });
}

export function createQepTraceabilityPlatformServicesForTest(
  input: CreateQepTraceabilityPlatformServicesForTestInput = {},
): QepTraceabilityPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTraceabilityPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createQepTraceabilityPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
    endpointResolver: input.endpointResolver,
  });
}
