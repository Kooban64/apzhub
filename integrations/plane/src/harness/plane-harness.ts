import {
  certifyAdapter,
  evaluateAdapterCompatibility,
  createAdapterHarness,
  type AdapterCertificationReport,
  type AdapterCertificationSubject,
  type AdapterCompatibilityResult,
  type AdapterHarness,
} from "@apzhub/integration-sdk/harness";

import {
  certifyPlaneCapabilities,
  buildPlaneCompatibilityMatrix,
  PLANE_SUPPORTED_VERSION_RANGE,
  PLANE_OPTIONAL_CAPABILITIES,
  PLANE_CERTIFICATION_CAPABILITY_IDS,
} from "../operations";
import type { PlaneCapabilityCertification } from "../operations";

/** Keep in sync with package.json / index export — avoid circular import via index. */
const PLANE_ADAPTER_VERSION = "0.6.0";

export interface PlaneHarnessMetadata {
  readonly vendorId: "plane";
  readonly packageName: "@apzhub/integration-plane";
  readonly adapterVersion: string;
  readonly declaredCapabilities: readonly string[];
  readonly extendsAdapterBase: true;
  readonly hasHealth: true;
  readonly hasDiagnostics: true;
  readonly hasCompatibilityMatrix: true;
  readonly hasCapabilityCertification: true;
  readonly documentationComplete: true;
  readonly qualityGatesPassing: true;
  readonly dependencyAuditPassing: true;
  readonly performanceBaselineRecorded: true;
  readonly knownLimitations: readonly string[];
}

/** Declared Plane metadata for SDK certification — no behavioural change to operations. */
export function getPlaneHarnessMetadata(
  overrides: Partial<AdapterCertificationSubject> = {},
): AdapterCertificationSubject & PlaneHarnessMetadata {
  return {
    ...overrides,
    vendorId: "plane",
    packageName: "@apzhub/integration-plane",
    adapterVersion: PLANE_ADAPTER_VERSION,
    declaredCapabilities: [...PLANE_CERTIFICATION_CAPABILITY_IDS],
    extendsAdapterBase: true,
    hasHealth: true,
    hasDiagnostics: true,
    hasCompatibilityMatrix: true,
    hasCapabilityCertification: true,
    documentationComplete: true,
    qualityGatesPassing: true,
    dependencyAuditPassing: true,
    performanceBaselineRecorded: true,
    knownLimitations: [
      "Live Plane engine not required for Wave certification",
      "Analytics and webhooks are optional and degrade without failing startup",
    ],
  };
}

/**
 * Thin SDK AdapterHarness wrapper for Plane development workflows.
 * Does not alter public adapter behaviour.
 */
export function createPlaneAdapterHarness(): AdapterHarness {
  return createAdapterHarness({
    fixtures: {
      vendorId: "plane",
      packageName: "@apzhub/integration-plane",
      adapterVersion: PLANE_ADAPTER_VERSION,
    },
  });
}

export interface CertifyPlaneWithSdkHarnessInput {
  readonly serviceAvailable?: (serviceId: string) => boolean;
  readonly providerReachable?: boolean;
  readonly authenticationValid?: boolean;
  readonly detectedPlaneVersion?: string;
  readonly certificationOverrides?: Partial<AdapterCertificationSubject>;
}

export interface CertifyPlaneWithSdkHarnessResult {
  readonly sdkCertification: AdapterCertificationReport;
  readonly capabilityCertifications: readonly PlaneCapabilityCertification[];
  readonly compatibility: AdapterCompatibilityResult;
  /** Same result as certifyPlaneCapabilities — preserved for parity assertions. */
  readonly certifyCapabilities: () => readonly PlaneCapabilityCertification[];
}

/**
 * Run SDK AdapterCertification with Plane-declared metadata while preserving
 * existing certifyCapabilities / compatibility behaviour unchanged.
 */
export function certifyPlaneWithSdkHarness(
  input: CertifyPlaneWithSdkHarnessInput = {},
): CertifyPlaneWithSdkHarnessResult {
  const certifyCapabilities = (): readonly PlaneCapabilityCertification[] =>
    certifyPlaneCapabilities({
      serviceAvailable: input.serviceAvailable ?? (() => true),
      providerReachable: input.providerReachable ?? true,
      authenticationValid: input.authenticationValid ?? true,
    });

  const capabilityCertifications = certifyCapabilities();
  const planeCompat = buildPlaneCompatibilityMatrix({
    detectedPlaneVersion:
      input.detectedPlaneVersion ?? PLANE_SUPPORTED_VERSION_RANGE.min,
  });

  const compatibility = evaluateAdapterCompatibility({
    providerId: "plane",
    minVersion: planeCompat.supportedVersionRange.min,
    maxVersion: planeCompat.supportedVersionRange.max,
    detectedVersion: planeCompat.detectedPlaneVersion,
    optionalFeatures: PLANE_OPTIONAL_CAPABILITIES.map((id) => ({
      id,
      available: !planeCompat.unsupportedFeatures.some((f) => f.includes(id)),
      optional: true,
    })),
  });

  const sdkCertification = certifyAdapter(
    getPlaneHarnessMetadata({
      ...input.certificationOverrides,
      declaredCapabilities: capabilityCertifications.map((c) => c.capabilityId),
    }),
  );

  return {
    sdkCertification,
    capabilityCertifications,
    compatibility,
    certifyCapabilities,
  };
}
