/**
 * Stub managed search provider (APZSEARCH-002).
 * Lifecycle only — no engine, no query execution.
 */

import {
  FOUNDATION_SEARCH_CAPABILITIES,
  isSafeSearchDiagnosticsPayload,
  validateSearchProviderConfiguration,
  validateSearchQuery,
  type ManagedSearchProvider,
  type SearchProviderConfiguration,
  type SearchProviderDescriptor,
} from "@apzhub/search-contracts";

export type CreateStubManagedSearchProviderInput = {
  readonly descriptor: SearchProviderDescriptor;
  readonly now?: () => string;
};

/**
 * Vendor-neutral stub used by the registry framework for lifecycle testing.
 * Future engines implement ManagedSearchProvider separately.
 */
export function createStubManagedSearchProvider(
  input: CreateStubManagedSearchProviderInput,
): ManagedSearchProvider {
  const now = input.now ?? (() => new Date().toISOString());
  let initialised = false;
  let configuration: SearchProviderConfiguration | null = null;

  return {
    descriptor: input.descriptor,
    async initialise(_context, config) {
      const validation = validateSearchProviderConfiguration(config);
      if (!validation.valid) {
        throw new Error(validation.issues.join("; "));
      }
      configuration = config;
      initialised = true;
    },
    validateConfiguration(_context, config) {
      return validateSearchProviderConfiguration(config);
    },
    validateQuery(_context, query) {
      return validateSearchQuery(query);
    },
    getHealth() {
      return {
        // Management-plane stubs never report execution AVAILABLE
        status: "unavailable" as const,
        message: initialised
          ? "Stub provider initialised — search execution unavailable"
          : "Stub provider not initialised — search execution unavailable",
        checkedAt: now(),
      };
    },
    getCapabilities() {
      return {
        ...FOUNDATION_SEARCH_CAPABILITIES,
        ...(configuration?.capabilities ?? {}),
        semantic: false as const,
        vector: false as const,
        fuzzy: false as const,
      };
    },
    getDiagnostics() {
      const payload = {
        providerId: input.descriptor.id,
        kind: input.descriptor.kind,
        initialised,
        hasConfiguration: configuration !== null,
        authRefsPresent: Boolean(configuration?.authenticationRefs?.credentialRef),
      };
      if (!isSafeSearchDiagnosticsPayload(payload)) {
        throw new Error("unsafe diagnostics");
      }
      return payload;
    },
    async dispose() {
      initialised = false;
      configuration = null;
    },
  };
}
