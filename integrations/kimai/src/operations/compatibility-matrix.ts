import { checkVersionCompatibility } from "@apzhub/integration-sdk";

import { DEFAULT_KIMAI_VERSION_MAX, DEFAULT_KIMAI_VERSION_MIN } from "../kimai-config";
import { KIMAI_ADAPTER_VERSION } from "../version";
import { KIMAI_UNSUPPORTED_OPERATIONS } from "../capabilities/service-capabilities";
import type { KimaiCompatibilityMatrix, KimaiFeatureDetectionResult } from "./types";

export const KIMAI_SUPPORTED_VERSION_RANGE = {
  min: DEFAULT_KIMAI_VERSION_MIN,
  max: DEFAULT_KIMAI_VERSION_MAX,
} as const;

export const KIMAI_CE_NOTES = [
  "APZHUB targets Kimai Community Edition (CE) JSON API only — no mandatory Enterprise Edition dependencies",
  "Preferred authentication is Authorization: Bearer API token (Kimai 2.13+)",
  "Legacy X-AUTH-USER / X-AUTH-TOKEN supported for older CE installs; deprecated upstream after Q2 2026",
  "Foundation adapter does not implement timesheet domain CRUD or APZ Time product surfaces",
] as const;

export interface BuildKimaiCompatibilityMatrixInput {
  readonly detectedKimaiVersion?: string;
  readonly versionMin?: string;
  readonly versionMax?: string;
  readonly featureDetection?: KimaiFeatureDetectionResult;
}

export function buildKimaiCompatibilityMatrix(
  input: BuildKimaiCompatibilityMatrixInput = {},
): KimaiCompatibilityMatrix {
  const range = {
    min: input.versionMin ?? KIMAI_SUPPORTED_VERSION_RANGE.min,
    max: input.versionMax ?? KIMAI_SUPPORTED_VERSION_RANGE.max,
  };

  const compatibility = input.detectedKimaiVersion
    ? checkVersionCompatibility(
        { version: input.detectedKimaiVersion },
        { min: range.min, max: range.max },
      )
    : undefined;

  const unsupportedFeatures = [
    ...KIMAI_UNSUPPORTED_OPERATIONS.map((op) => `domain_out_of_scope:${op}`),
    ...(input.featureDetection?.unsupportedEndpoints.map(
      (endpoint) => `unsupported_endpoint:${endpoint}`,
    ) ?? []),
    ...(input.featureDetection?.unavailableCapabilities.map(
      (capability) => `unavailable_capability:${capability}`,
    ) ?? []),
  ];

  const reasons: string[] = [];
  if (!input.detectedKimaiVersion) {
    reasons.push("provider_version_not_detected");
  }
  if (compatibility?.status === "incompatible") {
    reasons.push(compatibility.message ?? "version_incompatible");
  }
  if (compatibility?.status === "warning") {
    reasons.push(compatibility.message ?? "version_at_declared_maximum");
  }

  return {
    detectedKimaiVersion: input.detectedKimaiVersion,
    supportedVersionRange: {
      min: range.min,
      max: range.max.replace(/\.99$/, ".x"),
    },
    compatibilityStatus: compatibility?.status ?? "not_checked",
    edition: "community",
    unsupportedFeatures,
    reasons,
    adapterVersion: KIMAI_ADAPTER_VERSION,
    notes: [...KIMAI_CE_NOTES],
  };
}
