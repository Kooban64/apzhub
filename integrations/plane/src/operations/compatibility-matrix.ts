import { checkVersionCompatibility } from "@apzhub/integration-sdk";

import type {
  PlaneEdition,
  PlaneCompatibilityMatrix,
  PlaneFeatureDetectionResult,
} from "./types";

export const PLANE_SUPPORTED_VERSION_RANGE = {
  min: "0.23.0",
  max: "0.24.99",
} as const;

export const PLANE_DEPRECATED_APIS = ["legacy_issue_bulk_update_v0"] as const;

export const PLANE_OPTIONAL_CAPABILITIES = ["analytics", "webhooks"] as const;

export const PLANE_CE_VS_EE_NOTES = [
  "APZHUB targets Plane Community Edition (CE) APIs only — no mandatory Enterprise Edition dependencies",
  "Webhook registration is CE-supported; EE-only analytics endpoints are not required",
  "Edition is inferred as community unless provider metadata indicates otherwise",
] as const;

export interface BuildCompatibilityMatrixInput {
  readonly detectedPlaneVersion?: string;
  readonly versionMin?: string;
  readonly versionMax?: string;
  readonly edition?: PlaneEdition;
  readonly featureDetection?: PlaneFeatureDetectionResult;
}

/**
 * Adapter compatibility reporting — optional feature gaps never fail startup alone.
 */
export function buildPlaneCompatibilityMatrix(
  input: BuildCompatibilityMatrixInput,
): PlaneCompatibilityMatrix {
  const range = {
    min: input.versionMin ?? PLANE_SUPPORTED_VERSION_RANGE.min,
    max: input.versionMax ?? PLANE_SUPPORTED_VERSION_RANGE.max,
  };

  const compatibility = input.detectedPlaneVersion
    ? checkVersionCompatibility(
        { version: input.detectedPlaneVersion },
        { min: range.min, max: range.max },
      )
    : undefined;

  const unsupportedFeatures = [
    ...(input.featureDetection?.unsupportedEndpoints.map(
      (endpoint) => `unsupported_endpoint:${endpoint}`,
    ) ?? []),
    ...(input.featureDetection?.unavailableCapabilities.map(
      (capability) => `unavailable_capability:${capability}`,
    ) ?? []),
  ];

  const reasons: string[] = [];
  if (!input.detectedPlaneVersion) {
    reasons.push("provider_version_not_detected");
  }
  if (compatibility?.status === "incompatible") {
    reasons.push(compatibility.message ?? "version_incompatible");
  }
  if (compatibility?.status === "warning") {
    reasons.push(compatibility.message ?? "version_at_declared_maximum");
  }
  if (unsupportedFeatures.length > 0) {
    reasons.push("optional_or_unsupported_features_detected");
  }

  return {
    detectedPlaneVersion: input.detectedPlaneVersion,
    supportedVersionRange: {
      min: range.min,
      max: range.max.replace(/\.99$/, ".x"),
    },
    compatibilityStatus: compatibility?.status ?? "not_checked",
    edition: input.edition ?? "community",
    unsupportedFeatures,
    deprecatedApis: [...PLANE_DEPRECATED_APIS],
    optionalCapabilities: [...PLANE_OPTIONAL_CAPABILITIES],
    communityVsEnterpriseNotes: [...PLANE_CE_VS_EE_NOTES],
    reasons,
  };
}
