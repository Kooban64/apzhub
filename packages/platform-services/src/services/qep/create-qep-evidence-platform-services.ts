/**
 * Platform QEP Evidence Services factory (APZQEP-ENG-110F).
 * Uses in-memory Application ports until Owner-authorised storage selection
 * (ADR-0088). Not a silent production DB fallback for other QEP capabilities.
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
    readonly persistenceMode: "memory";
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
      persistenceMode: "memory",
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepEvidencePlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepEvidencePlatformServices(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForMemory());
}

/**
 * Production Evidence runtime — memory until storage technology is selected.
 * Explicitly distinct from Postgres-backed QEP capabilities.
 */
export function createQepEvidencePlatformServicesForProduction(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForProduction());
}

export function createQepEvidencePlatformServicesForTest(): QepEvidencePlatformServicesBundle {
  return buildBundle(createEvidenceRuntimeForTest());
}
