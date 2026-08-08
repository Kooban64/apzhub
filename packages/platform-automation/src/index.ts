export { PLATFORM_AUTOMATION_VERSION, PLATFORM_AUTOMATION_PROGRAMME } from "./version";
export * from "./contracts/index";
export { ProviderRegistry } from "./registry/provider-registry";
export { AutomationEngine } from "./engine/automation-engine";
export { InMemoryExecutionStore, type ExecutionStore } from "./engine/execution-store";
export { canTransition, assertTransition } from "./lifecycle/transitions";
export { createPlaceholderProviders, PLACEHOLDER_IDS } from "./providers/placeholders";
export {
  createPlaywrightProvider,
  PlaywrightAutomationProvider,
} from "./providers/playwright";
export {
  createPlatformAutomation,
  type CreatePlatformAutomationOptions,
  type PlatformAutomation,
} from "./sdk/create-automation";
