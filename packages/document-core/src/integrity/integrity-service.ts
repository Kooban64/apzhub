/**
 * SHA-256 integrity service (APZDOCS-002).
 * Provider ETags are never treated as canonical checksums.
 */

import { createHash } from "node:crypto";

import type {
  DocumentBinarySource,
  DocumentIntegrityResult,
  DocumentIntegrityVerifyInput,
} from "@apzhub/document-contracts";

export async function collectBinarySource(
  source: DocumentBinarySource,
  options: { readonly maxBytes?: number; readonly signal?: AbortSignal } = {},
): Promise<Uint8Array> {
  if (source.kind === "bytes") {
    if (options.maxBytes !== undefined && source.bytes.byteLength > options.maxBytes) {
      throw new Error(`Binary source exceeds maxBytes (${options.maxBytes})`);
    }
    return source.bytes;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of source.stream) {
    if (options.signal?.aborted) {
      throw new Error("Binary read cancelled");
    }
    total += chunk.byteLength;
    if (options.maxBytes !== undefined && total > options.maxBytes) {
      throw new Error(`Binary source exceeds maxBytes (${options.maxBytes})`);
    }
    chunks.push(chunk);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function verifyDocumentIntegrity(
  input: DocumentIntegrityVerifyInput,
): DocumentIntegrityResult {
  const actualHex = sha256Hex(input.bytes);
  const actualByteLength = input.bytes.byteLength;
  if (
    input.expectedByteLength !== undefined &&
    input.expectedByteLength !== actualByteLength
  ) {
    return {
      ok: false,
      algorithm: "sha256",
      expectedHex: input.expectedHex,
      actualHex,
      expectedByteLength: input.expectedByteLength,
      actualByteLength,
      providerEtagIgnored: true,
      classification: "size_mismatch",
    };
  }
  if (input.expectedHex && input.expectedHex.toLowerCase() !== actualHex) {
    return {
      ok: false,
      algorithm: "sha256",
      expectedHex: input.expectedHex,
      actualHex,
      expectedByteLength: input.expectedByteLength,
      actualByteLength,
      providerEtagIgnored: true,
      classification: "checksum_mismatch",
    };
  }
  return {
    ok: true,
    algorithm: "sha256",
    expectedHex: input.expectedHex ?? actualHex,
    actualHex,
    expectedByteLength: input.expectedByteLength ?? actualByteLength,
    actualByteLength,
    providerEtagIgnored: true,
    classification: "valid",
  };
}

export type DocumentIntegrityService = {
  hash(bytes: Uint8Array): string;
  verify(input: DocumentIntegrityVerifyInput): DocumentIntegrityResult;
  collect(
    source: DocumentBinarySource,
    options?: { readonly maxBytes?: number; readonly signal?: AbortSignal },
  ): Promise<Uint8Array>;
};

export function createDocumentIntegrityService(): DocumentIntegrityService {
  return {
    hash: sha256Hex,
    verify: verifyDocumentIntegrity,
    collect: collectBinarySource,
  };
}
