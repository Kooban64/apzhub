export {
  ACTION_FRAMEWORK_PLATFORM_VERSION,
  type ActionFrameworkPlatformVersion,
} from "./platform-version";
export {
  PLATFORM_ACTION_CATALOGUE,
  type PlatformActionCatalogueEntry,
} from "./platform-action-catalogue";
export {
  buildPlatformActionDescriptors,
  catalogueEntryToDescriptor,
  registerBuiltInWorkbenchCommands,
  registerPlatformActionCatalogue,
  type PlatformActionRegistrationResult,
} from "./register-platform-actions";
export {
  actionOriginLabel,
  isCapabilityAction,
  isPlatformAction,
} from "./action-origin";
export {
  bootstrapActionRegistry,
  type BootstrapActionRegistryOptions,
  type BootstrapActionRegistryResult,
} from "./bootstrap-action-registry";
