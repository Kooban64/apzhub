import { AsyncLocalStorage } from "node:async_hooks";

import {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";

const persistenceStorage = new AsyncLocalStorage<LawPersistenceContext>();

/** Client/session-scoped context for browser bundle wiring (LAW-012-03). */
let sessionPersistenceContext: LawPersistenceContext | undefined;

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

export function setSessionLawPersistenceContext(
  context: LawPersistenceContext | undefined,
): void {
  sessionPersistenceContext = context;
}

export function getSessionLawPersistenceContext(): LawPersistenceContext | undefined {
  return sessionPersistenceContext;
}

export function getActiveLawPersistenceContext(): LawPersistenceContext {
  return (
    sessionPersistenceContext ??
    persistenceStorage.getStore() ??
    createLawPersistenceContext()
  );
}

/** Returns context only when explicitly bound via session or ALS (PRH-007 search isolation). */
export function getExplicitLawPersistenceContext(): LawPersistenceContext | undefined {
  return sessionPersistenceContext ?? persistenceStorage.getStore();
}

export function resetLawPersistenceScope(): void {
  sessionPersistenceContext = undefined;
}
