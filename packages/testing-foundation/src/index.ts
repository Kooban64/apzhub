export const TESTING_FOUNDATION_VERSION = "0.1.0";

export type {
  CapabilityDescriptor,
  TestingCapabilityDescriptor,
  CertificationCapabilityDescriptor,
  EvidenceCapabilityDescriptor,
  AutomationCapabilityDescriptor,
  DomainCapabilityDescriptor,
  AnyCapabilityDescriptor,
} from "./registries/types";

export { InMemoryRegistry } from "./registries/in-memory-registry";
export {
  TestingRegistry,
  CertificationRegistry,
  EvidenceRegistry,
  AutomationRegistry,
  DomainRegistry,
  createTestingRegistries,
} from "./registries";

export type { ValidationIssue, ValidationOutcome } from "./validation";
export {
  createValidationOutcome,
  validateRequiredString,
  validatePlatformId,
  validateEnumMembership,
  validateRequirementInput,
  validateTestCaseInput,
  validateCertificationTransition,
  validateExecutionStatusValue,
  validateTestResultStatusValue,
} from "./validation";
