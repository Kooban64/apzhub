import {
  METABASE_CORE_SERVICE_CAPABILITIES,
  type MetabaseCoreServiceId,
} from "./service-capabilities";

export interface MetabaseCapabilityRegistration {
  readonly capabilityIds: readonly string[];
  readonly serviceIds: readonly MetabaseCoreServiceId[];
}

export function createMetabaseCapabilityRegistration(): MetabaseCapabilityRegistration {
  return {
    capabilityIds: [
      "authentication",
      "health",
      "diagnostics",
      "analytics",
      ...METABASE_CORE_SERVICE_CAPABILITIES.map((c) => c.serviceId),
    ],
    serviceIds: METABASE_CORE_SERVICE_CAPABILITIES.map((c) => c.serviceId),
  };
}

export function listMetabaseRegisteredCapabilityIds(): readonly string[] {
  return createMetabaseCapabilityRegistration().capabilityIds;
}

export function isMetabaseServiceImplemented(serviceId: string): boolean {
  return METABASE_CORE_SERVICE_CAPABILITIES.some(
    (c) => c.serviceId === serviceId && c.implemented,
  );
}
