import type {
  ZammadCompatibilityMatrix,
  ZammadEdition,
  ZammadFeatureDetectionResult,
} from "./types";

/** Governed Zammad CE compatibility range (do not expand without evidence). */
export const ZAMMAD_SUPPORTED_VERSION_RANGE = {
  min: "6.3.0",
  max: "6.5.x",
  verifiedMin: "6.3.0",
  verifiedMax: "6.5.x",
} as const;

export const ZAMMAD_OPTIONAL_CAPABILITIES = [
  "webhooks",
  "analytics",
  "search",
  "history",
] as const;

export const ZAMMAD_CE_VS_EE_NOTES = [
  "Self-hosted Community Edition is the primary supported edition",
  "Enterprise features are optional indicators only — never required for certification",
  "Webhook management availability may vary by configuration/permissions, not solely by edition",
] as const;

export interface BuildZammadCompatibilityMatrixInput {
  readonly detectedZammadVersion?: string;
  readonly versionMin: string;
  readonly versionMax: string;
  readonly edition?: ZammadEdition;
  readonly featureDetection?: ZammadFeatureDetectionResult;
}

function parseVersionParts(version: string): number[] | undefined {
  const normalized = version.trim().replace(/^v/i, "");
  if (!normalized || !/^\d+(\.\d+)*/.test(normalized)) {
    return undefined;
  }
  const core = normalized.split("-")[0] ?? normalized;
  return core.split(".").map((part) => {
    const parsed = Number.parseInt(part.replace(/[^0-9].*$/, ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });
}

function compareVersions(left: string, right: string): number | undefined {
  const leftParts = parseVersionParts(left);
  const rightParts = parseVersionParts(right);
  if (!leftParts || !rightParts) {
    return undefined;
  }
  const length = Math.max(leftParts.length, rightParts.length, 3);
  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue > rightValue) {
      return 1;
    }
    if (leftValue < rightValue) {
      return -1;
    }
  }
  return 0;
}

function normalizeMax(versionMax: string): string {
  return versionMax.endsWith(".x") ? versionMax.replace(/\.x$/, ".99") : versionMax;
}

/**
 * Build structured Zammad compatibility reporting for operational certification.
 *
 * Older-than-minimum → blocking incompatible.
 * Newer-than-verified-max → unverified (warning, not blocking).
 * Optional feature gaps never fail startup alone.
 */
export function buildZammadCompatibilityMatrix(
  input: BuildZammadCompatibilityMatrixInput,
): ZammadCompatibilityMatrix {
  const edition = input.edition ?? "community";
  const maxForCheck = normalizeMax(input.versionMax);

  let compatibilityStatus: ZammadCompatibilityMatrix["compatibilityStatus"] =
    "not_checked";
  const warnings: string[] = [];
  const blockingIncompatibilities: string[] = [];
  const reasons: string[] = [];

  if (!input.detectedZammadVersion?.trim()) {
    compatibilityStatus = "warning";
    warnings.push("provider_version_missing");
    reasons.push("Unable to detect Zammad version — compatibility unverified");
  } else {
    const vsMin = compareVersions(input.detectedZammadVersion, input.versionMin);
    const vsMax = compareVersions(input.detectedZammadVersion, maxForCheck);

    if (vsMin === undefined || vsMax === undefined) {
      compatibilityStatus = "warning";
      warnings.push("malformed_provider_version");
      reasons.push("Unable to parse detected Zammad version");
    } else if (vsMin < 0) {
      compatibilityStatus = "incompatible";
      blockingIncompatibilities.push(
        `Detected ${input.detectedZammadVersion} is below minimum supported ${input.versionMin}`,
      );
      reasons.push("unsupported_older_version");
    } else if (vsMax > 0) {
      compatibilityStatus = "unverified";
      warnings.push(
        `Detected ${input.detectedZammadVersion} is newer than verified maximum ${input.versionMax}`,
      );
      reasons.push("unverified_newer_version");
    } else {
      compatibilityStatus = "compatible";
      reasons.push(
        `Detected ${input.detectedZammadVersion} within supported range ${input.versionMin}–${input.versionMax}`,
      );
    }
  }

  const unavailableEndpoints = [
    ...(input.featureDetection?.unsupportedEndpoints ?? []),
  ];
  const unsupportedFeatures = [
    ...(input.featureDetection?.unavailableCapabilities ?? []),
  ];
  const versionSpecificDifferences = [
    ...(input.featureDetection?.versionSpecificNotes ?? []),
  ];

  if (unsupportedFeatures.length > 0) {
    warnings.push(
      `optional_features_unavailable:${unsupportedFeatures.sort().join(",")}`,
    );
  }

  return {
    detectedZammadVersion: input.detectedZammadVersion,
    supportedVersionRange: {
      min: input.versionMin,
      max: input.versionMax,
    },
    verifiedVersionRange: {
      min: ZAMMAD_SUPPORTED_VERSION_RANGE.verifiedMin,
      max: ZAMMAD_SUPPORTED_VERSION_RANGE.verifiedMax,
    },
    compatibilityStatus,
    edition,
    selfHostedCeCompatible: edition === "community" || edition === "enterprise",
    enterpriseIndicators: edition === "enterprise" ? ["edition_configured_enterprise"] : [],
    unsupportedFeatures: [...new Set(unsupportedFeatures)].sort(),
    deprecatedApis: [],
    unavailableEndpoints: [...new Set(unavailableEndpoints)].sort(),
    versionSpecificDifferences,
    optionalCapabilities: [...ZAMMAD_OPTIONAL_CAPABILITIES],
    communityVsEnterpriseNotes: [...ZAMMAD_CE_VS_EE_NOTES],
    warnings: [...new Set(warnings)].sort(),
    blockingIncompatibilities,
    reasons,
  };
}
