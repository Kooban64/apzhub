/**
 * Platform QEP Services factories (APZQEP-ENG-020B).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createQepRequirementServiceAdapter,
  createRequirementApplicationService,
  createRequirementBaselineApplicationService,
  createRequirementRelationshipApplicationService,
} from "@apzhub/qep-requirements";
import type {
  PersistedRequirement,
  RequirementBaseline,
  StoredRequirementsRelationship,
} from "@apzhub/qep-requirements";
import {
  createQepRequirementsPersistenceForProduction,
  createQepRequirementsPersistenceForTest,
  type QepRequirementsPersistenceBundle,
} from "@apzhub/qep-requirements";
import type { StoredTraceLink, TraceEndpointResolver } from "@apzhub/qep-traceability";
import type { StoredTestSpecification } from "@apzhub/qep-test-specifications/domain";
import type { StoredTestPlan } from "@apzhub/qep-test-plans/domain";
import type {
  StoredVerification,
  VerificationSubjectResolver,
} from "@apzhub/qep-verification";
import type { QepTestExecutionPortOverrides } from "@apzhub/qep-test-execution";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepTraceabilityPlatformServicesForProduction,
  createQepTraceabilityPlatformServicesForTest,
} from "./create-qep-traceability-platform-services";
import {
  createQepTestSpecificationPlatformServicesForProduction,
  createQepTestSpecificationPlatformServicesForTest,
  wrapQepTestSpecificationPlatformServiceWithPipeline,
} from "./create-qep-test-specification-platform-services";
import {
  createQepTestPlanPlatformServicesForProduction,
  createQepTestPlanPlatformServicesForTest,
  wrapQepTestPlanPlatformServiceWithPipeline,
} from "./create-qep-test-plan-platform-services";
import {
  createQepTestExecutionPlatformServicesForProduction,
  createQepTestExecutionPlatformServicesForTest,
  wrapQepTestExecutionPlatformServiceWithPipeline,
} from "./create-qep-test-execution-platform-services";
import {
  createQepEvidencePlatformServicesForProduction,
  createQepEvidencePlatformServicesForTest,
  wrapQepEvidencePlatformServiceWithPipeline,
} from "./create-qep-evidence-platform-services";
import {
  createQepVerificationPlatformServicesForProduction,
  createQepVerificationPlatformServicesForTest,
  wrapQepVerificationPlatformServiceWithPipeline,
} from "./create-qep-verification-platform-services";
import {
  createQepRequirementPlatformService,
  type QepRequirementPlatformService,
} from "./qep-service-impl";
import { wrapQepTraceabilityPlatformServiceWithPipeline } from "./create-qep-traceability-platform-services";
import type { QepTraceabilityPlatformService } from "./qep-traceability-service-impl";
import type { QepTestSpecificationPlatformService } from "./qep-test-specification-service-impl";
import type { QepTestPlanPlatformService } from "./qep-test-plan-service-impl";
import type { QepTestExecutionPlatformService } from "./qep-test-execution-service-impl";
import type { QepVerificationPlatformService } from "./qep-verification-service-impl";
import type { QepEvidencePlatformService } from "./qep-evidence-service-impl";

export type QepPlatformGatewaySurface = {
  readonly requirements: QepRequirementPlatformService;
  readonly traceability: QepTraceabilityPlatformService;
  readonly verification: QepVerificationPlatformService;
  readonly specifications: QepTestSpecificationPlatformService;
  readonly plans: QepTestPlanPlatformService;
  readonly executions: QepTestExecutionPlatformService;
  readonly evidence: QepEvidencePlatformService;
};

export type QepPlatformServicesBundle = {
  readonly persistence: QepRequirementsPersistenceBundle;
  readonly gatewaySurface: QepPlatformGatewaySurface;
  readonly readiness: {
    readonly qepEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepPlatformGatewaySurface;
};

type TraceabilityWiringInput = {
  readonly onTraceLinkUpserted?: (trace: StoredTraceLink) => void | Promise<void>;
  readonly traceabilityEndpointResolver?: TraceEndpointResolver;
  readonly onVerificationUpserted?: (
    verification: StoredVerification,
  ) => void | Promise<void>;
  readonly verificationSubjectResolver?: VerificationSubjectResolver;
  readonly onSpecificationUpserted?: (
    specification: StoredTestSpecification,
  ) => void | Promise<void>;
  readonly onPlanUpserted?: (plan: StoredTestPlan) => void | Promise<void>;
  readonly allocatePlanNumber?: (ctx: {
    readonly tenantId: string;
  }) => Promise<string> | string;
  readonly execution?: QepTestExecutionPortOverrides;
};

export type CreateQepPlatformServicesInput = TraceabilityWiringInput & {
  readonly persistence: QepRequirementsPersistenceBundle;
  readonly persistenceMode?: "postgres" | "memory";
  /** Backing db for the Traceability sub-bundle when persistenceMode is "postgres". */
  readonly postgresDb?: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onUpserted?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onArchived?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onBaselineUpserted?: (baseline: RequirementBaseline) => void | Promise<void>;
  readonly onRelationshipUpserted?: (
    relationship: StoredRequirementsRelationship,
  ) => void | Promise<void>;
};

