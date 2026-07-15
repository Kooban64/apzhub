import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  CertificationRecord,
  DependencyGraphService,
  DependencyValidationResult,
  MultiProductCertificationAggregate,
  MultiProductCertificationService,
  PlatformGovernanceApprovalKind,
  PlatformProductKey,
  PlatformQualityStatus,
  PlatformRelease,
  PlatformReleaseApproval,
  PlatformReleaseCandidate,
  PlatformReleaseCreateInput,
  PlatformReleaseDecision,
  PlatformReleaseGovernanceService,
  PlatformReleaseLifecycleStatus,
  PlatformReleaseManifest,
  PlatformReleasePackage,
  PlatformReleaseReadinessAggregate,
  PlatformReleaseReadinessVerdict,
  PlatformReleaseSummary,
  ProductRegistryService,
} from "@apzhub/testing-contracts";
import {
  asPlatformReleaseApprovalId,
  asPlatformReleaseCandidateId,
  asPlatformReleaseDecisionId,
  asPlatformReleaseId,
  asPlatformReleasePackageId,
  PLATFORM_GOVERNANCE_APPROVAL_KINDS,
  type GovernedProductId,
  type PlatformReleaseApprovalId,
  type PlatformReleaseId,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";
import type { Clock, IdGenerator } from "../services/types";
import {
  combineReadinessVerdicts,
  qualityStatusToReadiness,
} from "./status";
import type { PlatformQualityStore } from "./store";

export interface ReleaseGovernanceServiceDeps {
  readonly store: PlatformQualityStore;
  readonly now: Clock;
  readonly id: IdGenerator;
  readonly productRegistry: ProductRegistryService;
  readonly dependencies: DependencyGraphService;
  readonly multiProductCertification: MultiProductCertificationService;
}

function recommendationFromVerdict(
  verdict: PlatformReleaseReadinessVerdict,
): PlatformReleaseSummary["recommendationCode"] {
  switch (verdict) {
    case "READY":
      return "recommend_release";
    case "READY_WITH_WARNINGS":
      return "recommend_hold";
    case "NOT_READY":
      return "recommend_reject";
  }
}

function emptyApprovalStatuses(): Record<PlatformGovernanceApprovalKind, string> {
  const statuses = {} as Record<PlatformGovernanceApprovalKind, string>;
  for (const kind of PLATFORM_GOVERNANCE_APPROVAL_KINDS) {
    statuses[kind] = "none";
  }
  return statuses;
}

export function createReleaseGovernanceService(
  deps: ReleaseGovernanceServiceDeps,
): PlatformReleaseGovernanceService {
  const {
    store,
    now,
    id,
    productRegistry,
    dependencies,
    multiProductCertification,
  } = deps;

  function requireRelease(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
  ): PlatformRelease {
    const release = store.releases.get(releaseId);
    if (!release || release.tenantId !== ctx.tenantId) {
      throw new DomainRuleError(
        "release_not_found",
        `Platform release ${releaseId} not found`,
        { releaseId },
      );
    }
    return release;
  }

  function saveRelease(release: PlatformRelease): PlatformRelease {
    store.releases.set(release.id, release);
    return release;
  }

  async function productKeysForScope(
    ctx: ServiceRequestContext,
    productIds: readonly GovernedProductId[],
  ): Promise<PlatformProductKey[]> {
    const keys: PlatformProductKey[] = [];
    for (const productId of productIds) {
      const product = await productRegistry.getProduct(ctx, productId);
      keys.push(product.key);
    }
    return keys;
  }

  function approvalStatusesForRelease(
    release: PlatformRelease,
  ): Record<PlatformGovernanceApprovalKind, string> {
    const statuses = emptyApprovalStatuses();
    for (const approvalId of release.approvalIds) {
      const approval = store.approvals.get(approvalId);
      if (!approval) continue;
      statuses[approval.kind] = approval.status;
    }
    return statuses;
  }

  function approvalCompletenessPercent(release: PlatformRelease): number {
    const statuses = approvalStatusesForRelease(release);
    const kinds = PLATFORM_GOVERNANCE_APPROVAL_KINDS;
    const approved = kinds.filter((k) => statuses[k] === "approved").length;
    return Math.round((approved / kinds.length) * 100);
  }

  const service: PlatformReleaseGovernanceService = {
    async createRelease(
      ctx: ServiceRequestContext,
      input: PlatformReleaseCreateInput,
    ): Promise<PlatformRelease> {
      await productRegistry.ensureDefaultRegistry(ctx);
      const timestamp = now();
      const releaseId = asPlatformReleaseId(id());
      const productIds = input.productIds ?? [];
      for (const productId of productIds) {
        await productRegistry.getProduct(ctx, productId);
      }
      const release: PlatformRelease = {
        id: releaseId,
        tenantId: ctx.tenantId,
        key: input.key,
        name: input.name,
        status: "draft",
        scope: { productIds },
        packageIds: [],
        candidateIds: [],
        approvalIds: [],
        decisionIds: [],
        notes: [],
        evidenceRefs: [],
        dependencyIds: [],
        organisationId: input.organisationId ?? ctx.organisationId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      return saveRelease(release);
    },

    async getRelease(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
    ): Promise<PlatformRelease> {
      return requireRelease(ctx, releaseId);
    },

    async listReleases(
      ctx: ServiceRequestContext,
    ): Promise<readonly PlatformRelease[]> {
      return [...store.releases.values()].filter(
        (r) => r.tenantId === ctx.tenantId,
      );
    },

    async addProducts(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      productIds: readonly GovernedProductId[],
    ): Promise<PlatformRelease> {
      const release = requireRelease(ctx, releaseId);
      for (const productId of productIds) {
        await productRegistry.getProduct(ctx, productId);
      }
      const merged = [
        ...new Set([...release.scope.productIds, ...productIds]),
      ];
      return saveRelease({
        ...release,
        scope: { ...release.scope, productIds: merged },
        updatedAt: now(),
        updatedBy: ctx.userId,
      });
    },

    async removeProducts(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      productIds: readonly GovernedProductId[],
    ): Promise<PlatformRelease> {
      const release = requireRelease(ctx, releaseId);
      const removeSet = new Set(productIds);
      return saveRelease({
        ...release,
        scope: {
          ...release.scope,
          productIds: release.scope.productIds.filter(
            (id) => !removeSet.has(id),
          ),
        },
        updatedAt: now(),
        updatedBy: ctx.userId,
      });
    },

    async addPackage(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      input: {
        readonly name: string;
        readonly productIds: readonly GovernedProductId[];
        readonly versionLabel: string;
      },
    ): Promise<PlatformReleasePackage> {
      const release = requireRelease(ctx, releaseId);
      const timestamp = now();
      const packageId = asPlatformReleasePackageId(id());
      const pkg: PlatformReleasePackage = {
        id: packageId,
        releaseId,
        name: input.name,
        productIds: input.productIds,
        versionLabel: input.versionLabel,
        tenantId: ctx.tenantId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.packages.set(packageId, pkg);
      saveRelease({
        ...release,
        packageIds: [...release.packageIds, packageId],
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      });
      return pkg;
    },

    async addCandidate(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      label: string,
    ): Promise<PlatformReleaseCandidate> {
      const release = requireRelease(ctx, releaseId);
      const timestamp = now();
      const candidateId = asPlatformReleaseCandidateId(id());
      const candidate: PlatformReleaseCandidate = {
        id: candidateId,
        releaseId,
        label,
        scope: { productIds: [...release.scope.productIds] },
        status: "candidate",
        tenantId: ctx.tenantId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.candidates.set(candidateId, candidate);
      saveRelease({
        ...release,
        candidateIds: [...release.candidateIds, candidateId],
        status:
          release.status === "draft" || release.status === "scoping"
            ? "candidate"
            : release.status,
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      });
      return candidate;
    },

    async evaluateReadiness(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      input: {
        readonly productReadiness?: Readonly<
          Partial<Record<string, PlatformReleaseReadinessVerdict>>
        >;
        readonly qualityStatus?: PlatformQualityStatus;
        readonly riskLabels?: readonly string[];
        readonly coverageLabels?: readonly string[];
        readonly certificationLabel?: string;
        readonly openIssueCount?: number;
        readonly dependencyValidation?: DependencyValidationResult;
      },
    ): Promise<PlatformReleaseReadinessAggregate> {
      const release = requireRelease(ctx, releaseId);
      const dependencyValidation =
        input.dependencyValidation ??
        (await service.evaluateDependencies(ctx, releaseId));

      const productReadiness = input.productReadiness ?? {};
      const productVerdicts = Object.values(productReadiness).filter(
        (v): v is PlatformReleaseReadinessVerdict => v !== undefined,
      );

      const qualityStatus = input.qualityStatus ?? "unknown";
      const qualityVerdict = qualityStatusToReadiness(qualityStatus);
      const dependencyReadiness: PlatformReleaseReadinessVerdict =
        dependencyValidation.valid
          ? dependencyValidation.messages.length > 0
            ? "READY_WITH_WARNINGS"
            : "READY"
          : "NOT_READY";

      const blockingFactors: string[] = [];
      const warningFactors: string[] = [];

      if (!dependencyValidation.valid) {
        blockingFactors.push(...dependencyValidation.messages);
      }
      if (qualityStatus === "blocked" || qualityStatus === "at_risk") {
        blockingFactors.push(`quality:${qualityStatus}`);
      } else if (qualityStatus === "degraded" || qualityStatus === "unknown") {
        warningFactors.push(`quality:${qualityStatus}`);
      }
      for (const [productId, verdict] of Object.entries(productReadiness)) {
        if (verdict === "NOT_READY") {
          blockingFactors.push(`product_not_ready:${productId}`);
        } else if (verdict === "READY_WITH_WARNINGS") {
          warningFactors.push(`product_warnings:${productId}`);
        }
      }
      if ((input.openIssueCount ?? 0) > 0) {
        warningFactors.push(`open_issues:${input.openIssueCount}`);
      }

      const verdict = combineReadinessVerdicts([
        ...productVerdicts,
        qualityVerdict,
        dependencyReadiness,
        blockingFactors.length > 0
          ? "NOT_READY"
          : warningFactors.length > 0
            ? "READY_WITH_WARNINGS"
            : "READY",
      ]);

      return {
        releaseId,
        productReadiness,
        dependencyReadiness,
        qualityStatus,
        riskLabels: input.riskLabels ?? [],
        coverageLabels: input.coverageLabels ?? [],
        certificationLabel: input.certificationLabel ?? "n/a",
        approvalCompletenessPercent: approvalCompletenessPercent(release),
        openIssueCount: input.openIssueCount ?? 0,
        verdict,
        blockingFactors,
        warningFactors,
        computedAt: now(),
        isDecision: false,
      };
    },

    async evaluateDependencies(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
    ): Promise<DependencyValidationResult> {
      const release = requireRelease(ctx, releaseId);
      const validation = await dependencies.validate(
        ctx,
        release.scope.productIds,
      );
      const related = await dependencies.listDependencies(ctx);
      const scoped = related.filter(
        (d) =>
          release.scope.productIds.includes(d.fromProductId) ||
          release.scope.productIds.includes(d.toProductId),
      );
      saveRelease({
        ...release,
        dependencyIds: scoped.map((d) => d.id),
        updatedAt: now(),
        updatedBy: ctx.userId,
      });
      return validation;
    },

    async requestApproval(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      kind: PlatformGovernanceApprovalKind,
    ): Promise<PlatformReleaseApproval> {
      const release = requireRelease(ctx, releaseId);
      const timestamp = now();
      const approvalId = asPlatformReleaseApprovalId(id());
      const approval: PlatformReleaseApproval = {
        id: approvalId,
        releaseId,
        kind,
        status: "pending",
        tenantId: ctx.tenantId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.approvals.set(approvalId, approval);
      saveRelease({
        ...release,
        approvalIds: [...release.approvalIds, approvalId],
        status:
          release.status === "draft" ||
          release.status === "scoping" ||
          release.status === "candidate"
            ? "in_review"
            : release.status,
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      });
      return approval;
    },

    async decideApproval(
      ctx: ServiceRequestContext,
      approvalId: PlatformReleaseApprovalId,
      decision: {
        readonly status: "approved" | "rejected" | "withdrawn";
        readonly decidedByUserId: string;
        readonly comments?: string;
      },
    ): Promise<PlatformReleaseApproval> {
      const approval = store.approvals.get(approvalId);
      if (!approval) {
        throw new DomainRuleError(
          "approval_not_found",
          `Platform release approval ${approvalId} not found`,
          { approvalId },
        );
      }
      const release = requireRelease(ctx, approval.releaseId);
      if (approval.status !== "pending") {
        throw new DomainRuleError(
          "invalid_approval_state",
          `Approval ${approvalId} is not pending`,
          { approvalId, status: approval.status },
        );
      }
      const timestamp = now();
      const updated: PlatformReleaseApproval = {
        ...approval,
        status: decision.status,
        decidedByUserId: decision.decidedByUserId,
        decidedAt: timestamp,
        comments: decision.comments,
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      };
      store.approvals.set(approvalId, updated);
      saveRelease({
        ...release,
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      });
      return updated;
    },

    async evaluateCertification(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      records: readonly CertificationRecord[],
    ): Promise<MultiProductCertificationAggregate> {
      const release = requireRelease(ctx, releaseId);
      const scope =
        release.scope.productIds.length <= 1
          ? "single_product"
          : release.scope.productIds.length >= 8
            ? "entire_platform"
            : "multiple_products";
      return multiProductCertification.aggregate(ctx, {
        scope,
        productIds: release.scope.productIds,
        records,
      });
    },

    async produceSummary(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      input: {
        readonly readiness: PlatformReleaseReadinessAggregate;
        readonly certificationAggregate?: MultiProductCertificationAggregate;
        readonly dependencyValidation: DependencyValidationResult;
      },
    ): Promise<PlatformReleaseSummary> {
      const release = requireRelease(ctx, releaseId);
      const recommendationCode = recommendationFromVerdict(
        input.readiness.verdict,
      );
      const recommendationReasons = [
        ...input.readiness.blockingFactors.map((f) => `blocking:${f}`),
        ...input.readiness.warningFactors.map((f) => `warning:${f}`),
        `verdict:${input.readiness.verdict}`,
      ];
      return {
        releaseId,
        readiness: input.readiness,
        certificationAggregate: input.certificationAggregate,
        approvalStatuses: approvalStatusesForRelease(release),
        dependencyValidation: input.dependencyValidation,
        recommendationCode,
        recommendationReasons,
        computedAt: now(),
        isDecision: false,
      };
    },

    async recommendRelease(
      _ctx: ServiceRequestContext,
      _releaseId: PlatformReleaseId,
      summary: PlatformReleaseSummary,
    ): Promise<PlatformReleaseSummary> {
      const recommendationCode = recommendationFromVerdict(
        summary.readiness.verdict,
      );
      return {
        ...summary,
        recommendationCode,
        recommendationReasons: [
          ...summary.recommendationReasons,
          `advisory:${recommendationCode}`,
        ],
        computedAt: now(),
        isDecision: false,
      };
    },

    async recordHumanDecision(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      input: {
        readonly verdict: PlatformReleaseReadinessVerdict;
        readonly decidedByUserId: string;
        readonly rationale: string;
      },
    ): Promise<PlatformReleaseDecision> {
      const release = requireRelease(ctx, releaseId);
      const timestamp = now();
      const decisionId = asPlatformReleaseDecisionId(id());
      const decision: PlatformReleaseDecision = {
        id: decisionId,
        releaseId,
        verdict: input.verdict,
        decidedByUserId: input.decidedByUserId,
        decidedAt: timestamp,
        rationale: input.rationale,
        isAutomatic: false,
        tenantId: ctx.tenantId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.decisions.set(decisionId, decision);
      saveRelease({
        ...release,
        decisionIds: [...release.decisionIds, decisionId],
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      });
      return decision;
    },

    async getManifest(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
    ): Promise<PlatformReleaseManifest> {
      const release = requireRelease(ctx, releaseId);
      const productKeys = await productKeysForScope(
        ctx,
        release.scope.productIds,
      );
      return {
        releaseId,
        productKeys,
        packageIds: release.packageIds,
        dependencyIds: release.dependencyIds,
        generatedAt: now(),
      };
    },

    async transitionStatus(
      ctx: ServiceRequestContext,
      releaseId: PlatformReleaseId,
      status: PlatformReleaseLifecycleStatus,
    ): Promise<PlatformRelease> {
      const release = requireRelease(ctx, releaseId);
      if (status === "released") {
        const hasHumanDecision = release.decisionIds.some((decisionId) => {
          const decision = store.decisions.get(decisionId);
          return decision !== undefined && decision.isAutomatic === false;
        });
        if (!hasHumanDecision) {
          throw new DomainRuleError(
            "automatic_release_forbidden",
            "Platform release cannot transition to released without a human decision",
            { releaseId },
          );
        }
      }
      return saveRelease({
        ...release,
        status,
        updatedAt: now(),
        updatedBy: ctx.userId,
      });
    },
  };

  return service;
}
