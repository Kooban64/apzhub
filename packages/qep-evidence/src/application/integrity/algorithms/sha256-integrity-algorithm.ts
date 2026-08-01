/**
 * SHA-256 integrity algorithm — APZQEP-120-S04 reference implementation.
 */

import { createHash, timingSafeEqual } from "node:crypto";

import { EvidenceIntegrityPlatformError } from "../errors";
import type { IntegrityAlgorithm } from "./integrity-algorithm";

const SHA256_HEX_LENGTH = 64;
const HEX_PATTERN = /^[0-9a-f]{64}$/;

export function createSha256IntegrityAlgorithm(): IntegrityAlgorithm {
  return {
    algorithmId: "sha256",
    encoding: "hex",

    digestBytes(bytes: Uint8Array): string {
      return createHash("sha256").update(bytes).digest("hex");
    },

    async digestStream(chunks: AsyncIterable<Uint8Array>): Promise<string> {
      const hash = createHash("sha256");
      try {
        for await (const chunk of chunks) {
          hash.update(chunk);
        }
      } catch {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_VERIFICATION_FAILED",
          "Integrity digest stream failed",
        );
      }
      return hash.digest("hex");
    },

    digestsEqual(expected: string, actual: string): boolean {
      const a = expected.trim().toLowerCase();
      const b = actual.trim().toLowerCase();
      if (a.length !== b.length || a.length !== SHA256_HEX_LENGTH) {
        return false;
      }
      try {
        return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
      } catch {
        return false;
      }
    },

    isSupportedDigest(digest: string): boolean {
      return HEX_PATTERN.test(digest.trim().toLowerCase());
    },
  };
}
