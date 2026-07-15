/**
 * Shared binary-source collection for storage providers (APZDOCS-002).
 */

import type { DocumentBinarySource } from "@apzhub/document-contracts";

export async function collectProviderBinarySource(
  source: DocumentBinarySource,
  options: {
    readonly maxObjectBytes: number;
    readonly signal?: AbortSignal;
  },
): Promise<Uint8Array> {
  if (source.kind === "bytes") {
    if (source.bytes.byteLength > options.maxObjectBytes) {
      throw new Error("maxObjectBytes exceeded");
    }
    return source.bytes;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of source.stream) {
    if (options.signal?.aborted) throw new Error("cancelled");
    total += chunk.byteLength;
    if (total > options.maxObjectBytes) {
      throw new Error("maxObjectBytes exceeded");
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
