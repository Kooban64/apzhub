/**
 * Platform orchestration contracts (kernel layer).
 * Peer platform contracts (Automation/SCM/QI/…) arrive in later slices.
 */

import type { CapabilityId, ContractId } from "./identifiers";

export type OrchestrationContractKind =
  "capability" | "lifecycle" | "kernel" | "diagnostics";

export type CapabilityRegistrationLifecycle =
  "declared" | "registered" | "active" | "deprecated" | "retired";

/** Descriptor only — no invoke/execute behaviour in QO-001. */
export interface OrchestrationContractDescriptor {
  readonly contractId: ContractId | string;
  readonly kind: OrchestrationContractKind;
  readonly version: string;
  readonly name: string;
  readonly description?: string;
}

/** Empty registration framework record for future capabilities. */
export interface CapabilityRegistrationRecord {
  readonly capabilityId: CapabilityId | string;
  readonly name: string;
  readonly version: string;
  readonly lifecycle: CapabilityRegistrationLifecycle;
  readonly contractIds: readonly string[];
  readonly healthEndpoint?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly registeredAt: string;
}
