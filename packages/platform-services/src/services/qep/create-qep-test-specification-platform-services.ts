/**
 * Platform QEP Test Specification Services factory (APZQEP-ENG-050B Part 2).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createQepTestSpecificationPersistenceForProduction,
  createQepTestSpecificationPersistenceForTest,
  createSpecificationApplicationService,
  type QepTestSpecificationRepositories,
} from "@apzhub/qep-test-specifications";
import type { StoredTestSpecification } from "@apzhub/qep-test-specifications/domain";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepTestSpecificationPlatformService,
  type QepTestSpecificationPlatformService,
} from "./qep-test-specification-service-impl";

export type QepTestSpecificationPlatformServicesBundle = {
  readonly persistence: QepTestSpecificationRepositories;
  readonly service: QepTestSpecificationPlatformService;
  readonly readiness: {
    readonly specificationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepTestSpecificationPlatformService;
};

type CommonInput = {
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onSpecificationUpserted?: (
    specification: StoredTestSpecification,
  ) => void | Promise<void>;
};

export type CreateQepTestSpecificationPlatformServicesInput = CommonInput & {
  readonly persistence: QepTestSpecificationRepositories;
  readonly persistenceMode?: "postgres" | "memory";
};

export type CreateQepTestSpecificationPlatformServicesForProductionInput =
  CommonInput & {
    readonly postgresDb: DatabaseExecutor;
  };

export type CreateQepTestSpecificationPlatformServicesForTestInput = CommonInput & {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
};

export function wrapQepTestSpecificationPlatformServiceWithPipeline(
  service: QepTestSpecificationPlatformService,
  pipeline: RequestPipeline,
): QepTestSpecificationPlatformService {
  return wrapServiceWithPipeline(
    service,
    pipeline,
    "qepTestSpecification",
  ) as QepTestSpecificationPlatformService;
}

function buildBundle(input: {
  readonly persistence: QepTestSpecificationRepositories;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onSpecificationUpserted?: (
    specification: StoredTestSpecification,
  ) => void | Promise<void>;
}): QepTestSpecificationPlatformServicesBundle {
  const application = createSpecificationApplicationService({
    specifications: input.persistence.specifications,
    now: input.now,
    id: input.id,
    onSpecificationUpserted: input.onSpecificationUpserted,
  });
  const service = createQepTestSpecificationPlatformService(application);

  return {
    persistence: input.persistence,
    service,
    readiness: {
      specificationEnabled: true,
      persistenceMode: input.persistenceMode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepTestSpecificationPlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepTestSpecificationPlatformServices(
  input: CreateQepTestSpecificationPlatformServicesInput,
): QepTestSpecificationPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
    onSpecificationUpserted: input.onSpecificationUpserted,
  });
}

export function createQepTestSpecificationPlatformServicesForProduction(
  input: CreateQepTestSpecificationPlatformServicesForProductionInput,
): QepTestSpecificationPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createQepTestSpecificationPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createQepTestSpecificationPersistenceForProduction({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
    onSpecificationUpserted: input.onSpecificationUpserted,
  });
}

export function createQepTestSpecificationPlatformServicesForTest(
  input: CreateQepTestSpecificationPlatformServicesForTestInput = {},
): QepTestSpecificationPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTestSpecificationPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createQepTestSpecificationPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
    onSpecificationUpserted: input.onSpecificationUpserted,
  });
}
