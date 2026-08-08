/**
 * Enterprise Source Change Coordination (QO-012).
 *
 * Answers: which normalized source changes are associated with this Quality Flow
 * and Decision Package?
 * Never inspects repositories. Never invokes SCM providers.
 */

import type {
  CreateSourceChangePackageInput,
  SourceChangeAssociation,
  SourceChangeAuditEntry,
  SourceChangeDiagnostics,
  SourceChangePackage,
  SourceIdentity,
} from "../contracts/source-change";
import { OrchestrationError } from "../contracts/errors";
import { SOURCE_CHANGE_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import { derivePrimaryRefs, normalizeSourceIdentities } from "./identity-normalizer";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface SourceChangeCoordinatorOptions {
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

export class SourceChangeCoordinator {
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages: DurableMap<SourceChangePackage>;
  private readonly changeTypeDistribution: Record<string, number> = {};
  private identityCount = 0;
  private associationCount = 0;
  private repositoryAssociationCount = 0;
  private eventPublishCount = 0;

  constructor(options: SourceChangeCoordinatorOptions) {
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.packages = new DurableMap<SourceChangePackage>(
      "source_change_package",
      options.documentStore,
      (pkg) => ({
        tenantId: pkg.tenantId,
        projectId: pkg.projectId,
        orchestrationId: this.orchestrationId,
        correlationId: pkg.qualityFlowRef,
        status: pkg.association.qualityFlowRef,
        actorId: pkg.actorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.packages.hydrate();
  }

  /**
   * Create an immutable Source Change Package from normalized identities.
   * Publishes past-tense facts via the Event Backbone only.
   */
  async createSourceChangePackage(
    input: CreateSourceChangePackageInput,
  ): Promise<SourceChangePackage> {
    const qualityFlowRef = input.qualityFlowRef.trim();
    const tenantId = input.tenantId.trim();
    if (!qualityFlowRef || !tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_SOURCE_CHANGE_PACKAGE",
        "qualityFlowRef and tenantId are required",
      );
    }

    if (input.supersedesPackageId) {
      if (!this.packages.has(input.supersedesPackageId)) {
        throw new OrchestrationError(
          "validation",
          "SOURCE_CHANGE_PACKAGE_NOT_FOUND",
          `Prior source change package not found: ${input.supersedesPackageId}`,
          { sourceChangePackageId: input.supersedesPackageId },
        );
      }
    }

    const normalized = normalizeSourceIdentities(input.sourceChanges);
    const derived = derivePrimaryRefs(normalized.identities);

    for (const [kind, count] of Object.entries(normalized.kindDistribution)) {
      this.changeTypeDistribution[kind] =
        (this.changeTypeDistribution[kind] ?? 0) + count;
    }
    this.identityCount += normalized.identities.length;

    const repositoryRef = input.repositoryRef?.trim() || derived.repositoryRef;
    const branchRef = input.branchRef?.trim() || derived.branchRef;
    const commitRef = input.commitRef?.trim() || derived.commitRef;
    const pullOrMergeRequestRef =
      input.pullOrMergeRequestRef?.trim() || derived.pullOrMergeRequestRef;
    const tagOrReleaseRef = input.tagOrReleaseRef?.trim() || derived.tagOrReleaseRef;

    if (repositoryRef) {
      this.repositoryAssociationCount += 1;
    }

    const sourceChangePackageId = createId("scp");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;
    const decisionPackageRef = input.decisionPackageRef?.trim() || undefined;
    const automationCoordinationPackageRef =
      input.automationCoordinationPackageRef?.trim() || undefined;

    const association: SourceChangeAssociation = Object.freeze({
      associationId: createId("sca"),
      qualityFlowRef,
      decisionPackageRef,
      automationCoordinationPackageRef,
      sourceChangeRefs: normalized.sourceChangeRefs,
      associatedAt: now,
      rationale:
        input.rationale?.trim() ||
        `Associated ${normalized.sourceChangeRefs.length} normalized source change(s) with Quality Flow ${qualityFlowRef}`,
    });
    this.associationCount += 1;

    const auditHistory: SourceChangeAuditEntry[] = [
      Object.freeze({
        entryId: createId("scah"),
        timestamp: now,
        action: "source_change_package_created",
        actorId,
        detail: `Identities ${normalized.identities.length}; changes ${normalized.sourceChangeRefs.length}`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("scah"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const changeMetadata: Record<string, string> = { ...(input.metadata ?? {}) };
    for (const identity of normalized.identities) {
      changeMetadata[`identity.${identity.identityId}.kind`] = identity.kind;
    }

    const pkg: SourceChangePackage = Object.freeze({
      sourceChangePackageId,
      qualityFlowRef,
      decisionPackageRef,
      automationCoordinationPackageRef,
      sourceChangeRefs: normalized.sourceChangeRefs,
      identities: normalized.identities,
      repositoryRef,
      branchRef,
      commitRef,
      pullOrMergeRequestRef,
      tagOrReleaseRef,
      association,
      changeMetadata: Object.freeze(changeMetadata),
      createdAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      advisory: true as const,
      scmOperations: false as const,
    });

    await this.packages.set(sourceChangePackageId, pkg);

    const correlationId = decisionPackageRef ?? qualityFlowRef;

    for (const identity of normalized.identities) {
      this.publishFact(SOURCE_CHANGE_EVENT_TYPES.identityNormalized, {
        correlationId,
        causationId: qualityFlowRef,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: identity.identityId,
        actorId,
        payload: {
          sourceChangePackageId,
          kind: identity.kind,
          reference: identity.reference,
        },
      });
    }

    this.publishFact(SOURCE_CHANGE_EVENT_TYPES.changeAssociated, {
      correlationId,
      causationId: qualityFlowRef,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: association.associationId,
      actorId,
      payload: {
        sourceChangePackageId,
        qualityFlowRef,
        decisionPackageRef,
        automationCoordinationPackageRef,
        sourceChangeRefs: normalized.sourceChangeRefs,
      },
    });

    this.publishFact(SOURCE_CHANGE_EVENT_TYPES.packageCreated, {
      correlationId,
      causationId: association.associationId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: sourceChangePackageId,
      actorId,
      payload: {
        sourceChangePackageId,
        qualityFlowRef,
        decisionPackageRef,
        identityCount: normalized.identities.length,
        supersedesPackageId: input.supersedesPackageId,
      },
    });

    if (input.supersedesPackageId) {
      this.publishFact(SOURCE_CHANGE_EVENT_TYPES.packageUpdated, {
        correlationId,
        causationId: input.supersedesPackageId,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: sourceChangePackageId,
        actorId,
        payload: {
          sourceChangePackageId,
          supersedesPackageId: input.supersedesPackageId,
        },
      });
    }

    return pkg;
  }

  getSourceChangePackage(sourceChangePackageId: string): SourceChangePackage {
    const pkg = this.packages.get(sourceChangePackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "SOURCE_CHANGE_PACKAGE_NOT_FOUND",
        `Source change package not found: ${sourceChangePackageId}`,
        { sourceChangePackageId },
      );
    }
    return pkg;
  }

  querySourceChanges(sourceChangePackageId: string): readonly string[] {
    return this.getSourceChangePackage(sourceChangePackageId).sourceChangeRefs;
  }

  getCoordinationHistory(
    sourceChangePackageId: string,
  ): readonly SourceChangeAuditEntry[] {
    return this.getSourceChangePackage(sourceChangePackageId).auditHistory;
  }

  getSourceIdentities(sourceChangePackageId: string): readonly SourceIdentity[] {
    return this.getSourceChangePackage(sourceChangePackageId).identities;
  }

  listSourceChangePackages(): readonly SourceChangePackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): SourceChangeDiagnostics {
    return {
      packageCount: this.packages.size,
      identityCount: this.identityCount,
      changeTypeDistribution: { ...this.changeTypeDistribution },
      repositoryAssociationCount: this.repositoryAssociationCount,
      associationCount: this.associationCount,
      eventPublishCount: this.eventPublishCount,
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
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
      producer: "orchestration.source_change",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-012" },
    });
    this.eventPublishCount += 1;
  }
}
