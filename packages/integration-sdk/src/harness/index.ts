export type {
  HarnessCheckOutcome,
  HarnessCheckResult,
  HarnessCategoryResult,
  AdapterPackageStructure,
  AdapterHarnessOptions,
  AdapterHarnessState,
  ScaffoldAdapterInput,
  AdapterFixtureSet,
  AdapterFileMap,
} from "./types";

export { AdapterHarness, createAdapterHarness, mergeFileMaps } from "./adapter-harness";

export type { AdapterTemplate, AdapterTemplateFileSpec } from "./template";
export {
  REFERENCE_ADAPTER_TEMPLATE,
  getAdapterTemplate,
  listRequiredTemplatePaths,
} from "./template";

export type { AdapterScaffoldResult } from "./scaffold";
export { AdapterScaffold, scaffoldAdapter, createAdapterScaffold } from "./scaffold";

export type {
  CertificationCategory,
  CertificationCategoryInput,
  AdapterCertificationSubject,
  AdapterCertificationReport,
} from "./certification/types";
export { CERTIFICATION_CATEGORIES } from "./certification/types";
export {
  AdapterCertification,
  createAdapterCertification,
  certifyAdapter,
} from "./certification/engine";
export {
  summariseOutcome,
  buildCertificationReport,
  certificationReportToMarkdown,
} from "./certification/report";

export type {
  AdapterComplianceInput,
  AdapterComplianceResult,
} from "./compliance/types";
export {
  AdapterCompliance,
  createAdapterCompliance,
  assessAdapterCompliance,
} from "./compliance/framework";

export type {
  AdapterValidatorInput,
  AdapterValidatorResult,
} from "./validation/validator";
export {
  AdapterValidator,
  createAdapterValidator,
  validateAdapter,
} from "./validation/validator";
export type { CapabilityValidationInput } from "./validation/capability-validator";
export { validateAdapterCapabilities } from "./validation/capability-validator";

export type {
  ContractArea,
  ContractSubjectMetadata,
  AdapterContractSuiteResult,
} from "./contracts/suite";
export {
  AdapterContractSuite,
  createAdapterContractSuite,
  runAdapterContractSuite,
} from "./contracts/suite";

export type { BuildRequestContextInput } from "./testing/test-kit";
export { AdapterTestKit, createAdapterTestKit } from "./testing/test-kit";
export type { FixtureFramework } from "./testing/fixtures";
export { createDefaultFixtures, createFixtureFramework } from "./testing/fixtures";

export type {
  AdapterMockHarnessOptions,
  SimulatedHttpResult,
} from "./mock/mock-harness";
export { AdapterMockHarness, createAdapterMockHarness } from "./mock/mock-harness";

export type { DocumentationGeneratorInput } from "./docs/generator";
export {
  AdapterDocumentationGenerator,
  createAdapterDocumentationGenerator,
} from "./docs/generator";

export type {
  QualityGateStatus,
  AdapterQualityInputs,
  AdapterQualityReport,
} from "./quality/report";
export {
  AdapterQualityReportBuilder,
  buildAdapterQualityReport,
  createAdapterQualityReportBuilder,
} from "./quality/report";

export type {
  CompatibilityClassification,
  CompatibilityFeature,
  AdapterCompatibilityInput,
  AdapterCompatibilityResult,
} from "./compatibility/suite";
export {
  AdapterCompatibilitySuite,
  createAdapterCompatibilitySuite,
  evaluateAdapterCompatibility,
} from "./compatibility/suite";

export type {
  PerformanceTiming,
  AdapterPerformanceReport,
  AdapterPerformanceHarnessOptions,
} from "./performance/harness";
export {
  AdapterPerformanceHarness,
  createAdapterPerformanceHarness,
} from "./performance/harness";

export type {
  BoundaryValidationInput,
  BoundaryValidationResult,
} from "./boundary/validator";
export {
  AdapterBoundaryValidator,
  createAdapterBoundaryValidator,
  validateAdapterBoundary,
  DEFAULT_FORBIDDEN_IMPORT_PATTERNS,
  DEFAULT_PROVIDER_LEAK_PATTERNS,
} from "./boundary/validator";

export type { CiCheckBundle } from "./ci/helpers";
export {
  runCertificationChecks,
  runContractChecks,
  runBoundaryChecks,
  runDocumentationChecks,
  buildQualityReport,
} from "./ci/helpers";
