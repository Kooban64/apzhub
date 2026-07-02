export interface ModuleRegistrationContract {
  id: string;
  name: string;
  version: string;
}

export interface PlatformSdkContracts {
  registerModule: (module: ModuleRegistrationContract) => void;
}

/** SDK interface stubs — full implementation deferred to post-SPR-001 sprints. */
export const platformSdkContracts: PlatformSdkContracts = {
  registerModule: () => {
    throw new Error("Module registration is not available in SPR-001");
  },
};

/** Capability manifest types and validation (Manifest Engine). */
export type {
  CapabilityManifest,
  ComponentCapabilityManifest,
  ModuleCapabilityManifest,
  ServiceCapabilityManifest,
} from "@apzhub/platform-runtime/manifest-engine";
export {
  validateCapabilityManifest,
  parseCapabilityManifestYaml,
  type ManifestValidationResult,
  type ManifestValidationError,
} from "@apzhub/platform-runtime/manifest-engine";
export {
  isValidSemver,
  satisfiesPlatformVersion,
} from "@apzhub/platform-runtime/version-manager";
