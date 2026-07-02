export type {
  ActionCapabilityRecord,
  ActionExtractionDiagnostics,
  ActionExtractionResult,
} from "./types";
export {
  inferActionHandlerKind,
  mapWorkbenchActionToDescriptor,
} from "./map-action-manifest";
export { extractActionDescriptorsFromCapabilities } from "./extract-actions";
export {
  extractToolbarRegionsFromCapabilities,
  type ToolbarExtractionDiagnostics,
  type ToolbarExtractionResult,
  type ToolbarExtractionWarning,
} from "./extract-toolbar";
export {
  populateRegistryFromCapabilities,
  type ManifestRegistryPopulationResult,
} from "./populate-registry";
