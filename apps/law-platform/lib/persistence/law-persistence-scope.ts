import { AsyncLocalStorage } from "node:async_hooks";

import {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";
import {
  getSessionLawPersistenceContext,
  resetLawPersistenceSession,
} from "./law-persistence-session";

const persistenceStorage = new AsyncLocalStorage<LawPersistenceContext>();

export {
  getSessionLawPersistenceContext,
  setSessionLawPersistenceContext,
} from "./law-persistence-session";

export function runWithLawPersistenceContext<T>(
  context: LawPersistenceContext,
  operation: () => T,
): T {
  return persistenceStorage.run(context, operation);
}

export async function runWithLawPersistenceContextAsync<T>(
  context: LawPersistenceContext,
  operation: () => Promise<T>,
): Promise<T> {
  return persistenceStorage.run(context, operation);
}

export function getActiveLawPersistenceContext(): LawPersistenceContext {
  return (
    getSessionLawPersistenceContext() ??
    persistenceStorage.getStore() ??
    createLawPersistenceContext()
  );
}

/** Returns context only when explicitly bound via session or ALS (PRH-007 search isolation). */
export function getExplicitLawPersistenceContext(): LawPersistenceContext | undefined {
  return getSessionLawPersistenceContext() ?? persistenceStorage.getStore();
}

export function resetLawPersistenceScope(): void {
  resetLawPersistenceSession();
}
