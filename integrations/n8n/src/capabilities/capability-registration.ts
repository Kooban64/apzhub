import {
  N8N_CORE_SERVICE_CAPABILITIES,
  type N8nCoreServiceId,
} from "./service-capabilities";

export interface N8nCapabilityRegistration {
  readonly capabilityIds: readonly string[];
  readonly serviceIds: readonly N8nCoreServiceId[];
}

export function createN8nCapabilityRegistration(): N8nCapabilityRegistration {
  return {
    capabilityIds: [
      "authentication",
      "health",
      "diagnostics",
      "workflow",
      ...N8N_CORE_SERVICE_CAPABILITIES.map((c) => c.serviceId),
    ],
    serviceIds: N8N_CORE_SERVICE_CAPABILITIES.map((c) => c.serviceId),
  };
}

export function listN8nRegisteredCapabilityIds(): readonly string[] {
  return createN8nCapabilityRegistration().capabilityIds;
}

export function isN8nServiceImplemented(serviceId: string): boolean {
  return N8N_CORE_SERVICE_CAPABILITIES.some(
    (c) => c.serviceId === serviceId && c.implemented,
  );
}
