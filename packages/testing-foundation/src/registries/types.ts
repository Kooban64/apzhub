/** Capability descriptor stubs for in-memory registries — no business logic. */

export interface CapabilityDescriptor {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "planned" | "enabled" | "disabled";
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface TestingCapabilityDescriptor extends CapabilityDescriptor {
  readonly kind: "testing";
}

export interface CertificationCapabilityDescriptor extends CapabilityDescriptor {
  readonly kind: "certification";
}

export interface EvidenceCapabilityDescriptor extends CapabilityDescriptor {
  readonly kind: "evidence";
}

export interface AutomationCapabilityDescriptor extends CapabilityDescriptor {
  readonly kind: "automation";
}

export interface DomainCapabilityDescriptor extends CapabilityDescriptor {
  readonly kind: "domain";
  readonly entityKinds?: readonly string[];
}

export type AnyCapabilityDescriptor =
  | TestingCapabilityDescriptor
  | CertificationCapabilityDescriptor
  | EvidenceCapabilityDescriptor
  | AutomationCapabilityDescriptor
  | DomainCapabilityDescriptor;
