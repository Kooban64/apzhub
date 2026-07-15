export {
  createAutomationIngestionServices,
  createAutomationAdapterRegistry,
  createVitestAdapter,
  createPlaywrightReportAdapter,
  createJunitXmlAdapter,
  createGenericJsonAdapter,
  createGenericTapAdapter,
  createAllureMetadataAdapter,
  createAutomationNormalizationService,
  createAutomationValidationService,
  type AutomationIngestionServices,
  type AutomationIngestionServiceDeps,
} from "./factory";

export { createAutomationNormalizationService as createNormalizationService } from "./normalization";
export { fingerprintPayload } from "./validation";
