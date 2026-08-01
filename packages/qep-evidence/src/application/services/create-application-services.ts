import type { EvidenceUnitOfWork } from "../../domain/ports/repositories";
import { createEventCollector, type DomainEventCollector } from "../orchestration";
import type {
  AuditPort,
  ClockPort,
  IdPort,
  PermissionPort,
  StoragePort,
} from "../ports";
import {
  createEvidenceEnumerationService,
  createEvidencePermissionEngine,
  createEvidenceQueryBuilder,
  type EvidenceEnumerationService,
  type EvidencePermissionEngine,
  type EvidenceQueryBuilder,
} from "../query";
import {
  createEvidenceAccessPolicyService,
  createEvidenceSecurityGate,
  createPermissionPort,
  createSecuredEvidenceCommandService,
  createSecuredEvidenceQueryService,
  createSecurityAuditService,
  type EvidenceAccessPolicyService,
  type EvidenceSecurityGate,
  type SecurityAuditService,
} from "../security";
import {
  createEvidenceCommandService,
  type EvidenceCommandService,
} from "./evidence-command-service";
import {
  createEvidenceQueryService,
  type EvidenceQueryService,
} from "./evidence-query-service";

export type CreateEvidenceApplicationServicesInput = {
  readonly uow: EvidenceUnitOfWork;
  readonly storage: StoragePort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
  readonly audit?: AuditPort;
  readonly collector?: DomainEventCollector;
  /**
   * When true (default for ENG-110E factory), wrap orchestration with L-02 security.
   * Inner orchestration remains unchanged.
   */
  readonly secure?: boolean;
  readonly permissions?: PermissionPort;
};

export type EvidenceApplicationServices = {
  readonly programme: "APZQEP-ENG-110E";
  readonly commands: EvidenceCommandService;
  readonly queries: EvidenceQueryService;
  readonly collector: DomainEventCollector;
  readonly policy: EvidenceAccessPolicyService;
  readonly securityGate: EvidenceSecurityGate;
  readonly securityAudit: SecurityAuditService;
  readonly permissions: PermissionPort;
  readonly secured: boolean;
  /** APZQEP-120-S02 — reusable permission-aware enumeration pipeline. */
  readonly permissionEngine: EvidencePermissionEngine;
  readonly queryBuilder: EvidenceQueryBuilder;
  readonly enumeration: EvidenceEnumerationService | undefined;
};

/**
 * Factory for Application Layer services with ENG-110E security enforcement.
 */
export function createEvidenceApplicationServices(
  input: CreateEvidenceApplicationServicesInput,
): EvidenceApplicationServices {
  const collector = input.collector ?? createEventCollector();
  const permissions = input.permissions ?? createPermissionPort();
  const policy = createEvidenceAccessPolicyService({
    uow: input.uow,
    permissions,
  });
  const securityAudit = createSecurityAuditService({
    uow: input.uow,
    audit: input.audit,
    clock: input.clock,
    ids: input.ids,
  });
  const securityGate = createEvidenceSecurityGate({
    policy,
    audit: securityAudit,
  });

  const deps = {
    uow: input.uow,
    storage: input.storage,
    clock: input.clock,
    ids: input.ids,
    audit: input.audit,
    collector,
  };

  const innerCommands = createEvidenceCommandService(deps);
  const innerQueries = createEvidenceQueryService(deps);
  const secure = input.secure !== false;

  const permissionEngine = createEvidencePermissionEngine(securityGate);
  const queryBuilder = createEvidenceQueryBuilder();
  const enumeration = secure
    ? createEvidenceEnumerationService({
        inner: innerQueries,
        permissions: permissionEngine,
        queryBuilder,
        securityAudit,
      })
    : undefined;

  const commands = secure
    ? createSecuredEvidenceCommandService(innerCommands, securityGate)
    : innerCommands;
  const queries = secure
    ? createSecuredEvidenceQueryService(innerQueries, securityGate, {
        loadEvidenceForActions: async (ctx, evidenceId) => {
          const found = await input.uow.evidence.getById(ctx.tenantId, evidenceId);
          if (!found) {
            throw new Error(`Evidence ${evidenceId} not found`);
          }
          return found;
        },
        enumeration,
      })
    : innerQueries;

  return {
    programme: "APZQEP-ENG-110E",
    commands,
    queries,
    collector,
    policy,
    securityGate,
    securityAudit,
    permissions,
    secured: secure,
    permissionEngine,
    queryBuilder,
    enumeration,
  };
}
