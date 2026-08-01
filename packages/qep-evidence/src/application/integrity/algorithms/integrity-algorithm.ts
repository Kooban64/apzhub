/**
 * Provider-neutral integrity algorithm contract — APZQEP-120-S04.
 */

import type { IntegrityAlgorithmId } from "../types";

export type IntegrityAlgorithm = {
  readonly algorithmId: IntegrityAlgorithmId | string;
  readonly encoding: "hex";
  digestBytes(bytes: Uint8Array): string;
  digestStream(chunks: AsyncIterable<Uint8Array>): Promise<string>;
  /**
   * Timing-safe equality for equal-length digests in the algorithm encoding.
   * Returns false when lengths differ (never throws for compare).
   */
  digestsEqual(expected: string, actual: string): boolean;
  isSupportedDigest(digest: string): boolean;
};

export type IntegrityAlgorithmRegistry = {
  get(algorithmId: string): IntegrityAlgorithm;
  defaultAlgorithm(): IntegrityAlgorithm;
  list(): readonly IntegrityAlgorithm[];
};
