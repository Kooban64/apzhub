/** Platform Quality Integration Layer service interfaces (APZTCMS-014). */

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  DependencyHealthSummary,
  DependencyValidationResult,
  GovernedProduct,
  MultiProductCertificationAggregate,
  PlatformCrossProductLink,
  PlatformQualityAggregate,
  PlatformQualityDashboardSnapshot,
  PlatformRelease,
  PlatformReleaseApproval,
  PlatformReleaseCandidate,
  PlatformReleaseDecision,
  PlatformReleaseManifest,
  PlatformReleasePackage,
  PlatformReleaseReadinessAggregate,
  PlatformReleaseSummary,
  ProductDependency,
  ProductHealthSummary,
  ProductQualityContribution,
  ProductRegistry,
} from "../domain/platform-quality";
import type {
  GovernedProductId,
  PlatformCrossProductLinkId,
  PlatformReleaseApprovalId,
  PlatformReleaseId,
  PlatformReleasePackageId,
  ProductDependencyId,
  ProductRegistryId,
} from "../identifiers";
import type {
  PlatformGovernanceApprovalKind,
  PlatformProductKey,
  PlatformQualityStatus,
  PlatformReleaseLifecycleStatus,
  PlatformReleaseReadinessVerdict,
} from "../enums";
import type { CertificationRecord } from "../domain/certification";

export interface ProductRegistryUpsertInput {
  readonly key: PlatformProductKey;
  readonly displayName: string;
  readonly owner: string;
  readonly version: string;
  readonly enabled?: boolean;
  readonly qualityStatus?: PlatformQualityStatus;
  readonly certificationStatus?: string;
  readonly releaseReadiness?: PlatformReleaseReadinessVerdict;
  readonly organisationId?: string;
}

export interface ProductRegistryService {
  ensureDefaultRegistry(ctx: ServiceRequestContext): Promise<ProductRegistry>;
  listProducts(ctx: ServiceRequestContext): Promise<readonly GovernedProduct[]>;
  getProduct(
    ctx: ServiceRequestContext,
    id: GovernedProductId,
  ): Promise<GovernedProduct>;
  getProductByKey(
    ctx: ServiceRequestContext,
    key: PlatformProductKey,
  ): Promise<GovernedProduct>;
  upsertProduct(
    ctx: ServiceRequestContext,
    input: ProductRegistryUpsertInput,
  ): Promise<GovernedProduct>;
  setEnabled(
    ctx: ServiceRequestContext,
    id: GovernedProductId,
    enabled: boolean,
  ): Promise<GovernedProduct>;
  getRegistry(ctx: ServiceRequestContext): Promise<ProductRegistry>;
}

export interface ProductDependencyCreateInput {
  readonly fromProductId: GovernedProductId;
  readonly toProductId: GovernedProductId;
  readonly relation: "upstream" | "downstream";
  readonly requirement: "required" | "optional";
  readonly blocked?: boolean;
  readonly notes?: string;
  readonly organisationId?: string;
}

export interface DependencyGraphService {
  addDependency(
    ctx: ServiceRequestContext,
    input: ProductDependencyCreateInput,
  ): Promise<ProductDependency>;
  removeDependency(
    ctx: ServiceRequestContext,
    id: ProductDependencyId,
  ): Promise<void>;
  listDependencies(
    ctx: ServiceRequestContext,
  ): Promise<readonly ProductDependency[]>;
  listForProduct(
    ctx: ServiceRequestContext,
    productId: GovernedProductId,
  ): Promise<readonly ProductDependency[]>;
  validate(
    ctx: ServiceRequestContext,
    productIds?: readonly GovernedProductId[],
  ): Promise<DependencyValidationResult>;
  healthForProduct(
    ctx: ServiceRequestContext,
    productId: GovernedProductId,
  ): Promise<DependencyHealthSummary>;
}

export interface PlatformQualityAggregationInput {
  readonly contributions: readonly ProductQualityContribution[];
}

export interface PlatformQualityAggregationService {
  aggregate(
    ctx: ServiceRequestContext,
    input: PlatformQualityAggregationInput,
  ): Promise<PlatformQualityAggregate>;
}

export interface MultiProductCertificationInput {
  readonly scope: "single_product" | "multiple_products" | "entire_platform";
  readonly productIds: readonly GovernedProductId[];
  readonly records: readonly CertificationRecord[];
}

export interface MultiProductCertificationService {
  aggregate(
    ctx: ServiceRequestContext,
    input: MultiProductCertificationInput,
  ): Promise<MultiProductCertificationAggregate>;
}

