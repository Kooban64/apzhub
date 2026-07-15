import type {
  VendorVersionInfo,
  VersionCompatibilityResult,
  VersionCompatibilityStatus,
  VersionRange,
} from "../types";

function parseVersionParts(version: string): number[] {
  const normalized = version.trim().replace(/^v/i, "");
  const core = normalized.split("-")[0] ?? normalized;
  return core.split(".").map((part) => {
    const parsed = Number.parseInt(part.replace(/[^0-9].*$/, ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });
}

function compareVersions(left: string, right: string): number {
  const leftParts = parseVersionParts(left);
  const rightParts = parseVersionParts(right);
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

function isWithinRange(version: string, range: VersionRange): boolean {
  if (compareVersions(version, range.min) < 0) {
    return false;
  }
  if (range.max && compareVersions(version, range.max) > 0) {
    return false;
  }
  return true;
}

export function checkVersionCompatibility(
  detected: VendorVersionInfo,
  declared: VersionRange,
): VersionCompatibilityResult {
  if (!detected.version.trim()) {
    return {
      status: "not_checked",
      detected,
      declared,
      message: "Engine version was not detected",
    };
  }

  const compatible = isWithinRange(detected.version, declared);
  let status: VersionCompatibilityStatus = "compatible";
  let message: string | undefined;

  if (!compatible) {
    status = "incompatible";
    message = `Detected version ${detected.version} is outside declared range`;
  } else if (declared.max && compareVersions(detected.version, declared.max) === 0) {
    status = "warning";
    message = "Detected version matches declared maximum — plan upgrade validation";
  }

  return {
    status,
    detected,
    declared,
    message,
  };
}

export function extractDeclaredVersionRange(
  metadata: Readonly<Record<string, string>> | undefined,
): VersionRange | undefined {
  if (!metadata) {
    return undefined;
  }

  const min = metadata.engineVersionMin ?? metadata.versionMin;
  if (!min) {
    return undefined;
  }

  return {
    min,
    max: metadata.engineVersionMax ?? metadata.versionMax,
  };
}

export function extractDetectedVersion(
  metadata: Readonly<Record<string, string>> | undefined,
): VendorVersionInfo | undefined {
  if (!metadata?.engineVersion && !metadata?.detectedVersion) {
    return undefined;
  }

  return {
    version: metadata.engineVersion ?? metadata.detectedVersion ?? "",
    build: metadata.engineBuild,
    apiVersion: metadata.engineApiVersion,
  };
}
