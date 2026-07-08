import { AsyncLocalStorage } from "node:async_hooks";

import type { LawApiPersistenceContext } from "./law-api-persistence-context";

const persistenceStorage = new AsyncLocalStorage<LawApiPersistenceContext>();

export function runWithLawApiPersistenceScope<T>(
  context: LawApiPersistenceContext,
  operation: () => T,
): T {
  return persistenceStorage.run(context, operation);
}

export async function runWithLawApiPersistenceScopeAsync<T>(
  context: LawApiPersistenceContext,
  operation: () => Promise<T>,
): Promise<T> {
  return persistenceStorage.run(context, operation);
}

export function getActiveLawApiPersistenceContext():
  LawApiPersistenceContext | undefined {
  return persistenceStorage.getStore();
}
