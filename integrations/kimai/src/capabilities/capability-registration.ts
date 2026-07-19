import {
  KIMAI_CORE_SERVICE_CAPABILITIES,
  type KimaiCoreServiceId,
} from "./service-capabilities";

export interface KimaiCapabilityRegistration {
  readonly capabilityIds: readonly string[];
  readonly serviceIds: readonly KimaiCoreServiceId[];
}

export function createKimaiCapabilityRegistration(): KimaiCapabilityRegistration {
  return {
    capabilityIds: [
      "authentication",
      "health",
      "diagnostics",
      "time_tracking",
      ...KIMAI_CORE_SERVICE_CAPABILITIES.map((c) => c.serviceId),
    ],
    serviceIds: KIMAI_CORE_SERVICE_CAPABILITIES.map((c) => c.serviceId),
  };
}

export function listKimaiRegisteredCapabilityIds(): readonly string[] {
  return createKimaiCapabilityRegistration().capabilityIds;
}

export function isKimaiServiceImplemented(serviceId: string): boolean {
  return KIMAI_CORE_SERVICE_CAPABILITIES.some(
    (c) => c.serviceId === serviceId && c.implemented,
  );
}
