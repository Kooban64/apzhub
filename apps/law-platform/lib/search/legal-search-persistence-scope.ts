import {
  createLawPersistenceContext,
  getExplicitLawPersistenceContext,
  getSessionLawPersistenceContext,
  runWithLawPersistenceContextAsync,
} from "../persistence";

/** Bind tenant scope for legal search queries (PRH-007). */
export async function runWithLegalSearchPersistenceScope<T>(
  operation: () => Promise<T>,
): Promise<T> {
  if (getExplicitLawPersistenceContext()) {
    return operation();
  }

  const context = getSessionLawPersistenceContext() ?? createLawPersistenceContext();
  return runWithLawPersistenceContextAsync(context, operation);
}
