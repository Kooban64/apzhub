/** Stable platform identifiers for orchestration kernel entities. */

export type OrchestrationId = string & { readonly __brand: "OrchestrationId" };
export type CapabilityId = string & { readonly __brand: "CapabilityId" };
export type ContractId = string & { readonly __brand: "ContractId" };
export type CorrelationId = string & { readonly __brand: "CorrelationId" };
export type CausationId = string & { readonly __brand: "CausationId" };
export type TenantId = string & { readonly __brand: "TenantId" };
export type ProjectId = string & { readonly __brand: "ProjectId" };
export type ActorId = string & { readonly __brand: "ActorId" };

export function asOrchestrationId(value: string): OrchestrationId {
  return value as OrchestrationId;
}

export function asCapabilityId(value: string): CapabilityId {
  return value as CapabilityId;
}

export function asContractId(value: string): ContractId {
  return value as ContractId;
}

export function asCorrelationId(value: string): CorrelationId {
  return value as CorrelationId;
}

export function asTenantId(value: string): TenantId {
  return value as TenantId;
}

export function asProjectId(value: string): ProjectId {
  return value as ProjectId;
}

export function asActorId(value: string): ActorId {
  return value as ActorId;
}

export function createOrchestrationId(prefix = "orch"): OrchestrationId {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return asOrchestrationId(`${prefix}_${stamp}_${rand}`);
}

export function createCorrelationId(prefix = "corr"): CorrelationId {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return asCorrelationId(`${prefix}_${stamp}_${rand}`);
}
