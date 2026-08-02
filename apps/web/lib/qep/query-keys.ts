import type { QepBaselineListParams, QepListParams } from "./qep-api";
import type { QepEvidenceListParams } from "./qep-evidence-api";
import type { QepExecutionPlanListParams } from "./qep-execution-plans-api";
import type { QepDefectListParams } from "./qep-defects-api";
import type { QepEnterpriseRequirementListParams } from "./qep-enterprise-requirements-api";
import type { QepExecutionSessionListParams } from "./qep-execution-workspace-api";
import type { QepSuiteListParams } from "./qep-suites-api";
import type { QepTestExecutionListParams } from "./qep-test-execution-api";

export const qepQueryKeys = {
  all: () => ["qep"] as const,
  requirements: {
    all: () => [...qepQueryKeys.all(), "requirements"] as const,
    list: (params?: QepListParams) =>
      [...qepQueryKeys.requirements.all(), "list", params ?? {}] as const,
    search: (params: QepListParams & { q: string }) =>
      [...qepQueryKeys.requirements.all(), "search", params] as const,
    detail: (id: string) => [...qepQueryKeys.requirements.all(), "detail", id] as const,
    transitions: (id: string) =>
      [...qepQueryKeys.requirements.all(), "transitions", id] as const,
    lifecycle: (id: string) =>
      [...qepQueryKeys.requirements.all(), "lifecycle", id] as const,
    versions: (id: string, params?: QepListParams) =>
      [...qepQueryKeys.requirements.all(), "versions", id, params ?? {}] as const,
    version: (id: string, versionNumber: number) =>
      [...qepQueryKeys.requirements.all(), "version", id, versionNumber] as const,
    comparison: (id: string, baseVersionNumber: number, targetVersionNumber: number) =>
      [
        ...qepQueryKeys.requirements.all(),
        "comparison",
        id,
        baseVersionNumber,
        targetVersionNumber,
      ] as const,
    baselineHistory: (id: string) =>
      [...qepQueryKeys.requirements.all(), "baselineHistory", id] as const,
  },
  baselines: {
    all: () => [...qepQueryKeys.all(), "baselines"] as const,
    list: (params?: QepBaselineListParams) =>
      [...qepQueryKeys.baselines.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.baselines.all(), "detail", id] as const,
    items: (id: string) => [...qepQueryKeys.baselines.all(), "items", id] as const,
    compare: (baseBaselineId: string, targetBaselineId: string) =>
      [
        ...qepQueryKeys.baselines.all(),
        "compare",
        baseBaselineId,
        targetBaselineId,
      ] as const,
  },
  relationships: {
    all: () => [...qepQueryKeys.all(), "relationships"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.relationships.all(), "list", params ?? {}] as const,
    detail: (id: string) =>
      [...qepQueryKeys.relationships.all(), "detail", id] as const,
    byRequirement: (requirementId: string, direction?: string) =>
      [
        ...qepQueryKeys.relationships.all(),
        "byRequirement",
        requirementId,
        direction ?? "both",
      ] as const,
    taxonomy: () => [...qepQueryKeys.relationships.all(), "taxonomy"] as const,
    conflicts: () => [...qepQueryKeys.relationships.all(), "conflicts"] as const,
  },
  traceability: {
    all: () => [...qepQueryKeys.all(), "traceability"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.traceability.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.traceability.all(), "detail", id] as const,
    history: (id: string) =>
      [...qepQueryKeys.traceability.all(), "history", id] as const,
    taxonomy: () => [...qepQueryKeys.traceability.all(), "taxonomy"] as const,
    byEndpoint: (kind: string, artefactId: string, direction?: string) =>
      [
        ...qepQueryKeys.traceability.all(),
        "byEndpoint",
        kind,
        artefactId,
        direction ?? "both",
      ] as const,
    matrix: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.traceability.all(), "matrix", params ?? {}] as const,
  },
  verification: {
    all: () => [...qepQueryKeys.all(), "verification"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.verification.all(), "list", params ?? {}] as const,
    search: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.verification.all(), "search", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.verification.all(), "detail", id] as const,
    history: (id: string) =>
      [...qepQueryKeys.verification.all(), "history", id] as const,
  },
  specifications: {
    all: () => [...qepQueryKeys.all(), "specifications"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.specifications.all(), "list", params ?? {}] as const,
    search: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.specifications.all(), "search", params ?? {}] as const,
    detail: (id: string) =>
      [...qepQueryKeys.specifications.all(), "detail", id] as const,
    history: (id: string) =>
      [...qepQueryKeys.specifications.all(), "history", id] as const,
    versions: (id: string) =>
      [...qepQueryKeys.specifications.all(), "versions", id] as const,
  },
  plans: {
    all: () => [...qepQueryKeys.all(), "plans"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.plans.all(), "list", params ?? {}] as const,
    search: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.plans.all(), "search", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.plans.all(), "detail", id] as const,
    history: (id: string) => [...qepQueryKeys.plans.all(), "history", id] as const,
    versions: (id: string) => [...qepQueryKeys.plans.all(), "versions", id] as const,
  },
  executions: {
    all: () => [...qepQueryKeys.all(), "executions"] as const,
    list: (params?: QepTestExecutionListParams) =>
      [...qepQueryKeys.executions.all(), "list", params ?? {}] as const,
    assigned: (params?: QepTestExecutionListParams) =>
      [...qepQueryKeys.executions.all(), "assigned", params ?? {}] as const,
    reviewQueue: (params?: QepTestExecutionListParams) =>
      [...qepQueryKeys.executions.all(), "reviewQueue", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.executions.all(), "detail", id] as const,
    history: (id: string) => [...qepQueryKeys.executions.all(), "history", id] as const,
    availableActions: (id: string) =>
      [...qepQueryKeys.executions.all(), "availableActions", id] as const,
    steps: (id: string) => [...qepQueryKeys.executions.all(), "steps", id] as const,
    manifest: (id: string) =>
      [...qepQueryKeys.executions.all(), "manifest", id] as const,
    planProgress: (planId: string) =>
      [...qepQueryKeys.executions.all(), "planProgress", planId] as const,
  },
  evidence: {
    all: () => [...qepQueryKeys.all(), "evidence"] as const,
    list: (params?: QepEvidenceListParams) =>
      [...qepQueryKeys.evidence.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.evidence.all(), "detail", id] as const,
    availableActions: (id: string) =>
      [...qepQueryKeys.evidence.all(), "availableActions", id] as const,
    relationships: (id: string) =>
      [...qepQueryKeys.evidence.all(), "relationships", id] as const,
    provenance: (id: string) =>
      [...qepQueryKeys.evidence.all(), "provenance", id] as const,
    audit: (id: string, params?: { limit?: number; offset?: number }) =>
      [...qepQueryKeys.evidence.all(), "audit", id, params ?? {}] as const,
    versions: (id: string) => [...qepQueryKeys.evidence.all(), "versions", id] as const,
    collection: (id: string) =>
      [...qepQueryKeys.evidence.all(), "collection", id] as const,
    set: (id: string) => [...qepQueryKeys.evidence.all(), "set", id] as const,
  },
  suites: {
    all: () => [...qepQueryKeys.all(), "suites"] as const,
    list: (params?: QepSuiteListParams) =>
      [...qepQueryKeys.suites.all(), "list", params ?? {}] as const,
    tree: () => [...qepQueryKeys.suites.all(), "tree"] as const,
    detail: (id: string) => [...qepQueryKeys.suites.all(), "detail", id] as const,
  },
  executionPlans: {
    all: () => [...qepQueryKeys.all(), "executionPlans"] as const,
    list: (params?: QepExecutionPlanListParams) =>
      [...qepQueryKeys.executionPlans.all(), "list", params ?? {}] as const,
    detail: (id: string) =>
      [...qepQueryKeys.executionPlans.all(), "detail", id] as const,
  },
  executionWorkspace: {
    all: () => [...qepQueryKeys.all(), "executionWorkspace"] as const,
    list: (params?: QepExecutionSessionListParams) =>
      [...qepQueryKeys.executionWorkspace.all(), "list", params ?? {}] as const,
    detail: (id: string) =>
      [...qepQueryKeys.executionWorkspace.all(), "detail", id] as const,
  },
  defects: {
    all: () => [...qepQueryKeys.all(), "defects"] as const,
    list: (params?: QepDefectListParams) =>
      [...qepQueryKeys.defects.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.defects.all(), "detail", id] as const,
    history: (id: string) => [...qepQueryKeys.defects.all(), "history", id] as const,
  },
  enterpriseRequirements: {
    all: () => [...qepQueryKeys.all(), "enterpriseRequirements"] as const,
    list: (params?: QepEnterpriseRequirementListParams) =>
      [...qepQueryKeys.enterpriseRequirements.all(), "list", params ?? {}] as const,
    detail: (id: string) =>
      [...qepQueryKeys.enterpriseRequirements.all(), "detail", id] as const,
    traceability: (id: string) =>
      [...qepQueryKeys.enterpriseRequirements.all(), "traceability", id] as const,
    matrix: (params?: QepEnterpriseRequirementListParams) =>
      [...qepQueryKeys.enterpriseRequirements.all(), "matrix", params ?? {}] as const,
    coverageDashboard: (params?: QepEnterpriseRequirementListParams) =>
      [
        ...qepQueryKeys.enterpriseRequirements.all(),
        "coverageDashboard",
        params ?? {},
      ] as const,
  },
};
