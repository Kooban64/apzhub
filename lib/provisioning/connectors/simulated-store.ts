/**
 * In-process entitlement store for simulated connectors (dev/tests).
 * Not durable across process restarts; not a substitute for Postgres-backed state.
 */
type Row = { roleId: string | null };

const store = new Map<string, Row>();

export function simulatedStoreKey(userId: string, serviceId: string): string {
  return `${userId}\0${serviceId}`;
}

export function simulatedGetRole(userId: string, serviceId: string): string | null {
  return store.get(simulatedStoreKey(userId, serviceId))?.roleId ?? null;
}

export function simulatedSetRole(userId: string, serviceId: string, roleId: string | null): void {
  store.set(simulatedStoreKey(userId, serviceId), { roleId });
}

/** @internal Vitest */
export function resetSimulatedEntitlementStore(): void {
  store.clear();
}
