import type { KimaiFeatureDetectionResult } from "./types";

export interface DetectKimaiFeaturesInput {
  readonly checkedAt: string;
  readonly pingSucceeded: boolean;
  readonly versionSucceeded: boolean;
  readonly detectedVersion?: string;
  readonly domainListProbed?: boolean;
  readonly domainListSucceeded?: boolean;
}

/**
 * Feature detection — foundation probes plus optional domain list availability.
 * Optional gaps never throw; never fail adapter startup alone.
 */
export function detectKimaiFeatures(
  input: DetectKimaiFeaturesInput,
): KimaiFeatureDetectionResult {
  const unsupportedEndpoints: string[] = [];
  const unavailableCapabilities: string[] = [];
  const notes: string[] = [
    "Foundation probes: GET /api/ping, GET /api/version",
    "Domain CE APIs: /api/timesheets, /api/activities, /api/customers, /api/projects, /api/tags",
  ];

  if (!input.pingSucceeded) {
    unsupportedEndpoints.push("/api/ping");
    unavailableCapabilities.push("health");
  }
  if (!input.versionSucceeded) {
    unsupportedEndpoints.push("/api/version");
    unavailableCapabilities.push("version");
  }
  if (input.domainListProbed && input.domainListSucceeded === false) {
    unsupportedEndpoints.push("/api/timesheets");
    unavailableCapabilities.push("timesheets");
    notes.push("Domain list probe failed — check API token permissions");
  }
  if (input.detectedVersion) {
    notes.push(`Detected Kimai version: ${input.detectedVersion}`);
  }

  return {
    checkedAt: input.checkedAt,
    pingAvailable: input.pingSucceeded,
    versionAvailable: input.versionSucceeded,
    unsupportedEndpoints,
    unavailableCapabilities,
    notes,
  };
}
