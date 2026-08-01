/**
 * Platform QEP Evidence Services factory (APZQEP-ENG-110F / APZQEP-120-S03).
 * Content bytes via Evidence Storage Platform (ADR-0094). Metadata remains
 * in-memory until S04. Default provider is memory; Local via env/config only.
 */

import {
  createEvidenceRuntimeForMemory,
  createEvidenceRuntimeForProduction,
  createEvidenceRuntimeForTest,
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
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepEvidencePlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepEvidencePlatformServices(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForMemory());
}

/**
 * Production Evidence runtime — Storage Platform from env (default memory).
 * Explicitly distinct from Postgres-backed QEP metadata (S04).
 */
export function createQepEvidencePlatformServicesForProduction(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForProduction());
}

export function createQepEvidencePlatformServicesForTest(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForTest());
}
