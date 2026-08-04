/**
 * Platform orchestration contracts (kernel + catalogue layer).
 * Peer platform invoke contracts arrive in later slices.
 */

import type { ContractId } from "./identifiers";

export type OrchestrationContractKind =
  | "capability"
  | "lifecycle"
  | "kernel"
  | "diagnostics"
  | "catalogue"
  | "trigger"
  | "correlation"
  | "policy"
  | "governance"
  | "approval"
  | "decision"
  | "event"
  | "automation_coordination"
  | "source_change"
  | "enrichment"
  | "evidence_integration"
  | "executive_experience"
  | "operational"
  | "workspace_experience";

/** Descriptor only — no invoke/execute behaviour. */
export interface OrchestrationContractDescriptor {
  readonly contractId: ContractId | string;
  readonly kind: OrchestrationContractKind;
  readonly version: string;
  readonly name: string;
  readonly description?: string;
}
