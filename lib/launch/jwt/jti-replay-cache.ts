/** In-process single-use guard for launch JWT `jti` (not cluster-safe). */

const consumedUntilMs = new Map<string, number>();

function prune(now: number): void {
  for (const [jti, until] of consumedUntilMs) {
    if (until < now) {
      consumedUntilMs.delete(jti);
    }
  }
}

/**
 * @returns true if this `jti` was not seen before (and is now reserved until `tokenExpEpochSec`).
 * @returns false if already consumed (replay).
 */
export function consumeLaunchJtiOnce(jti: string, tokenExpEpochSec: number): boolean {
  const now = Date.now();
  prune(now);
  if (consumedUntilMs.has(jti)) {
    return false;
  }
  const until = Math.max(tokenExpEpochSec * 1000, now + 1000);
  consumedUntilMs.set(jti, until);
  return true;
}

/** @internal Vitest */
export function resetLaunchJtiReplayCacheForTests(): void {
  consumedUntilMs.clear();
}