export type CreateQepPlatformServicesForProductionInput = TraceabilityWiringInput & {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onUpserted?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onArchived?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onBaselineUpserted?: (baseline: RequirementBaseline) => void | Promise<void>;
  readonly onRelationshipUpserted?: (
    relationship: StoredRequirementsRelationship,
  ) => void | Promise<void>;
};

export type CreateQepPlatformServicesForTestInput = TraceabilityWiringInput & {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onUpserted?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onArchived?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onBaselineUpserted?: (baseline: RequirementBaseline) => void | Promise<void>;
  readonly onRelationshipUpserted?: (
    relationship: StoredRequirementsRelationship,
  ) => void | Promise<void>;
};

export function wrapQepPlatformGatewayWithPipeline(
  gateway: QepPlatformGatewaySurface,
  pipeline: RequestPipeline,
): QepPlatformGatewaySurface {
  return {
    requirements: wrapServiceWithPipeline(
      gateway.requirements,
      pipeline,
      "qepRequirement",
    ) as QepRequirementPlatformService,
    traceability: wrapQepTraceabilityPlatformServiceWithPipeline(
      gateway.traceability,
      pipeline,
    ),
    verification: wrapQepVerificationPlatformServiceWithPipeline(
      gateway.verification,
      pipeline,
    ),
    specifications: wrapQepTestSpecificationPlatformServiceWithPipeline(
      gateway.specifications,
      pipeline,
    ),
    plans: wrapQepTestPlanPlatformServiceWithPipeline(gateway.plans, pipeline),
    executions: wrapQepTestExecutionPlatformServiceWithPipeline(
      gateway.executions,
      pipeline,
    ),
    evidence: wrapQepEvidencePlatformServiceWithPipeline(gateway.evidence, pipeline),
  };
}

