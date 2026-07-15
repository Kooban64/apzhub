export type CompatibilityClassification =
  "supported" | "degraded" | "unsupported" | "unknown";

export interface CompatibilityFeature {
  readonly id: string;
  readonly available: boolean;
  readonly optional: boolean;
  readonly degraded?: boolean;
  readonly notes?: string;
}

export interface AdapterCompatibilityInput {
  readonly providerId: string;
  readonly minVersion: string;
  readonly maxVersion: string;
  readonly detectedVersion?: string;
  readonly optionalFeatures?: readonly CompatibilityFeature[];
  readonly featureDetection?: Readonly<Record<string, boolean>>;
}

export interface AdapterCompatibilityResult {
  readonly providerId: string;
  readonly minVersion: string;
  readonly maxVersion: string;
  readonly detectedVersion?: string;
  readonly inRange: boolean;
  readonly classification: CompatibilityClassification;
  readonly optionalFeatures: readonly CompatibilityFeature[];
  readonly summary: string;
}

function parseSemverParts(version: string): number[] | undefined {
  const cleaned = version.replace(/^v/i, "").replace(/\.x$/i, ".0");
  const parts = cleaned.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return undefined;
  return parts;
}

function compareSemver(a: string, b: string): number | undefined {
  const ap = parseSemverParts(a);
  const bp = parseSemverParts(b);
  if (!ap || !bp) return undefined;
  const len = Math.max(ap.length, bp.length);
  for (let i = 0; i < len; i += 1) {
    const av = ap[i] ?? 0;
    const bv = bp[i] ?? 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return 0;
}

function isInRange(detected: string, min: string, max: string): boolean | undefined {
  const vsMin = compareSemver(detected, min);
  const vsMax = compareSemver(detected, max);
  if (vsMin === undefined || vsMax === undefined) return undefined;
  return vsMin >= 0 && vsMax <= 0;
}

/**
 * Provider version matrix, optional features, feature detection, degraded classification.
 */
export class AdapterCompatibilitySuite {
  evaluate(input: AdapterCompatibilityInput): AdapterCompatibilityResult {
    const featuresFromDetection = Object.entries(input.featureDetection ?? {}).map(
      ([id, available]) =>
        ({
          id,
          available,
          optional: true,
          degraded: !available,
        }) satisfies CompatibilityFeature,
    );

    const optionalFeatures = [
      ...(input.optionalFeatures ?? []),
      ...featuresFromDetection.filter(
        (f) => !(input.optionalFeatures ?? []).some((o) => o.id === f.id),
      ),
    ];

    const inRange =
      input.detectedVersion !== undefined
        ? isInRange(input.detectedVersion, input.minVersion, input.maxVersion)
        : undefined;

    let classification: CompatibilityClassification;
    if (input.detectedVersion === undefined) {
      classification = "unknown";
    } else if (inRange === false) {
      classification = "unsupported";
    } else if (optionalFeatures.some((f) => f.optional && !f.available)) {
      classification = "degraded";
    } else if (inRange === true) {
      classification = "supported";
    } else {
      classification = "unknown";
    }

    const summary = [
      `${input.providerId} compatibility: ${classification}`,
      input.detectedVersion
        ? `detected ${input.detectedVersion} (range ${input.minVersion}–${input.maxVersion})`
        : "version not detected",
      `${optionalFeatures.filter((f) => f.available).length}/${optionalFeatures.length} optional features available`,
    ].join(" — ");

    return {
      providerId: input.providerId,
      minVersion: input.minVersion,
      maxVersion: input.maxVersion,
      detectedVersion: input.detectedVersion,
      inRange: inRange === true,
      classification,
      optionalFeatures,
      summary,
    };
  }
}

export function createAdapterCompatibilitySuite(): AdapterCompatibilitySuite {
  return new AdapterCompatibilitySuite();
}

export function evaluateAdapterCompatibility(
  input: AdapterCompatibilityInput,
): AdapterCompatibilityResult {
  return createAdapterCompatibilitySuite().evaluate(input);
}
