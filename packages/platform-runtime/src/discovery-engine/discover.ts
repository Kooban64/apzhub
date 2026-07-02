import {
  resolveDiscoveryConfig,
  resolveDiscoveryRootPaths,
  type DiscoveryConfig,
} from "./config";
import { loadDiscoveredManifest } from "./loader";
import { scanForManifestFiles } from "./scanner";
import type { DiscoveryResult } from "./types";

/**
 * Discover capability manifests under configured paths.
 *
 * Responsibility: scan, load, parse YAML, produce `discovered` capabilities.
 * Does not resolve dependencies or register capabilities.
 */
export function discoverCapabilities(config: DiscoveryConfig): DiscoveryResult {
  const resolved = resolveDiscoveryConfig(config);
  const scannedRoots = resolveDiscoveryRootPaths(resolved);
  const scanResult = scanForManifestFiles(resolved, scannedRoots);

  const capabilities = [];
  const diagnostics = [...scanResult.diagnostics];

  for (const manifestRef of scanResult.manifests) {
    const loaded = loadDiscoveredManifest(manifestRef);
    if ("diagnostics" in loaded) {
      diagnostics.push(...loaded.diagnostics);
    } else {
      capabilities.push(loaded.capability);
    }
  }

  return {
    capabilities,
    diagnostics,
    manifests: scanResult.manifests,
    scannedRoots,
  };
}
