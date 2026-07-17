/**
 * Identity Platform Services factories (APZIDENTITY-002).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { IdentityPlatformGateway } from "@apzhub/identity-contracts";
import {
  createIdentityFoundation,
  createPlatformIdentityService,
  type IdentityFoundationRepos,
} from "@apzhub/identity-core";
import {
  createIdentityPersistenceForTest,
  createProductionIdentityPersistence,
  type IdentityPersistenceBundle,
} from "@apzhub/identity-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createIdentityPlatformServiceImpls,
  type IdentityPlatformServiceImpls,
} from "./identity-service-impls";

export type IdentityPlatformServicesBundle = {
  readonly foundation: IdentityFoundationRepos;
  readonly persistence: IdentityPersistenceBundle;
  readonly gatewaySurface: IdentityPlatformGateway;
  readonly impls: IdentityPlatformServiceImpls;
  readonly readiness: {
    readonly identityEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly workbenchEnabled: false;
    readonly httpEnabled: false;
    readonly authenticationManaged: false;
    readonly provisioningEnabled: false;
    readonly directorySyncEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): IdentityPlatformGateway;
};

export type CreateIdentityPlatformServicesInput = {
  readonly foundation?: IdentityFoundationRepos;
  readonly persistence?: IdentityPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateIdentityPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateIdentityPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapIdentityPlatformGatewayWithPipeline(
  gateway: IdentityPlatformGateway,
  pipeline: RequestPipeline,
): IdentityPlatformGateway {
  return {
    users: wrapServiceWithPipeline(gateway.users, pipeline, "identityUsers"),
    groups: wrapServiceWithPipeline(gateway.groups, pipeline, "identityGroups"),
    roles: wrapServiceWithPipeline(gateway.roles, pipeline, "identityRoles"),
    organisations: wrapServiceWithPipeline(
      gateway.organisations,
      pipeline,
      "identityOrganisations",
    ),
    tenants: wrapServiceWithPipeline(
      gateway.tenants,
      pipeline,
      "identityTenants",
    ),
    departments: wrapServiceWithPipeline(
      gateway.departments,
      pipeline,
      "identityDepartments",
    ),
    positions: wrapServiceWithPipeline(
      gateway.positions,
      pipeline,
      "identityPositions",
    ),
    memberships: wrapServiceWithPipeline(
      gateway.memberships,
      pipeline,
      "identityMemberships",
    ),
    serviceAssignments: wrapServiceWithPipeline(
      gateway.serviceAssignments,
      pipeline,
      "identityServiceAssignments",
    ),
    invitations: wrapServiceWithPipeline(
      gateway.invitations,
      pipeline,
      "identityInvitations",
    ),
    activation: wrapServiceWithPipeline(
      gateway.activation,
      pipeline,
      "identityActivation",
    ),
    deactivation: wrapServiceWithPipeline(
      gateway.deactivation,
      pipeline,
      "identityDeactivation",
    ),
    policies: wrapServiceWithPipeline(
      gateway.policies,
      pipeline,
      "identityPolicies",
    ),
    audit: wrapServiceWithPipeline(gateway.audit, pipeline, "identityAudit"),
    history: wrapServiceWithPipeline(
      gateway.history,
      pipeline,
      "identityHistory",
    ),
    references: wrapServiceWithPipeline(
      gateway.references,
      pipeline,
      "identityReferences",
    ),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "identityDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: IdentityPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
}): IdentityPlatformServicesBundle {
  const foundation = createIdentityFoundation({
    repos: input.persistence,
  });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id =
    input.id ?? (() => `iam_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformIdentityService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });
  const impls = createIdentityPlatformServiceImpls({ domain });
  const gatewaySurface = impls;

  return {
    foundation,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      identityEnabled: true,
      persistenceMode: input.persistenceMode,
      workbenchEnabled: false,
      httpEnabled: false,
      authenticationManaged: false,
      provisioningEnabled: false,
      directorySyncEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapIdentityPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createIdentityPlatformServices(
  input: CreateIdentityPlatformServicesInput & {
    readonly persistence: IdentityPersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): IdentityPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
  });
}

export function createIdentityPlatformServicesForProduction(
  input: CreateIdentityPlatformServicesForProductionInput,
): IdentityPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createIdentityPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionIdentityPersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
  });
}

export function createIdentityPlatformServicesForTest(
  input: CreateIdentityPlatformServicesForTestInput = {},
): IdentityPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createIdentityPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createIdentityPersistenceForTest({
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
