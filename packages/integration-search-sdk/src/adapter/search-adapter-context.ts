/**
 * Search adapter context — wraps AdapterContext with search-specific helpers.
 */

import {
  buildAdapterContext,
  type AdapterContext,
  type BuildAdapterContextInput,
} from "@apzhub/integration-sdk";
import {
  SearchCapabilityRegistration,
  createSearchCapabilityRegistration,
  SearchProviderCapabilities,
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  type SearchIntegrationCapabilityId,
} from "../capabilities";
import {
  SearchOperationRunner,
  createSearchOperationRunner,
} from "../contracts";
import {
  SearchProviderDiagnostics,
  createSearchProviderDiagnostics,
} from "../diagnostics";
import { SearchErrorTranslator, createSearchErrorTranslator } from "../errors";
import {
  SearchProviderHealth,
  createSearchProviderHealth,
} from "../health";
import {
  SearchConfigurationValidator,
  SearchProviderLifecycle,
  createSearchConfigurationValidator,
  createSearchProviderLifecycle,
} from "../lifecycle";
import {
  SearchLogger,
  SearchMetrics,
  createSearchLogger,
  createSearchMetrics,
} from "../observability";
import {
  SearchCompatibilityReportBuilder,
  createSearchCompatibilityReportBuilder,
} from "../compatibility";

export interface SearchAdapterContext extends AdapterContext {
  readonly searchCapabilities: SearchProviderCapabilities;
  readonly searchCapabilityRegistration: SearchCapabilityRegistration;
  readonly operationRunner: SearchOperationRunner;
  readonly searchHealth: SearchProviderHealth;
  readonly searchDiagnostics: SearchProviderDiagnostics;
  readonly searchLifecycle: SearchProviderLifecycle;
  readonly searchConfigurationValidator: SearchConfigurationValidator;
  readonly searchMetrics: SearchMetrics;
  readonly searchLogger: SearchLogger;
  readonly searchErrorTranslator: SearchErrorTranslator;
  readonly searchCompatibility: SearchCompatibilityReportBuilder;
  readonly declaredSearchCapabilities: readonly SearchIntegrationCapabilityId[];
}

export interface BuildSearchAdapterContextInput extends BuildAdapterContextInput {
  readonly declaredSearchCapabilities?: readonly SearchIntegrationCapabilityId[];
  readonly searchCapabilityRegistration?: SearchCapabilityRegistration;
  readonly operationRunner?: SearchOperationRunner;
}

export function buildSearchAdapterContext(
  input: BuildSearchAdapterContextInput,
): SearchAdapterContext {
  const base = buildAdapterContext(input);
  const declaredSearchCapabilities =
    input.declaredSearchCapabilities ?? DEFAULT_DECLARED_SEARCH_CAPABILITIES;

  return {
    ...base,
    searchCapabilities: new SearchProviderCapabilities(declaredSearchCapabilities),
    searchCapabilityRegistration:
      input.searchCapabilityRegistration ?? createSearchCapabilityRegistration(),
    operationRunner: input.operationRunner ?? createSearchOperationRunner(),
    searchHealth: createSearchProviderHealth(base.clock),
    searchDiagnostics: createSearchProviderDiagnostics(base.clock),
    searchLifecycle: createSearchProviderLifecycle(),
    searchConfigurationValidator: createSearchConfigurationValidator(),
    searchMetrics: createSearchMetrics(base.metrics),
    searchLogger: createSearchLogger(base.logger),
    searchErrorTranslator: createSearchErrorTranslator(base.errorTranslator),
    searchCompatibility: createSearchCompatibilityReportBuilder(),
    declaredSearchCapabilities,
  };
}

/** Builder alias matching milestone vocabulary. */
export class SearchAdapterContextBuilder {
  build(input: BuildSearchAdapterContextInput): SearchAdapterContext {
    return buildSearchAdapterContext(input);
  }
}

export function createSearchAdapterContextBuilder(): SearchAdapterContextBuilder {
  return new SearchAdapterContextBuilder();
}
