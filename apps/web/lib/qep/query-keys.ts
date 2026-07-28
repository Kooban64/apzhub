import type { QepBaselineListParams, QepListParams } from "./qep-api";

export const qepQueryKeys = {
  all: () => ["qep"] as const,
  requirements: {
    all: () => [...qepQueryKeys.all(), "requirements"] as const,
    list: (params?: QepListParams) =>
      [...qepQueryKeys.requirements.all(), "list", params ?? {}] as const,
    search: (params: QepListParams & { q: string }) =>
      [...qepQueryKeys.requirements.all(), "search", params] as const,
    detail: (id: string) =>
      [...qepQueryKeys.requirements.all(), "detail", id] as const,
    transitions: (id: string) =>
      [...qepQueryKeys.requirements.all(), "transitions", id] as const,
    lifecycle: (id: string) =>
      [...qepQueryKeys.requirements.all(), "lifecycle", id] as const,
    versions: (id: string, params?: QepListParams) =>
      [...qepQueryKeys.requirements.all(), "versions", id, params ?? {}] as const,
    version: (id: string, versionNumber: number) =>
      [...qepQueryKeys.requirements.all(), "version", id, versionNumber] as const,
    comparison: (id: string, baseVersionNumber: number, targetVersionNumber: number) =>
      [...qepQueryKeys.requirements.all(), "comparison", id, baseVersionNumber, targetVersionNumber] as const,
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
      [...qepQueryKeys.baselines.all(), "compare", baseBaselineId, targetBaselineId] as const,
  },
  relationships: {
    all: () => [...qepQueryKeys.all(), "relationships"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.relationships.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.relationships.all(), "detail", id] as const,
    byRequirement: (requirementId: string, direction?: string) =>
      [...qepQueryKeys.relationships.all(), "byRequirement", requirementId, direction ?? "both"] as const,
    taxonomy: () => [...qepQueryKeys.relationships.all(), "taxonomy"] as const,
    conflicts: () => [...qepQueryKeys.relationships.all(), "conflicts"] as const,
  },
  traceability: {
    all: () => [...qepQueryKeys.all(), "traceability"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.traceability.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.traceability.all(), "detail", id] as const,
    history: (id: string) => [...qepQueryKeys.traceability.all(), "history", id] as const,
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
    history: (id: string) => [...qepQueryKeys.verification.all(), "history", id] as const,
  },
  specifications: {
    all: () => [...qepQueryKeys.all(), "specifications"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.specifications.all(), "list", params ?? {}] as const,
    search: (params?: Record<string, unknown>) =>
      [...qepQueryKeys.specifications.all(), "search", params ?? {}] as const,
    detail: (id: string) => [...qepQueryKeys.specifications.all(), "detail", id] as const,
    history: (id: string) => [...qepQueryKeys.specifications.all(), "history", id] as const,
    versions: (id: string) => [...qepQueryKeys.specifications.all(), "versions", id] as const,
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
};
