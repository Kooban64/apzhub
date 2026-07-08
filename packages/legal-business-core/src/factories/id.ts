let entityCounter = 0;

/** Generates mock UUID-like identifiers for factories — no persistence. */
export function createEntityId(prefix: string): string {
  entityCounter += 1;
  const suffix = entityCounter.toString(16).padStart(12, "0");
  return `${prefix}${suffix.slice(0, 8)}-0001-4000-8000-${suffix.padStart(12, "0")}`;
}

/** Resets the mock entity counter — test helper only. */
export function resetEntityIdCounter(): void {
  entityCounter = 0;
}
