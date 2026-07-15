import {
  PLANE_CORE_SERVICE_CAPABILITIES,
  type PlaneCoreServiceId,
} from "../capabilities/service-capabilities";
import type {
  PlaneCapabilityAvailability,
  PlaneCapabilityCertification,
  PlaneFeatureDetectionResult,
} from "./types";

const DEFAULT_MIN_VERSION = "0.23.0";

/** Capability metadata for certification — optional capabilities degrade without failing startup. */
const CERTIFICATION_META: Readonly<
  Record<
    string,
    {
      readonly minimumPlaneVersion: string;
      readonly optional: boolean;
      readonly dependencyRequirements: readonly string[];
      readonly displayName: string;
    }
  >
> = {
  workspaces: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Workspaces",
  },
  projects: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["workspaces"],
    displayName: "Projects",
  },
  project_states: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects"],
    displayName: "States",
  },
  labels: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects"],
    displayName: "Labels",
  },
  cycles: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects"],
    displayName: "Cycles",
  },
  modules: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects"],
    displayName: "Modules",
  },
  members: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects"],
    displayName: "Members",
  },
  tasks: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects", "project_states"],
    displayName: "Tasks",
  },
  comments: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["tasks"],
    displayName: "Comments",
  },
  activity: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["tasks"],
    displayName: "Activity",
  },
  watchers: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["tasks"],
    displayName: "Watchers",
  },
  analytics: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: true,
    dependencyRequirements: ["projects", "cycles"],
    displayName: "Analytics",
  },
  webhooks: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: true,
    dependencyRequirements: ["authentication", "connectivity"],
    displayName: "Webhooks",
  },
  events: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: [],
    displayName: "Events",
  },
  synchronisation: {
    minimumPlaneVersion: DEFAULT_MIN_VERSION,
    optional: false,
    dependencyRequirements: ["projects", "tasks"],
    displayName: "Synchronisation",
  },
};

export interface CertifyCapabilitiesInput {
  readonly serviceAvailable: (serviceId: PlaneCoreServiceId) => boolean;
  readonly enabledCapabilities?: ReadonlySet<string>;
  readonly featureDetection?: PlaneFeatureDetectionResult;
  readonly providerReachable?: boolean;
  readonly authenticationValid?: boolean;
}

function resolveAvailability(
  implemented: boolean,
  available: boolean,
  optional: boolean,
  degraded: boolean,
): PlaneCapabilityAvailability {
  if (!implemented) return "unavailable";
  if (!available && optional) return "optional_unavailable";
  if (!available) return "unavailable";
  if (degraded) return "degraded";
  return "available";
}

/**
 * Build a capability self-assessment matrix for Plane (reference pattern for future adapters).
 */
export function certifyPlaneCapabilities(
  input: CertifyCapabilitiesInput,
): readonly PlaneCapabilityCertification[] {
  const unavailable = new Set(input.featureDetection?.unavailableCapabilities ?? []);
  const enabled = input.enabledCapabilities;

  return PLANE_CORE_SERVICE_CAPABILITIES.map((capability) => {
    const meta = CERTIFICATION_META[capability.serviceId] ?? {
      minimumPlaneVersion: DEFAULT_MIN_VERSION,
      optional: false,
      dependencyRequirements: [],
      displayName: capability.serviceId,
    };

    const implemented = true;
    const serviceUp = input.serviceAvailable(capability.serviceId);
    const featureBlocked = unavailable.has(capability.serviceId);
    const providerDown = input.providerReachable === false;
    const authDown = input.authenticationValid === false;

    const available =
      serviceUp &&
      !featureBlocked &&
      !(providerDown && !meta.optional) &&
      !(authDown && capability.serviceId !== "events");

    const capabilityEnabled =
      enabled === undefined ? true : enabled.has(capability.serviceId);

    const degraded =
      available &&
      (providerDown ||
        authDown ||
        (input.featureDetection?.detections.some(
          (entry) =>
            entry.capabilityId === capability.serviceId &&
            entry.optional &&
            !entry.available,
        ) ??
          false));

    const reasons: string[] = [];
    if (!serviceUp) reasons.push("service_not_constructed");
    if (featureBlocked) reasons.push("feature_detection_unavailable");
    if (providerDown && !meta.optional) reasons.push("provider_unreachable");
    if (authDown && capability.serviceId !== "events") reasons.push("authentication_invalid");
    if (!capabilityEnabled) reasons.push("capability_disabled");
    if (degraded) reasons.push("operating_in_degraded_mode");

    return {
      capabilityId: meta.displayName.toLowerCase().replace(/\s+/g, "_"),
      serviceId: capability.serviceId,
      implemented,
      available: available && capabilityEnabled,
      enabled: capabilityEnabled,
      supportedOperations: capability.operations,
      minimumPlaneVersion: meta.minimumPlaneVersion,
      optional: meta.optional,
      degraded,
      status: resolveAvailability(
        implemented,
        available && capabilityEnabled,
        meta.optional,
        degraded,
      ),
      dependencyRequirements: meta.dependencyRequirements,
      reasons,
    };
  });
}
