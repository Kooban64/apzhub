import { createLawPersistenceContext } from "../persistence/law-persistence-context";
import { getSessionLawPersistenceContext } from "../persistence/law-persistence-session";

/**
 * Bind tenant scope for legal search queries (PRH-007).
 * Client-safe: must not import persistence barrel (pulls trust-repository-factory → pg).
 * APZHUB-ENG-0007 / RG-LAW-DNS.
 */
export async function runWithLegalSearchPersistenceScope<T>(
  operation: () => Promise<T>,
): Promise<T> {
  if (getSessionLawPersistenceContext()) {
    return operation();
  }

  if (typeof window === "undefined") {
    const scope = await import("../persistence/law-persistence-scope");
    if (scope.getExplicitLawPersistenceContext()) {
      return operation();
    }
    return scope.runWithLawPersistenceContextAsync(
      createLawPersistenceContext(),
      operation,
    );
  }

  // Browser workbench: shell sets session context; ALS is unavailable.
  return operation();
}
