/**
 * Integrity algorithm registry — APZQEP-120-S04.
 */

import { EvidenceIntegrityPlatformError } from "../errors";
import type {
  IntegrityAlgorithm,
  IntegrityAlgorithmRegistry,
} from "./integrity-algorithm";
import { createSha256IntegrityAlgorithm } from "./sha256-integrity-algorithm";

export function createIntegrityAlgorithmRegistry(
  algorithms: readonly IntegrityAlgorithm[] = [createSha256IntegrityAlgorithm()],
): IntegrityAlgorithmRegistry {
  const byId = new Map<string, IntegrityAlgorithm>();
  for (const algo of algorithms) {
    byId.set(algo.algorithmId, algo);
  }
  if (!byId.has("sha256")) {
    byId.set("sha256", createSha256IntegrityAlgorithm());
  }

  return {
    get(algorithmId) {
      const found = byId.get(algorithmId.trim().toLowerCase());
      if (!found) {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_ALGORITHM_UNSUPPORTED",
          "Integrity algorithm is not supported",
          { algorithmId },
        );
      }
      return found;
    },
    defaultAlgorithm() {
      return byId.get("sha256")!;
    },
    list() {
      return [...byId.values()];
    },
  };
}
