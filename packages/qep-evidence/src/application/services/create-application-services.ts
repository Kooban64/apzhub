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
  createEvidenceIntegrityPlatformService,
  type EvidenceIntegrityPlatformService,
} from "../integrity";
import {
  createEvidenceCatalogueService,
  type EvidenceCatalogueService,
} from "../catalogue";
import {
  createEvidenceLifecyclePlatformService,
  createInMemoryLifecycleHistoryRepository,
  type EvidenceLifecyclePlatformService,
} from "../lifecycle";
import type { EvidenceLifecycleHistoryRepository } from "../../domain/ports/lifecycle-history";
import type { QepEvidenceEventPublisher } from "../events/publisher";
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
  /** APZQEP-120-S07 — platform event publisher (Application Services only). */
  readonly platformEvents?: QepEvidenceEventPublisher;
  /**
   * When true (default for ENG-110E factory), wrap orchestration with L-02 security.
   * Inner orchestration remains unchanged.
   */
  readonly secure?: boolean;
  readonly permissions?: PermissionPort;
  readonly lifecycleHistory?: EvidenceLifecycleHistoryRepository;
};

export type EvidenceApplicationServices = {
  readonly programme: "APZQEP-ENG-110E";
  readonly commands: EvidenceCommandService;
  readonly queries: EvidenceQueryService;
  readonly collector: DomainEventCollector;
  readonly platformEvents: QepEvidenceEventPublisher | undefined;
  readonly policy: EvidenceAccessPolicyService;
  readonly securityGate: EvidenceSecurityGate;
  readonly securityAudit: SecurityAuditService;
  readonly permissions: PermissionPort;
  readonly secured: boolean;
  /** APZQEP-120-S02 — reusable permission-aware enumeration pipeline. */
  readonly permissionEngine: EvidencePermissionEngine;
  readonly queryBuilder: EvidenceQueryBuilder;
  readonly enumeration: EvidenceEnumerationService | undefined;
  /** APZQEP-120-S04 — content integrity verification platform. */
  readonly integrity: EvidenceIntegrityPlatformService;
  /** APZQEP-120-S05 — logical evidence catalogue facade. */
  readonly catalogue: EvidenceCatalogueService;
  /** APZQEP-120-S06 — lifecycle governance platform. */
  readonly lifecycle: EvidenceLifecyclePlatformService;
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
    platformEvents: input.platformEvents,
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

  const integrity = createEvidenceIntegrityPlatformService({
    deps,
    securityGate,
  });

  const catalogue = createEvidenceCatalogueService({
    commands,
    queries,
  } as EvidenceApplicationServices);

  const lifecycleHistory =
    input.lifecycleHistory ?? createInMemoryLifecycleHistoryRepository();
  const lifecycle = createEvidenceLifecyclePlatformService({
    deps,
    securityGate,
    lifecycleHistory,
  });

  return {
    programme: "APZQEP-ENG-110E",
    commands,
    queries,
    collector,
    platformEvents: input.platformEvents,
    policy,
    securityGate,
    securityAudit,
    permissions,
    secured: secure,
    permissionEngine,
    queryBuilder,
    enumeration,
    integrity,
    catalogue,
    lifecycle,
  };
}
