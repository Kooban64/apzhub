import { normaliseManifestDependencies } from "./dependencies";
import type { CapabilityManifest } from "../manifest-engine";
import type {
  BuildCapabilityOptions,
  Capability,
  CapabilityLifecycleState,
} from "./types";

export function buildCapabilityFromManifest(
  manifest: CapabilityManifest,
  options: BuildCapabilityOptions = {},
): Capability {
  const lifecycleState: CapabilityLifecycleState =
    options.lifecycleState ?? "discovered";
  const healthState = options.healthState ?? "unknown";

  return {
    id: manifest.id,
    kind: manifest.kind,
    manifest,
    metadata: manifest.metadata,
    dependencies: normaliseManifestDependencies(manifest.dependencies),
    lifecycleState,
    healthState,
    version: manifest.version,
  };
}

export function withCapabilityLifecycleState(
  capability: Capability,
  lifecycleState: CapabilityLifecycleState,
): Capability {
  if (capability.lifecycleState === lifecycleState) {
    return capability;
  }

  return { ...capability, lifecycleState };
}
