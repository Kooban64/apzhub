import { InMemoryRegistry } from "./in-memory-registry";
import type {
  AutomationCapabilityDescriptor,
  CertificationCapabilityDescriptor,
  DomainCapabilityDescriptor,
  EvidenceCapabilityDescriptor,
  TestingCapabilityDescriptor,
} from "./types";

export class TestingRegistry extends InMemoryRegistry<TestingCapabilityDescriptor> {}

export class CertificationRegistry extends InMemoryRegistry<CertificationCapabilityDescriptor> {}

export class EvidenceRegistry extends InMemoryRegistry<EvidenceCapabilityDescriptor> {}

export class AutomationRegistry extends InMemoryRegistry<AutomationCapabilityDescriptor> {}

export class DomainRegistry extends InMemoryRegistry<DomainCapabilityDescriptor> {}

export function createTestingRegistries(): {
  readonly testing: TestingRegistry;
  readonly certification: CertificationRegistry;
  readonly evidence: EvidenceRegistry;
  readonly automation: AutomationRegistry;
  readonly domain: DomainRegistry;
} {
  return {
    testing: new TestingRegistry(),
    certification: new CertificationRegistry(),
    evidence: new EvidenceRegistry(),
    automation: new AutomationRegistry(),
    domain: new DomainRegistry(),
  };
}
