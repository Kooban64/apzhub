import type { Capability } from "../capability/types";
import type { CapabilityKind } from "../manifest-engine/capability-kinds";
import type { ManifestFileName } from "./config";

export type DiscoveryDiagnosticCode =
  | "ROOT_NOT_FOUND"
  | "SCAN_ERROR"
  | "READ_ERROR"
  | "MANIFEST_PARSE_ERROR"
  | "MANIFEST_VALIDATION_ERROR"
  | "VERSION_INVALID"
  | "PLATFORM_VERSION_INVALID"
  | "KIND_MISMATCH";

export interface DiscoveryDiagnostic {
  readonly code: DiscoveryDiagnosticCode;
  readonly message: string;
  readonly path?: string;
  readonly field?: string;
}

export interface DiscoveredManifestRef {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly fileName: ManifestFileName | string;
  readonly kindHint: CapabilityKind | string;
}

export interface DiscoveryResult {
  /** Capability definitions in `discovered` lifecycle state. */
  readonly capabilities: readonly Capability[];
  readonly diagnostics: readonly DiscoveryDiagnostic[];
  /** All located manifest files in deterministic path order. */
  readonly manifests: readonly DiscoveredManifestRef[];
  readonly scannedRoots: readonly string[];
}
