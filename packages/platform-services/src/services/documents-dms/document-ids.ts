/**
 * Opaque Documents DMS document ids — reversible for connector-internal lookup.
 * Never expose engine brand; never use raw sequential decimal in public APIs.
 */
export function toPublicDocumentId(engineId: number): string {
  if (!Number.isInteger(engineId) || engineId <= 0) {
    throw new Error("Documents DMS engine id must be a positive integer");
  }
  return `dmsdoc_${Buffer.from(String(engineId), "utf8").toString("base64url")}`;
}

export function fromPublicDocumentId(publicId: string): number | null {
  const trimmed = publicId.trim();
  if (!trimmed.startsWith("dmsdoc_")) return null;
  try {
    const raw = Buffer.from(trimmed.slice("dmsdoc_".length), "base64url").toString(
      "utf8",
    );
    if (!/^[1-9][0-9]*$/.test(raw)) return null;
    const engineId = Number(raw);
    return Number.isSafeInteger(engineId) && engineId > 0 ? engineId : null;
  } catch {
    return null;
  }
}
