export { PLATFORM_AUTOMATION_VERSION, PLATFORM_AUTOMATION_PROGRAMME } from "./version";
export * from "./contracts/index";
export { ProviderRegistry } from "./registry/provider-registry";
export { AutomationEngine } from "./engine/automation-engine";
export { InMemoryExecutionStore, type ExecutionStore } from "./engine/execution-store";
export { canTransition, assertTransition } from "./lifecycle/transitions";
export { createPlaceholderProviders, PLACEHOLDER_IDS } from "./providers/placeholders";
export { createMatrixProviders } from "./providers/matrix-providers";
export {
  createPlaywrightProvider,
  PlaywrightAutomationProvider,
} from "./providers/playwright";
export {
  createVitestProvider,
  VitestAutomationProvider,
  normalizeVitestReport,
} from "./providers/vitest";
export {
  createAccessibilityProvider,
  AccessibilityAutomationProvider,
  normalizeAxeSummary,
} from "./providers/accessibility";
export {
  createReportIngestProvider,
  type NormalizedIngestReport,
} from "./providers/ingest/create-report-ingest-provider";
export { normalizeK6Summary } from "./providers/ingest/normalize-k6";
export { normalizeSarifOrFindings } from "./providers/ingest/normalize-sarif";
export { normalizeTestSuiteReport } from "./providers/ingest/normalize-test-report";
export {
  createPlatformAutomation,
  type CreatePlatformAutomationOptions,
  type PlatformAutomation,
} from "./sdk/create-automation";
