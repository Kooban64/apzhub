/**
 * Platform QEP Test Execution Services factory (APZQEP-ENG-100D).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createQepTestExecutionPersistenceForProduction,
  createQepTestExecutionPersistenceForTest,
  createTestExecutionApplicationServices,
  type QepTestExecutionPortOverrides,
  type QepTestExecutionPorts,
} from "@apzhub/qep-test-execution";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepTestExecutionPlatformService,
  type QepTestExecutionPlatformService,
} from "./qep-test-execution-service-impl";

export type QepTestExecutionPlatformServicesBundle = {
  readonly persistence: QepTestExecutionPorts;
  readonly service: QepTestExecutionPlatformService;
  readonly readiness: {
    readonly executionEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepTestExecutionPlatformService;
};

export type CreateQepTestExecutionPlatformServicesInput = {
  readonly persistence: QepTestExecutionPorts;
  readonly persistenceMode?: "postgres" | "memory";
};

export type CreateQepTestExecutionPlatformServicesForProductionInput =
  QepTestExecutionPortOverrides & {
    readonly postgresDb: DatabaseExecutor;
  };

export type CreateQepTestExecutionPlatformServicesForTestInput =
  QepTestExecutionPortOverrides & {
    readonly postgresDb?: DatabaseExecutor;
    readonly allowInMemoryPersistence?: boolean;
  };

export function wrapQepTestExecutionPlatformServiceWithPipeline(
  service: QepTestExecutionPlatformService,
  pipeline: RequestPipeline,
): QepTestExecutionPlatformService {
  return wrapServiceWithPipeline(
    service,
    pipeline,
    "qepTestExecution",
  ) as QepTestExecutionPlatformService;
}

function buildBundle(input: {
  readonly persistence: QepTestExecutionPorts;
  readonly persistenceMode: "postgres" | "memory";
}): QepTestExecutionPlatformServicesBundle {
  const application = createTestExecutionApplicationServices({
    executions: input.persistence.executions,
    history: input.persistence.history,
    sources: input.persistence.sources,
    permissions: input.persistence.permissions,
    audit: input.persistence.audit,
    outbox: input.persistence.outbox,
    search: input.persistence.search,
    evidenceAccess: input.persistence.evidenceAccess,
    clock: input.persistence.clock,
    ids: input.persistence.ids,
  });
  const service = createQepTestExecutionPlatformService(application);

  return {
    persistence: input.persistence,
    service,
    readiness: {
      executionEnabled: true,
      persistenceMode: input.persistenceMode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepTestExecutionPlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepTestExecutionPlatformServices(
  input: CreateQepTestExecutionPlatformServicesInput,
): QepTestExecutionPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
  });
}

export function createQepTestExecutionPlatformServicesForProduction(
  input: CreateQepTestExecutionPlatformServicesForProductionInput,
): QepTestExecutionPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createQepTestExecutionPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createQepTestExecutionPersistenceForProduction({
    db: input.postgresDb,
    resolveSource: input.resolveSource,
    evidenceCheck: input.evidenceCheck,
    searchHook: input.searchHook,
  });
  return buildBundle({ persistence, persistenceMode: "postgres" });
}

export function createQepTestExecutionPlatformServicesForTest(
  input: CreateQepTestExecutionPlatformServicesForTestInput = {},
): QepTestExecutionPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTestExecutionPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createQepTestExecutionPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
    resolveSource: input.resolveSource,
    evidenceCheck: input.evidenceCheck,
    searchHook: input.searchHook,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
  });
}