function buildBundle(input: {
  readonly persistence: QepRequirementsPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly postgresDb?: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onUpserted?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onArchived?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onBaselineUpserted?: (baseline: RequirementBaseline) => void | Promise<void>;
  readonly onRelationshipUpserted?: (
    relationship: StoredRequirementsRelationship,
  ) => void | Promise<void>;
  readonly onTraceLinkUpserted?: (trace: StoredTraceLink) => void | Promise<void>;
  readonly traceabilityEndpointResolver?: TraceEndpointResolver;
  readonly onVerificationUpserted?: (
    verification: StoredVerification,
  ) => void | Promise<void>;
  readonly verificationSubjectResolver?: VerificationSubjectResolver;
  readonly onSpecificationUpserted?: (
    specification: StoredTestSpecification,
  ) => void | Promise<void>;
  readonly onPlanUpserted?: (plan: StoredTestPlan) => void | Promise<void>;
  readonly allocatePlanNumber?: (ctx: {
    readonly tenantId: string;
  }) => Promise<string> | string;
  readonly execution?: QepTestExecutionPortOverrides;
}): QepPlatformServicesBundle {
  const application = createRequirementApplicationService({
    requirements: input.persistence.requirements,
    audits: input.persistence.audits,
    lifecycleHistory: input.persistence.lifecycleHistory,
    contentVersions: input.persistence.contentVersions,
    now: input.now,
    id: input.id,
    onUpserted: input.onUpserted,
    onArchived: input.onArchived,
  });
  const baselineApplication = createRequirementBaselineApplicationService({
    baselines: input.persistence.baselines,
    contentVersions: input.persistence.contentVersions,
    audits: input.persistence.audits,
    now: input.now,
    id: input.id,
    onBaselineUpserted: input.onBaselineUpserted,
  });
  const relationshipApplication = createRequirementRelationshipApplicationService({
    relationships: input.persistence.relationships,
    relationshipTaxonomy: input.persistence.relationshipTaxonomy,
    requirements: input.persistence.requirements,
    contentVersions: input.persistence.contentVersions,
    baselines: input.persistence.baselines,
    audits: input.persistence.audits,
    now: input.now,
    id: input.id,
    onRelationshipUpserted: input.onRelationshipUpserted,
  });
  const adapter = createQepRequirementServiceAdapter(
    application,
    baselineApplication,
    relationshipApplication,
  );
  const requirements = createQepRequirementPlatformService(adapter);

  const traceabilityBundle =
    input.persistenceMode === "postgres" && input.postgresDb
      ? createQepTraceabilityPlatformServicesForProduction({
          postgresDb: input.postgresDb,
          now: input.now,
          id: input.id,
          onTraceLinkUpserted: input.onTraceLinkUpserted,
          endpointResolver: input.traceabilityEndpointResolver,
        })
      : createQepTraceabilityPlatformServicesForTest({
          allowInMemoryPersistence: true,
          now: input.now,
          id: input.id,
          onTraceLinkUpserted: input.onTraceLinkUpserted,
          endpointResolver: input.traceabilityEndpointResolver,
        });

  const verificationBundle =
    input.persistenceMode === "postgres" && input.postgresDb
      ? createQepVerificationPlatformServicesForProduction({
          postgresDb: input.postgresDb,
          now: input.now,
          id: input.id,
          onVerificationUpserted: input.onVerificationUpserted,
          subjectResolver: input.verificationSubjectResolver,
        })
      : createQepVerificationPlatformServicesForTest({
          allowInMemoryPersistence: true,
          now: input.now,
          id: input.id,
          onVerificationUpserted: input.onVerificationUpserted,
          subjectResolver: input.verificationSubjectResolver,
        });

  const specificationBundle =
    input.persistenceMode === "postgres" && input.postgresDb
      ? createQepTestSpecificationPlatformServicesForProduction({
          postgresDb: input.postgresDb,
          now: input.now,
          id: input.id,
          onSpecificationUpserted: input.onSpecificationUpserted,
        })
      : createQepTestSpecificationPlatformServicesForTest({
          allowInMemoryPersistence: true,
          now: input.now,
          id: input.id,
          onSpecificationUpserted: input.onSpecificationUpserted,
        });

  const planBundle =
    input.persistenceMode === "postgres" && input.postgresDb
      ? createQepTestPlanPlatformServicesForProduction({
          postgresDb: input.postgresDb,
          now: input.now,
          id: input.id,
          allocateNumber: input.allocatePlanNumber,
          onPlanUpserted: input.onPlanUpserted,
        })
      : createQepTestPlanPlatformServicesForTest({
          allowInMemoryPersistence: true,
          now: input.now,
          id: input.id,
          allocateNumber: input.allocatePlanNumber,
          onPlanUpserted: input.onPlanUpserted,
        });

  const executionBundle =
    input.persistenceMode === "postgres" && input.postgresDb
      ? createQepTestExecutionPlatformServicesForProduction({
          postgresDb: input.postgresDb,
          ...input.execution,
        })
      : createQepTestExecutionPlatformServicesForTest({
          allowInMemoryPersistence: true,
          ...input.execution,
        });

  // Evidence: memory-backed Application runtime until storage selection (ADR-0088).
  const evidenceBundle =
    input.persistenceMode === "postgres"
      ? createQepEvidencePlatformServicesForProduction()
      : createQepEvidencePlatformServicesForTest();

  const gatewaySurface: QepPlatformGatewaySurface = {
    requirements,
    traceability: traceabilityBundle.service,
    verification: verificationBundle.service,
    specifications: specificationBundle.service,
    plans: planBundle.service,
    executions: executionBundle.service,
    evidence: evidenceBundle.service,
  };

  return {
    persistence: input.persistence,
    gatewaySurface,
    readiness: {
      qepEnabled: true,
      persistenceMode: input.persistenceMode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createQepPlatformServices(
  input: CreateQepPlatformServicesInput,
): QepPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    postgresDb: input.postgresDb,
    now: input.now,
    id: input.id,
    onUpserted: input.onUpserted,
    onArchived: input.onArchived,
    onBaselineUpserted: input.onBaselineUpserted,
    onRelationshipUpserted: input.onRelationshipUpserted,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
    traceabilityEndpointResolver: input.traceabilityEndpointResolver,
    onVerificationUpserted: input.onVerificationUpserted,
    verificationSubjectResolver: input.verificationSubjectResolver,
    onSpecificationUpserted: input.onSpecificationUpserted,
    onPlanUpserted: input.onPlanUpserted,
    allocatePlanNumber: input.allocatePlanNumber,
    execution: input.execution,
  });
}

export function createQepPlatformServicesForProduction(
  input: CreateQepPlatformServicesForProductionInput,
): QepPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createQepPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createQepRequirementsPersistenceForProduction({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    postgresDb: input.postgresDb,
    now: input.now,
    id: input.id,
    onUpserted: input.onUpserted,
    onArchived: input.onArchived,
    onBaselineUpserted: input.onBaselineUpserted,
    onRelationshipUpserted: input.onRelationshipUpserted,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
    traceabilityEndpointResolver: input.traceabilityEndpointResolver,
    onVerificationUpserted: input.onVerificationUpserted,
    verificationSubjectResolver: input.verificationSubjectResolver,
    onSpecificationUpserted: input.onSpecificationUpserted,
    onPlanUpserted: input.onPlanUpserted,
    allocatePlanNumber: input.allocatePlanNumber,
    execution: input.execution,
  });
}

export function createQepPlatformServicesForTest(
  input: CreateQepPlatformServicesForTestInput = {},
): QepPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createQepPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createQepRequirementsPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    postgresDb: input.postgresDb,
    now: input.now,
    id: input.id,
    onUpserted: input.onUpserted,
    onArchived: input.onArchived,
    onBaselineUpserted: input.onBaselineUpserted,
    onRelationshipUpserted: input.onRelationshipUpserted,
    onTraceLinkUpserted: input.onTraceLinkUpserted,
    traceabilityEndpointResolver: input.traceabilityEndpointResolver,
    onVerificationUpserted: input.onVerificationUpserted,
    verificationSubjectResolver: input.verificationSubjectResolver,
    onSpecificationUpserted: input.onSpecificationUpserted,
    onPlanUpserted: input.onPlanUpserted,
    allocatePlanNumber: input.allocatePlanNumber,
    execution: input.execution,
  });
}
