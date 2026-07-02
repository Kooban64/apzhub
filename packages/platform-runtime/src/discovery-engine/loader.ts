import { readFileSync } from "node:fs";

import { buildCapabilityFromManifest } from "../capability/factory";
import type { Capability } from "../capability/types";
import { parseCapabilityManifestYaml } from "../manifest-engine/validate";
import type { DiscoveredManifestRef, DiscoveryDiagnostic } from "./types";

const MANIFEST_ERROR_CODE_MAP: Record<string, DiscoveryDiagnostic["code"]> = {
  MANIFEST_PARSE_ERROR: "MANIFEST_PARSE_ERROR",
  MANIFEST_VALIDATION_ERROR: "MANIFEST_VALIDATION_ERROR",
  VERSION_INVALID: "VERSION_INVALID",
  PLATFORM_VERSION_INVALID: "PLATFORM_VERSION_INVALID",
  KIND_MISMATCH: "KIND_MISMATCH",
};

export function loadDiscoveredManifest(
  manifestRef: DiscoveredManifestRef,
): { capability: Capability } | { diagnostics: DiscoveryDiagnostic[] } {
  let source: string;
  try {
    source = readFileSync(manifestRef.absolutePath, "utf8");
  } catch (error) {
    return {
      diagnostics: [
        {
          code: "READ_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to read manifest file",
          path: manifestRef.absolutePath,
        },
      ],
    };
  }

  const parsed = parseCapabilityManifestYaml(source);
  if (!parsed.success) {
    return {
      diagnostics: parsed.errors.map((issue) => ({
        code: MANIFEST_ERROR_CODE_MAP[issue.code] ?? "MANIFEST_VALIDATION_ERROR",
        message: issue.message,
        path: manifestRef.absolutePath,
        field: issue.field,
      })),
    };
  }

  return {
    capability: buildCapabilityFromManifest(parsed.data, {
      lifecycleState: "discovered",
    }),
  };
}
