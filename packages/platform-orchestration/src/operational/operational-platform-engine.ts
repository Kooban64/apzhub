/**
 * Enterprise Operational Platform (QO-016).
 *
 * Answers: how is the completed platform safely operated in production?
 *
 * Descriptive, never prescriptive. Exposes platform state — never defines it.
 * Never deploys, scales, mutates config, or executes orchestration.
 */

import type {
  CreateOperationalReadinessPackageInput,
  OperationalAuditEntry,
  OperationalContract,
  OperationalContractState,
  OperationalDiagnosticsSnapshot,
  OperationalMetadata,
  OperationalPlatformDiagnostics,
  OperationalReadinessPackage,
  OperationalReadinessStatus,
  VersionMetadata,
} from "../contracts/operational";
import { OrchestrationError } from "../contracts/errors";
import { OPERATIONAL_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import {
  PLATFORM_ORCHESTRATION_LEGACY_SLICE,
  PLATFORM_ORCHESTRATION_PROGRAMME,
  PLATFORM_ORCHESTRATION_SLICE,
  PLATFORM_ORCHESTRATION_VERSION,
} from "../version";
import {
  buildOperationalContract,
  listBuiltinOperationalEndpoints,
} from "./operational-contracts";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface OperationalPlatformEngineOptions {
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function bump(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

export class OperationalPlatformEngine {
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages: DurableMap<OperationalReadinessPackage>;
  private readonly healthStatistics: Record<string, number> = {};
  private readonly readinessStatistics: Record<string, number> = {};
  private readonly livenessStatistics: Record<string, number> = {};
  private readonly endpointStatistics: Record<string, number> = {};
  private eventPublishCount = 0;
  private latestPackageId?: string;

  constructor(options: OperationalPlatformEngineOptions) {
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.packages = new DurableMap<OperationalReadinessPackage>(
      "operational_readiness_package",
      options.documentStore,
      (pkg) => ({
        tenantId: pkg.tenantId,
        projectId: pkg.projectId,
        orchestrationId: this.orchestrationId,
        status: pkg.readinessStatus,
        actorId: pkg.actorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.packages.hydrate();
  }

  /**
   * Create an immutable Operational Readiness Package.
   * Descriptive snapshot only — never performs operational actions.
   */
  async createOperationalReadinessPackage(
    input: CreateOperationalReadinessPackageInput,
  ): Promise<OperationalReadinessPackage> {
    const tenantId = input.tenantId.trim();
    if (!tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_OPERATIONAL_READINESS_PACKAGE",
        "tenantId is required",
      );
    }
    if (input.supersedesPackageId && !this.packages.has(input.supersedesPackageId)) {
      throw new OrchestrationError(
        "validation",
        "OPERATIONAL_READINESS_PACKAGE_NOT_FOUND",
        `Prior operational readiness package not found: ${input.supersedesPackageId}`,
        { operationalReadinessPackageId: input.supersedesPackageId },
      );
    }

    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;
    const operationalReadinessPackageId = createId("orp");

    const executiveExperiencePackageRef =
      input.executiveExperiencePackageRef?.trim() || undefined;
    const evidenceIntegrationPackageRef =
      input.evidenceIntegrationPackageRef?.trim() || undefined;
    const decisionPackageRef = input.decisionPackageRef?.trim() || undefined;

    const sourceRefs = [
      `orchestration:${this.orchestrationId}`,
      executiveExperiencePackageRef,
      evidenceIntegrationPackageRef,
      decisionPackageRef,
    ].filter((r): r is string => Boolean(r));

    const healthState: OperationalContractState = input.healthState ?? "healthy";
    const readinessState: OperationalContractState = input.readinessState ?? "ready";
    const livenessState: OperationalContractState = input.livenessState ?? "live";
    const startupState: OperationalContractState = input.startupState ?? "ready";
    const shutdownState: OperationalContractState = input.shutdownState ?? "stopped";
    const degradedState: OperationalContractState = input.degradedState ?? "healthy";
    const maintenanceState: OperationalContractState =
      input.maintenanceState ?? "healthy";

    const healthContract = buildOperationalContract({
      kind: "health",
      state: healthState,
      detail: "Descriptive health contract — does not change platform state",
      sourceRefs,
    });
    const readinessContract = buildOperationalContract({
      kind: "readiness",
      state: readinessState,
      detail: "Descriptive readiness contract — traffic-readiness observation only",
      sourceRefs,
    });
    const livenessContract = buildOperationalContract({
      kind: "liveness",
      state: livenessState,
      detail: "Descriptive liveness contract — process-liveness observation only",
      sourceRefs,
    });
    const startupContract = buildOperationalContract({
      kind: "startup",
      state: startupState,
      detail: "Descriptive startup contract — does not start services",
      sourceRefs,
    });
    const shutdownContract = buildOperationalContract({
      kind: "shutdown",
      state: shutdownState,
      detail: "Descriptive shutdown contract — does not stop services",
      sourceRefs,
    });
    const degradedOperationContract = buildOperationalContract({
      kind: "degraded_operation",
      state: degradedState,
      detail: "Descriptive degraded-operation observation",
      sourceRefs,
    });
    const maintenanceStateContract = buildOperationalContract({
      kind: "maintenance_state",
      state: maintenanceState,
      detail: "Descriptive maintenance-state observation — does not enter maintenance",
      sourceRefs,
    });

    bump(this.healthStatistics, healthState);
    bump(this.readinessStatistics, readinessState);
    bump(this.livenessStatistics, livenessState);

    const version: VersionMetadata = Object.freeze({
      version: PLATFORM_ORCHESTRATION_VERSION,
      programme: PLATFORM_ORCHESTRATION_PROGRAMME,
      slice: PLATFORM_ORCHESTRATION_SLICE,
      legacySlice: PLATFORM_ORCHESTRATION_LEGACY_SLICE,
      buildRef: input.buildRef?.trim() || undefined,
      checkedAt: now,
    });

    const featureFlagRefs = Object.freeze([...(input.featureFlagRefs ?? [])]);
    const configurationRefs = Object.freeze([...(input.configurationRefs ?? [])]);
    const operationalCapabilityRefs = Object.freeze([
      ...(input.operationalCapabilityRefs ?? [
        "op.capability.health",
        "op.capability.readiness",
        "op.capability.liveness",
        "op.capability.diagnostics",
      ]),
    ]);

    const operationalMetadata: OperationalMetadata = Object.freeze({
      version,
      buildRef: input.buildRef?.trim() || undefined,
      deployment: Object.freeze({
        deploymentRef: input.deploymentRef?.trim() || undefined,
        environmentRef: input.environmentRef?.trim() || undefined,
        runtimeRef: input.runtimeRef?.trim() || undefined,
        featureFlagRefs,
        configurationRefs,
        descriptive: true as const,
        mutatesNothing: true as const,
      }),
      runtimeRef: input.runtimeRef?.trim() || undefined,
      environmentRef: input.environmentRef?.trim() || undefined,
      featureFlagRefs,
      configurationRefs,
      operationalCapabilityRefs,
      descriptive: true as const,
    });

    const operationalEndpoints = listBuiltinOperationalEndpoints();
    for (const ep of operationalEndpoints) {
      bump(this.endpointStatistics, ep.name);
    }

    let readinessStatus: OperationalReadinessStatus = "ready";
    if (maintenanceState === "maintenance") {
      readinessStatus = "maintenance";
    } else if (
      healthState === "degraded" ||
      readinessState === "degraded" ||
      degradedState === "degraded"
    ) {
      readinessStatus = "degraded";
    } else if (
      healthState === "unknown" ||
      readinessState !== "ready" ||
      livenessState !== "live"
    ) {
      readinessStatus = "not_ready";
    }
    if (input.supersedesPackageId && readinessStatus === "not_ready") {
      readinessStatus = "superseded";
    }

    const diagnostics: OperationalDiagnosticsSnapshot = Object.freeze({
      healthStatistics: Object.freeze({ ...this.healthStatistics }),
      readinessStatistics: Object.freeze({ ...this.readinessStatistics }),
      livenessStatistics: Object.freeze({ ...this.livenessStatistics }),
      versionStatistics: Object.freeze({
        version: version.version,
        slice: version.slice,
        programme: version.programme,
      }),
      endpointCount: operationalEndpoints.length,
      eventPublishCount: this.eventPublishCount,
      health:
        readinessStatus === "ready"
          ? "healthy"
          : readinessStatus === "degraded" || readinessStatus === "maintenance"
            ? "degraded"
            : "unhealthy",
      ready: readinessStatus === "ready",
      checkedAt: now,
    });

    const auditRefs = Object.freeze([...(input.auditRefs ?? [])]);
    const auditHistory: OperationalAuditEntry[] = [
      Object.freeze({
        entryId: createId("ora"),
        timestamp: now,
        action: "operational_readiness_package_created",
        actorId,
        detail: `Status ${readinessStatus}; descriptive-only; no deployments`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("ora"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: OperationalReadinessPackage = Object.freeze({
      operationalReadinessPackageId,
      healthContract,
      readinessContract,
      livenessContract,
      startupContract,
      shutdownContract,
      degradedOperationContract,
      maintenanceStateContract,
      diagnostics,
      operationalMetadata,
      operationalEndpoints,
      executiveExperiencePackageRef,
      evidenceIntegrationPackageRef,
      decisionPackageRef,
      auditRefs,
      readinessStatus,
      createdAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      descriptive: true as const,
      prescriptive: false as const,
      performsDeployments: false as const,
      mutatesConfiguration: false as const,
    });

    await this.packages.set(operationalReadinessPackageId, pkg);
    this.latestPackageId = operationalReadinessPackageId;

    const correlationId =
      decisionPackageRef ??
      evidenceIntegrationPackageRef ??
      operationalReadinessPackageId;

    this.publishFact(OPERATIONAL_EVENT_TYPES.readinessCreated, {
      correlationId,
      causationId: operationalReadinessPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: operationalReadinessPackageId,
      actorId,
      payload: {
        operationalReadinessPackageId,
        readinessStatus,
        descriptive: true,
        prescriptive: false,
      },
    });

    this.publishFact(OPERATIONAL_EVENT_TYPES.healthContractUpdated, {
      correlationId,
      causationId: operationalReadinessPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: healthContract.contractId,
      actorId,
      payload: {
        contractId: healthContract.contractId,
        state: healthContract.state,
        descriptive: true,
      },
    });

    this.publishFact(OPERATIONAL_EVENT_TYPES.readinessContractPublished, {
      correlationId,
      causationId: operationalReadinessPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: readinessContract.contractId,
      actorId,
      payload: {
        contractId: readinessContract.contractId,
        state: readinessContract.state,
        descriptive: true,
      },
    });

    this.publishFact(OPERATIONAL_EVENT_TYPES.packageCompleted, {
      correlationId,
      causationId: operationalReadinessPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: operationalReadinessPackageId,
      actorId,
      payload: {
        operationalReadinessPackageId,
        note: "Operational Readiness Package completed — descriptive only",
      },
    });

    return pkg;
  }

  getOperationalReadinessPackage(
    operationalReadinessPackageId: string,
  ): OperationalReadinessPackage {
    const pkg = this.packages.get(operationalReadinessPackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "OPERATIONAL_READINESS_PACKAGE_NOT_FOUND",
        `Operational readiness package not found: ${operationalReadinessPackageId}`,
        { operationalReadinessPackageId },
      );
    }
    return pkg;
  }

  /** Latest package, if any — read-only. */
  getLatestOperationalReadinessPackage(): OperationalReadinessPackage | undefined {
    if (!this.latestPackageId) return undefined;
    return this.packages.get(this.latestPackageId);
  }

  getHealth(operationalReadinessPackageId?: string): OperationalContract {
    return this.resolvePackage(operationalReadinessPackageId).healthContract;
  }

  getReadiness(operationalReadinessPackageId?: string): OperationalContract {
    return this.resolvePackage(operationalReadinessPackageId).readinessContract;
  }

  getLiveness(operationalReadinessPackageId?: string): OperationalContract {
    return this.resolvePackage(operationalReadinessPackageId).livenessContract;
  }

  getDiagnosticsSnapshot(
    operationalReadinessPackageId?: string,
  ): OperationalDiagnosticsSnapshot {
    return this.resolvePackage(operationalReadinessPackageId).diagnostics;
  }

  getVersionMetadata(operationalReadinessPackageId?: string): VersionMetadata {
    return this.resolvePackage(operationalReadinessPackageId).operationalMetadata
      .version;
  }

  getOperationalMetadata(operationalReadinessPackageId?: string): OperationalMetadata {
    return this.resolvePackage(operationalReadinessPackageId).operationalMetadata;
  }

  listOperationalReadinessPackages(): readonly OperationalReadinessPackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): OperationalPlatformDiagnostics {
    let healthy = true;
    for (const pkg of this.packages.values()) {
      if (
        !pkg.descriptive ||
        pkg.prescriptive ||
        pkg.performsDeployments ||
        pkg.mutatesConfiguration
      ) {
        healthy = false;
        break;
      }
    }
    return {
      packageCount: this.packages.size,
      healthStatistics: { ...this.healthStatistics },
      readinessStatistics: { ...this.readinessStatistics },
      livenessStatistics: { ...this.livenessStatistics },
      versionStatistics: {
        version: PLATFORM_ORCHESTRATION_VERSION,
        slice: PLATFORM_ORCHESTRATION_SLICE,
        programme: PLATFORM_ORCHESTRATION_PROGRAMME,
      },
      endpointStatistics: { ...this.endpointStatistics },
      eventPublishCount: this.eventPublishCount,
      health: healthy ? "healthy" : "degraded",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  private resolvePackage(
    operationalReadinessPackageId?: string,
  ): OperationalReadinessPackage {
    if (operationalReadinessPackageId) {
      return this.getOperationalReadinessPackage(operationalReadinessPackageId);
    }
    const latest = this.getLatestOperationalReadinessPackage();
    if (!latest) {
      throw new OrchestrationError(
        "validation",
        "OPERATIONAL_READINESS_PACKAGE_NOT_FOUND",
        "No Operational Readiness Package available",
      );
    }
    return latest;
  }

  private publishFact(
    eventType: string,
    args: {
      correlationId: string;
      causationId?: string;
      tenantId: string;
      projectId?: string;
      subjectRef: string;
      actorId?: string;
      payload: Readonly<Record<string, unknown>>;
    },
  ): void {
    this.events.publish({
      eventType,
      correlationId: args.correlationId,
      causationId: args.causationId,
      tenantId: args.tenantId,
      projectId: args.projectId,
      producer: "orchestration.operational",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-016" },
    });
    this.eventPublishCount += 1;
  }
}
