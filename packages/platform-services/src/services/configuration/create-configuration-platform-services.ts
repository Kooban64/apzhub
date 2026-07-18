/**
 * Configuration Platform Services factories (APZCONFIG-002).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { ConfigurationPlatformGateway } from "@apzhub/configuration-contracts";
import {
  createConfigurationFoundation,
  createPlatformConfigurationService,
  type ConfigurationFoundationRepos,
} from "@apzhub/configuration-core";
import {
  createConfigurationPersistenceForTest,
  createProductionConfigurationPersistence,
  type ConfigurationPersistenceBundle,
} from "@apzhub/configuration-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createConfigurationPlatformServiceImpls,
  type ConfigurationPlatformServiceImpls,
} from "./configuration-service-impls";

export type ConfigurationPlatformServicesBundle = {
  readonly foundation: ConfigurationFoundationRepos;
  readonly persistence: ConfigurationPersistenceBundle;
  readonly gatewaySurface: ConfigurationPlatformGateway;
  readonly impls: ConfigurationPlatformServiceImpls;
  readonly readiness: {
    readonly configurationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly runtimeApplyEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): ConfigurationPlatformGateway;
};

export type CreateConfigurationPlatformServicesInput = {
  readonly foundation?: ConfigurationFoundationRepos;
  readonly persistence?: ConfigurationPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateConfigurationPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateConfigurationPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapConfigurationPlatformGatewayWithPipeline(
  gateway: ConfigurationPlatformGateway,
  pipeline: RequestPipeline,
): ConfigurationPlatformGateway {
  return {
    configurations: wrapServiceWithPipeline(
      gateway.configurations,
      pipeline,
      "configurationConfigurations",
    ),
    namespaces: wrapServiceWithPipeline(
      gateway.namespaces,
      pipeline,
      "configurationNamespaces",
    ),
    groups: wrapServiceWithPipeline(gateway.groups, pipeline, "configurationGroups"),
    versions: wrapServiceWithPipeline(
      gateway.versions,
      pipeline,
      "configurationVersions",
    ),
    overrides: wrapServiceWithPipeline(
      gateway.overrides,
      pipeline,
      "configurationOverrides",
    ),
    scopes: wrapServiceWithPipeline(gateway.scopes, pipeline, "configurationScopes"),
    validation: wrapServiceWithPipeline(
      gateway.validation,
      pipeline,
      "configurationValidation",
    ),
    references: wrapServiceWithPipeline(
      gateway.references,
      pipeline,
      "configurationReferences",
    ),
    audit: wrapServiceWithPipeline(gateway.audit, pipeline, "configurationAudit"),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "configurationDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: ConfigurationPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
}): ConfigurationPlatformServicesBundle {
  const foundation = createConfigurationFoundation({ repos: input.persistence });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => `cfg_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformConfigurationService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });
  const impls = createConfigurationPlatformServiceImpls({ domain });
  const gatewaySurface = impls;

  return {
    foundation,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      configurationEnabled: true,
      persistenceMode: input.persistenceMode,
      runtimeApplyEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapConfigurationPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createConfigurationPlatformServices(
  input: CreateConfigurationPlatformServicesInput & {
    readonly persistence: ConfigurationPersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): ConfigurationPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
  });
}

export function createConfigurationPlatformServicesForProduction(
  input: CreateConfigurationPlatformServicesForProductionInput,
): ConfigurationPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createConfigurationPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionConfigurationPersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
  });
}

export function createConfigurationPlatformServicesForTest(
  input: CreateConfigurationPlatformServicesForTestInput = {},
): ConfigurationPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createConfigurationPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createConfigurationPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
  });
}