export interface ProductHealthService {
  summarize(
    ctx: ServiceRequestContext,
    productId: GovernedProductId,
    input?: {
      readonly qualityStatus?: PlatformQualityStatus;
      readonly coverageLabel?: string;
      readonly testsLabel?: string;
      readonly approvalsLabel?: string;
      readonly certificationStatus?: string;
      readonly knownRisks?: readonly string[];
      readonly knownBlockers?: readonly string[];
    },
  ): Promise<ProductHealthSummary>;
}

export interface PlatformDashboardService {
  snapshot(
    ctx: ServiceRequestContext,
    input: {
      readonly quality?: PlatformQualityAggregate;
      readonly certifications?: MultiProductCertificationAggregate;
      readonly readiness?: PlatformReleaseReadinessAggregate;
      readonly dependencyHealth?: readonly DependencyHealthSummary[];
      readonly recentRegressions?: readonly string[];
    },
  ): Promise<PlatformQualityDashboardSnapshot>;
}

export interface PlatformTraceabilityService {
  link(
    ctx: ServiceRequestContext,
    input: Omit<
      PlatformCrossProductLink,
      "id" | "tenantId" | "createdAt" | "updatedAt"
    > & { readonly id?: PlatformCrossProductLinkId },
  ): Promise<PlatformCrossProductLink>;
  list(ctx: ServiceRequestContext): Promise<readonly PlatformCrossProductLink[]>;
  listForProduct(
    ctx: ServiceRequestContext,
    productKey: PlatformProductKey,
  ): Promise<readonly PlatformCrossProductLink[]>;
}

export interface PlatformReleaseCreateInput {
  readonly key: string;
  readonly name: string;
  readonly productIds?: readonly GovernedProductId[];
  readonly organisationId?: string;
}

export interface PlatformReleaseGovernanceService {
  createRelease(
    ctx: ServiceRequestContext,
    input: PlatformReleaseCreateInput,
  ): Promise<PlatformRelease>;
  getRelease(
    ctx: ServiceRequestContext,
    id: PlatformReleaseId,
  ): Promise<PlatformRelease>;
  listReleases(ctx: ServiceRequestContext): Promise<readonly PlatformRelease[]>;
  addProducts(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    productIds: readonly GovernedProductId[],
  ): Promise<PlatformRelease>;
  removeProducts(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    productIds: readonly GovernedProductId[],
  ): Promise<PlatformRelease>;
  addPackage(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    input: {
      readonly name: string;
      readonly productIds: readonly GovernedProductId[];
      readonly versionLabel: string;
    },
  ): Promise<PlatformReleasePackage>;
  addCandidate(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    label: string,
  ): Promise<PlatformReleaseCandidate>;
  evaluateReadiness(
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
  ): Promise<PlatformReleaseReadinessAggregate>;
  evaluateDependencies(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
  ): Promise<DependencyValidationResult>;
  requestApproval(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    kind: PlatformGovernanceApprovalKind,
  ): Promise<PlatformReleaseApproval>;
  decideApproval(
    ctx: ServiceRequestContext,
    approvalId: PlatformReleaseApprovalId,
    decision: {
      readonly status: "approved" | "rejected" | "withdrawn";
      readonly decidedByUserId: string;
      readonly comments?: string;
    },
  ): Promise<PlatformReleaseApproval>;
  evaluateCertification(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    records: readonly CertificationRecord[],
  ): Promise<MultiProductCertificationAggregate>;
  produceSummary(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    input: {
      readonly readiness: PlatformReleaseReadinessAggregate;
      readonly certificationAggregate?: MultiProductCertificationAggregate;
      readonly dependencyValidation: DependencyValidationResult;
    },
  ): Promise<PlatformReleaseSummary>;
  recommendRelease(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    summary: PlatformReleaseSummary,
  ): Promise<PlatformReleaseSummary>;
  recordHumanDecision(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    input: {
      readonly verdict: PlatformReleaseReadinessVerdict;
      readonly decidedByUserId: string;
      readonly rationale: string;
    },
  ): Promise<PlatformReleaseDecision>;
  getManifest(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
  ): Promise<PlatformReleaseManifest>;
  transitionStatus(
    ctx: ServiceRequestContext,
    releaseId: PlatformReleaseId,
    status: PlatformReleaseLifecycleStatus,
  ): Promise<PlatformRelease>;
}

export interface PlatformQualityDomainServices {
  readonly productRegistry: ProductRegistryService;
  readonly dependencies: DependencyGraphService;
  readonly qualityAggregation: PlatformQualityAggregationService;
  readonly multiProductCertification: MultiProductCertificationService;
  readonly productHealth: ProductHealthService;
  readonly dashboard: PlatformDashboardService;
  readonly traceability: PlatformTraceabilityService;
  readonly releaseGovernance: PlatformReleaseGovernanceService;
}
