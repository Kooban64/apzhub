import { KIMAI_CORE_SERVICE_CAPABILITIES } from "../capabilities/service-capabilities";
import { DEFAULT_KIMAI_VERSION_MIN } from "../kimai-config";
import type {
  KimaiCapabilityAvailability,
  KimaiCapabilityCertification,
  KimaiFeatureDetectionResult,
} from "./types";

const CERTIFICATION_META: Readonly<
  Record<
    string,
    {
      readonly minimumKimaiVersion: string;
      readonly optional: boolean;
      readonly dependencyRequirements: readonly string[];
      readonly displayName: string;
    }
  >
> = {
  authentication: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: [],
    displayName: "Authentication",
  },
  version: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Version Detection",
  },
  health: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Health",
  },
  diagnostics: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["health"],
    displayName: "Diagnostics",
  },
  compatibility: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["version"],
    displayName: "Compatibility",
  },
  readiness: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["health", "compatibility"],
    displayName: "Readiness Classification",
  },
  feature_detection: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["connectivity"],
    displayName: "Feature Detection",
  },
  capability_certification: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["compatibility", "feature_detection"],
    displayName: "Capability Certification",
  },
  timesheets: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Timesheets",
  },
  activities: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Activities",
  },
  customers: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Customers",
  },
  projects: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Projects",
  },
  tags: {
    minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
    optional: true,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Tags",
  },
};

export interface CertifyKimaiCapabilitiesInput {
  readonly providerReachable: boolean;
  readonly authenticationValid: boolean;
  readonly featureDetection?: KimaiFeatureDetectionResult;
}

function resolveAvailability(
  capabilityId: string,
  input: CertifyKimaiCapabilitiesInput,
): KimaiCapabilityAvailability {
  if (!input.authenticationValid && capabilityId !== "authentication") {
    return "unavailable";
  }
  if (!input.providerReachable) {
    if (capabilityId === "authentication") {
      return input.authenticationValid ? "degraded" : "unavailable";
    }
    return "unavailable";
  }
  if (
    capabilityId === "version" &&
    input.featureDetection &&
    !input.featureDetection.versionAvailable
  ) {
    return "degraded";
  }
  if (
    capabilityId === "health" &&
    input.featureDetection &&
    !input.featureDetection.pingAvailable
  ) {
    return "degraded";
  }
  const declared = KIMAI_CORE_SERVICE_CAPABILITIES.find(
    (c) => c.serviceId === capabilityId,
  );
  if (!declared?.implemented) {
    return "not_applicable";
  }
  return "available";
}

export function certifyKimaiCapabilities(
  input: CertifyKimaiCapabilitiesInput,
): readonly KimaiCapabilityCertification[] {
  return KIMAI_CORE_SERVICE_CAPABILITIES.map((capability) => {
    const meta = CERTIFICATION_META[capability.serviceId] ?? {
      minimumKimaiVersion: DEFAULT_KIMAI_VERSION_MIN,
      optional: true,
      dependencyRequirements: [] as const,
      displayName: capability.serviceId,
    };
    return {
      capabilityId: capability.serviceId,
      displayName: meta.displayName,
      availability: resolveAvailability(capability.serviceId, input),
      optional: meta.optional,
      minimumKimaiVersion: meta.minimumKimaiVersion,
      dependencyRequirements: meta.dependencyRequirements,
      notes: capability.notes ?? [],
    };
  });
}

export const KIMAI_CERTIFICATION_CAPABILITY_IDS = KIMAI_CORE_SERVICE_CAPABILITIES.map(
  (c) => c.serviceId,
);
