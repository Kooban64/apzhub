/**
 * Search Platform Services factories (APZSEARCH-003).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createSearchPlatformFoundation,
  createSearchPlatformFoundationForProduction,
  createSearchPlatformFoundationForTest,
  type SearchPlatformFoundation,
  type SearchPersistenceBundle,
} from "@apzhub/search-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createSearchPlatformServiceImpls,
  type SearchPlatformServiceImpls,
} from "./search-service-impls";

export type SearchPlatformServicesBundle = {
  readonly foundation: SearchPlatformFoundation;
  readonly persistence: SearchPersistenceBundle;
  readonly gatewaySurface: SearchPlatformServiceImpls;
  readonly impls: SearchPlatformServiceImpls;
  readonly readiness: {
    readonly searchEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly executionEnabled: false;
    readonly managementPlaneReady: true;
  };
  wrapWithPipeline(pipeline: RequestPipeline): SearchPlatformServiceImpls;
};

export type CreateSearchPlatformServicesInput = {
  readonly foundation?: SearchPlatformFoundation;
  readonly persistence?: SearchPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateSearchPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateSearchPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapSearchPlatformGatewayWithPipeline(
  gateway: SearchPlatformServiceImpls,
  pipeline: RequestPipeline,
): SearchPlatformServiceImpls {
  return {
    searchQuery: wrapServiceWithPipeline(gateway.searchQuery, pipeline, "searchQuery"),
    searchProviders: wrapServiceWithPipeline(
      gateway.searchProviders,
      pipeline,
      "searchProviders",
    ),
    searchConfigurations: wrapServiceWithPipeline(
      gateway.searchConfigurations,
      pipeline,
      "searchConfigurations",
    ),
    searchCapabilities: wrapServiceWithPipeline(
      gateway.searchCapabilities,
      pipeline,
      "searchCapabilities",
    ),
    searchHealth: wrapServiceWithPipeline(
      gateway.searchHealth,
      pipeline,
      "searchHealth",
    ),
    searchDiagnostics: wrapServiceWithPipeline(
      gateway.searchDiagnostics,
      pipeline,
      "searchDiagnostics",
    ),
    searchCollections: wrapServiceWithPipeline(
      gateway.searchCollections,
      pipeline,
      "searchCollections",
    ),
    searchSources: wrapServiceWithPipeline(
      gateway.searchSources,
      pipeline,
      "searchSources",
    ),
    searchScopes: wrapServiceWithPipeline(
      gateway.searchScopes,
      pipeline,
      "searchScopes",
    ),
    searchProfiles: wrapServiceWithPipeline(
      gateway.searchProfiles,
      pipeline,
      "searchProfiles",
    ),
    searchMetadata: wrapServiceWithPipeline(
      gateway.searchMetadata,
      pipeline,
      "searchMetadata",
    ),
    searchAudit: wrapServiceWithPipeline(gateway.searchAudit, pipeline, "searchAudit"),
    searchStatistics: wrapServiceWithPipeline(
      gateway.searchStatistics,
      pipeline,
      "searchStatistics",
    ),
    searchValidation: wrapServiceWithPipeline(
      gateway.searchValidation,
      pipeline,
      "searchValidation",
    ),
  };
}

function buildBundle(
  foundation: SearchPlatformFoundation,
): SearchPlatformServicesBundle {
  const impls = createSearchPlatformServiceImpls({ foundation });
  return {
    foundation,
    persistence: foundation.persistence,
    gatewaySurface: impls,
    impls,
    readiness: {
      searchEnabled: true,
      persistenceMode: foundation.readiness.persistenceMode,
      executionEnabled: false,
      managementPlaneReady: true,
    },
    wrapWithPipeline: (pipeline) =>
      wrapSearchPlatformGatewayWithPipeline(impls, pipeline),
  };
}

/**
 * Compose search platform services from an existing foundation or persistence.
 */
export function createSearchPlatformServices(
  input: CreateSearchPlatformServicesInput & {
    readonly persistence?: SearchPersistenceBundle;
  },
): SearchPlatformServicesBundle {
  if (input.foundation) {
    return buildBundle(input.foundation);
  }
  if (!input.persistence) {
    throw new Error("createSearchPlatformServices requires foundation or persistence");
  }
  const foundation = createSearchPlatformFoundation({
    persistence: input.persistence,
    now: input.now,
    id: input.id,
  });
  return buildBundle(foundation);
}

export function createSearchPlatformServicesForProduction(
  input: CreateSearchPlatformServicesForProductionInput,
): SearchPlatformServicesBundle {
  if (!input.postgresDb) {
    throw new Error(
      "createSearchPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const foundation = createSearchPlatformFoundationForProduction({
    postgresDb: input.postgresDb,
    now: input.now,
    id: input.id,
  });
  return buildBundle(foundation);
}

export function createSearchPlatformServicesForTest(
  input: CreateSearchPlatformServicesForTestInput = {},
): SearchPlatformServicesBundle {
  const foundation = createSearchPlatformFoundationForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence ?? !input.postgresDb,
    now: input.now,
    id: input.id,
  });
  return buildBundle(foundation);
}
