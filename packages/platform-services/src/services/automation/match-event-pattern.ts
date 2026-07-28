/**
 * Matches an event id against a subscription pattern.
 * Supports exact ids and prefix patterns ending in `.*` (aligned with ENF).
 */
export function matchesEventPattern(eventPattern: string, eventId: string): boolean {
  const pattern = eventPattern.trim();
  if (!pattern) {
    return false;
  }

  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2);
    if (!prefix) {
      return false;
    }
    return eventId === prefix || eventId.startsWith(`${prefix}.`);
  }

  return pattern === eventId;
}
