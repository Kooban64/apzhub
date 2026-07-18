/**
 * Administration Platform Services factories (APZADMIN-002).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { AdministrationPlatformGateway } from "@apzhub/admin-contracts";
import {
  createAdministrationFoundation,
  createPlatformAdministrationService,
  type AdministrationFoundationRepos,
} from "@apzhub/admin-core";
import {
  createAdministrationPersistenceForTest,
  createProductionAdministrationPersistence,
  type AdministrationPersistenceBundle,
} from "@apzhub/admin-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createAdministrationPlatformServiceImpls,
  type AdministrationPlatformServiceImpls,
} from "./administration-service-impls";

export type AdministrationPlatformServicesBundle = {
  readonly foundation: AdministrationFoundationRepos;
  readonly persistence: AdministrationPersistenceBundle;
  readonly gatewaySurface: AdministrationPlatformGateway;
  readonly impls: AdministrationPlatformServiceImpls;
  readonly readiness: {
    readonly administrationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly workbenchEnabled: false;
    readonly httpEnabled: false;
    readonly runtimeAdminEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): AdministrationPlatformGateway;
};

export type CreateAdministrationPlatformServicesInput = {
  readonly foundation?: AdministrationFoundationRepos;
  readonly persistence?: AdministrationPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateAdministrationPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateAdministrationPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapAdministrationPlatformGatewayWithPipeline(
  gateway: AdministrationPlatformGateway,
  pipeline: RequestPipeline,
): AdministrationPlatformGateway {
  return {
    modules: wrapServiceWithPipeline(
      gateway.modules,
      pipeline,
      "administrationModules",
    ),
    categories: wrapServiceWithPipeline(
      gateway.categories,
      pipeline,
      "administrationCategories",
    ),
    sections: wrapServiceWithPipeline(
      gateway.sections,
      pipeline,
      "administrationSections",
    ),
    actions: wrapServiceWithPipeline(
      gateway.actions,
      pipeline,
      "administrationActions",
    ),
    permissions: wrapServiceWithPipeline(
      gateway.permissions,
      pipeline,
      "administrationPermissions",
    ),
    audit: wrapServiceWithPipeline(gateway.audit, pipeline, "administrationAudit"),
    history: wrapServiceWithPipeline(
      gateway.history,
      pipeline,
      "administrationHistory",
    ),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "administrationDiagnostics",
    ),
    registrations: wrapServiceWithPipeline(
      gateway.registrations,
      pipeline,
      "administrationRegistrations",
    ),
    metadata: wrapServiceWithPipeline(
      gateway.metadata,
      pipeline,
      "administrationMetadata",
    ),
    policies: wrapServiceWithPipeline(
      gateway.policies,
      pipeline,
      "administrationPolicies",
    ),
    references: wrapServiceWithPipeline(
      gateway.references,
      pipeline,
      "administrationReferences",
    ),
    capabilities: wrapServiceWithPipeline(
      gateway.capabilities,
      pipeline,
      "administrationCapabilities",
    ),
    navigations: wrapServiceWithPipeline(
      gateway.navigations,
      pipeline,
      "administrationNavigations",
    ),
    shortcuts: wrapServiceWithPipeline(
      gateway.shortcuts,
      pipeline,
      "administrationShortcuts",
    ),
    dashboards: wrapServiceWithPipeline(
      gateway.dashboards,
      pipeline,
      "administrationDashboards",
    ),
    widgets: wrapServiceWithPipeline(
      gateway.widgets,
      pipeline,
      "administrationWidgets",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: AdministrationPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
}): AdministrationPlatformServicesBundle {
  const foundation = createAdministrationFoundation({
    repos: input.persistence,
  });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => `adm_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformAdministrationService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });
  const impls = createAdministrationPlatformServiceImpls({ domain });
  const gatewaySurface = impls;

  return {
    foundation,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      administrationEnabled: true,
      persistenceMode: input.persistenceMode,
      workbenchEnabled: false,
      httpEnabled: false,
      runtimeAdminEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapAdministrationPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createAdministrationPlatformServices(
  input: CreateAdministrationPlatformServicesInput & {
    readonly persistence: AdministrationPersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): AdministrationPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
  });
}

export function createAdministrationPlatformServicesForProduction(
  input: CreateAdministrationPlatformServicesForProductionInput,
): AdministrationPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createAdministrationPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionAdministrationPersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
  });
}

export function createAdministrationPlatformServicesForTest(
  input: CreateAdministrationPlatformServicesForTestInput = {},
): AdministrationPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createAdministrationPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createAdministrationPersistenceForTest({
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
