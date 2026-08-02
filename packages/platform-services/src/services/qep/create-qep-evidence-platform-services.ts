/**
 * Platform QEP Evidence Services factory (APZQEP-ENG-110F / APZQEP-120-S05).
 * Catalogue mode (memory|postgres) is orthogonal to Storage Platform (S03).
 * PostgreSQL is the first durable catalogue persistence implementation.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createEvidenceRuntimeForMemory,
  createEvidenceRuntimeForPostgres,
  createEvidenceRuntimeForProduction,
  createEvidenceRuntimeForTest,
  resolveEvidenceStorageConfigFromEnv,
  type EvidenceRuntimeBundle,
} from "@apzhub/qep-evidence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepEvidencePlatformService,
  type QepEvidencePlatformService,
} from "./qep-evidence-service-impl";

export type QepEvidencePlatformServicesBundle = {
  readonly runtime: EvidenceRuntimeBundle;
  readonly service: QepEvidencePlatformService;
  readonly readiness: {
    readonly evidenceEnabled: true;
    readonly persistenceMode: EvidenceRuntimeBundle["persistenceMode"];
    readonly catalogueMode: EvidenceRuntimeBundle["catalogueMode"];
    readonly storageProviderKind: EvidenceRuntimeBundle["storageProviderKind"];
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepEvidencePlatformService;
};

export function wrapQepEvidencePlatformServiceWithPipeline(
  service: QepEvidencePlatformService,
  pipeline: RequestPipeline,
): QepEvidencePlatformService {
  return wrapServiceWithPipeline(
    service,
    pipeline,
    "qepEvidence",
  ) as QepEvidencePlatformService;
}

function buildBundle(
  runtime: EvidenceRuntimeBundle,
): QepEvidencePlatformServicesBundle {
  const service = createQepEvidencePlatformService(runtime.application);
  return {
    runtime,
    service,
    readiness: {
      evidenceEnabled: true,
      persistenceMode: runtime.persistenceMode,
      catalogueMode: runtime.catalogueMode,
      storageProviderKind: runtime.storageProviderKind,
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepEvidencePlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepEvidencePlatformServices(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForMemory());
}

/**
 * Production Evidence runtime — PostgreSQL catalogue when db provided;
 * storage provider from environment (default memory).
 */
export function createQepEvidencePlatformServicesForProduction(input?: {
  readonly postgresDb?: DatabaseExecutor;
}): QepEvidencePlatformServicesBundle {
  if (input?.postgresDb) {
    return buildBundle(
      createEvidenceRuntimeForPostgres({
        db: input.postgresDb,
        storageConfig: resolveEvidenceStorageConfigFromEnv(),
      }),
    );
  }
  return buildBundle(createEvidenceRuntimeForProduction());
}

export function createQepEvidencePlatformServicesForTest(input?: {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): QepEvidencePlatformServicesBundle {
  if (input?.postgresDb) {
    return buildBundle(createEvidenceRuntimeForPostgres({ db: input.postgresDb }));
  }
  if (input?.allowInMemoryPersistence === false) {
    throw new Error(
      "createQepEvidencePlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return buildBundle(createEvidenceRuntimeForTest());
}
