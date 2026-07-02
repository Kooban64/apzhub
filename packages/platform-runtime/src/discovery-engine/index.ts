export {
  DEFAULT_DISCOVERY_ROOTS,
  DEFAULT_IGNORE_DIR_NAMES,
  DEFAULT_MANIFEST_FILE_NAMES,
  MANIFEST_FILENAME_KIND_MAP,
  resolveDiscoveryConfig,
  resolveDiscoveryRootPaths,
  type DiscoveryConfig,
  type ManifestFileName,
  type ResolvedDiscoveryConfig,
} from "./config";
export { discoverCapabilities } from "./discover";
export { loadDiscoveredManifest } from "./loader";
export { scanForManifestFiles } from "./scanner";
export type {
  DiscoveredManifestRef,
  DiscoveryDiagnostic,
  DiscoveryDiagnosticCode,
  DiscoveryResult,
} from "./types";

export const DISCOVERY_ENGINE_STATUS = "active" as const;
